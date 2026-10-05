// AI の下読み（#107）。候補1件ごとに、ラベル・理由・観点・タグ候補を付ける。
//
// - 判定基準は reviewPrompt.mjs（仮置き。#108 で詰める）。
// - 利用者の入力は一切使わない。渡すのは公開記事の情報だけ。
// - タグ候補はスキーマ外の値を落とし、articleTags.js の制約（any の排他・個数の上限）に合わせて整える。
// - 週1回の実行で急がないので、Message Batches API で投げる（料金が半額）。
//   ふつうは数分〜1時間で終わるが、最長24時間かかりうる。待ちきれなければ取り消して止める。

import Anthropic from '@anthropic-ai/sdk'
import { ARTICLE_MULTI_AXES, HEALTH_ALLOWED_SOURCE_TYPES, HEALTH_TOPIC, TAG_ANY } from '../../src/data/articleTags.js'
import { fetchPage } from './fetchPage.mjs'
import { EXCLUSION_FLAGS, LABEL_UNCHECKED, REVIEW_SCHEMA, SYSTEM_PROMPT, buildUserMessage } from './reviewPrompt.mjs'

// Haiku 4.5 ではラベルが甘く、病名を軸にした記事やコピーサイトを通していたので Sonnet にした。
// 分類なので effort は low。思考は Sonnet 5.5 では切れない（adaptive のまま）
const MODEL = 'claude-sonnet-5-5'
const EFFORT = 'low'
// 記事ページを同時に何件まで取得するか
const FETCH_CONCURRENCY = 5
// バッチの完了を確かめる間隔と、待つ上限。上限は Actions の timeout-minutes より短くする
const POLL_INTERVAL_MS = 30_000
const MAX_WAIT_MS = 3 * 60 * 60 * 1000

// AI のタグ候補を articleTags.js の制約に合わせる。直したことは warnings に残す
export function normalizeTags(tags) {
  const out = { ...tags }
  const warnings = []
  for (const [axis, { values, max }] of Object.entries(ARTICLE_MULTI_AXES)) {
    let v = [...new Set((tags[axis] ?? []).filter((x) => values.includes(x)))]
    if (v.includes(TAG_ANY) && v.length > 1) {
      v = v.filter((x) => x !== TAG_ANY)
      warnings.push(`${axis}: any をほかの値と一緒に付けていたので外した`)
    }
    if (max != null && v.length > max) {
      v = v.slice(0, max)
      warnings.push(`${axis}: ${max} 個までに切った`)
    }
    if (v.length === 0) warnings.push(`${axis}: 候補なし`)
    out[axis] = v
  }
  if (out.topics.includes(HEALTH_TOPIC) && !HEALTH_ALLOWED_SOURCE_TYPES.includes(out.sourceType)) {
    warnings.push(`topics に health があるが、sourceType が ${out.sourceType}（健康の記事は ${HEALTH_ALLOWED_SOURCE_TYPES.join(' / ')} に限る）`)
  }
  return { tags: out, warnings }
}

// AI のラベルと観点から、シートに書くラベルを決める
// - 除外の観点があれば、「使える」でも「除外候補」に寄せる
// - 除外の観点が無く、本文が取れなかっただけなら「要確認」にする
export function decideLabel(aiLabel, flags) {
  const hasExclusion = flags.some((f) => EXCLUSION_FLAGS.includes(f))
  if (hasExclusion) return aiLabel === '使える' ? '除外候補' : aiLabel
  if (flags.includes('no_content')) return LABEL_UNCHECKED
  return aiLabel
}

const buildParams = (candidate, page) => ({
  model: MODEL,
  max_tokens: 8000,
  system: SYSTEM_PROMPT,
  messages: [{ role: 'user', content: buildUserMessage(candidate, page) }],
  output_config: { effort: EFFORT, format: { type: 'json_schema', schema: REVIEW_SCHEMA } },
})

// 1件ぶんの応答を review にする。読めない応答は例外にする（呼び出し側で review.error に入れる）
function toReview(message, page) {
  if (message.stop_reason === 'refusal') {
    throw new Error(`下読みを断られました（${message.stop_details?.category ?? '理由不明'}）`)
  }
  if (message.stop_reason !== 'end_turn') {
    throw new Error(`下読みが途中で止まりました（stop_reason: ${message.stop_reason}）`)
  }
  const text = message.content.find((b) => b.type === 'text')?.text
  const parsed = JSON.parse(text)
  const { tags, warnings } = normalizeTags(parsed.tags)

  return {
    label: decideLabel(parsed.label, parsed.flags),
    aiLabel: parsed.label,
    reason: parsed.reason,
    flags: parsed.flags,
    tags,
    warnings,
    pageFetched: page.ok ? page.kind : `失敗: ${page.error}`,
    siteName: page.siteName ?? null,
  }
}

async function fetchPages(candidates, onProgress) {
  const pages = new Array(candidates.length)
  let next = 0
  let done = 0
  async function worker() {
    while (next < candidates.length) {
      const i = next++
      pages[i] = await fetchPage(candidates[i].url)
      onProgress?.(++done, candidates.length)
    }
  }
  await Promise.all(Array.from({ length: FETCH_CONCURRENCY }, worker))
  return pages
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// candidates に review を付けて返す。1件の失敗で全体を止めず、その候補は review.error に理由を残す。
// バッチ自体を作れない（キーや残高の問題など）・待ちきれないときは例外にする
export async function reviewCandidates(candidates, { onProgress, log = console.error } = {}) {
  const usage = { input_tokens: 0, output_tokens: 0 }
  if (candidates.length === 0) return { reviewed: [], usage }

  const client = new Anthropic()
  const pages = await fetchPages(candidates, (done, total) => onProgress?.('ページ取得', done, total))

  const batch = await client.messages.batches.create({
    requests: candidates.map((c, i) => ({ custom_id: `c-${i}`, params: buildParams(c, pages[i]) })),
  })
  log(`  バッチ ${batch.id} を作成しました`)

  const started = Date.now()
  let status = batch
  while (status.processing_status !== 'ended') {
    if (Date.now() - started > MAX_WAIT_MS) {
      await client.messages.batches.cancel(batch.id)
      throw new Error(`バッチ ${batch.id} が ${MAX_WAIT_MS / 60_000} 分で終わらなかったので取り消しました`)
    }
    await sleep(POLL_INTERVAL_MS)
    status = await client.messages.batches.retrieve(batch.id)
    const { processing, succeeded, errored } = status.request_counts
    onProgress?.('下読み', succeeded + errored, processing + succeeded + errored)
  }

  const results = candidates.map((c) => ({ ...c, review: { error: 'バッチの結果が無い' } }))
  for await (const entry of await client.messages.batches.results(batch.id)) {
    const i = Number(entry.custom_id.slice(2))
    const { result } = entry
    if (result.type !== 'succeeded') {
      const detail = result.type === 'errored' ? `: ${JSON.stringify(result.error).slice(0, 300)}` : ''
      results[i].review = { error: `${result.type}${detail}` }
      continue
    }
    usage.input_tokens += result.message.usage.input_tokens
    usage.output_tokens += result.message.usage.output_tokens
    try {
      results[i].review = toReview(result.message, pages[i])
    } catch (e) {
      results[i].review = { error: e.message }
    }
  }
  return { reviewed: results, usage }
}

// Sonnet 5.5: 入力 $2 / 出力 $10（100万トークンあたり）の、Batches API での半額。
// output_tokens には思考の分も含まれる
export const estimateCost = ({ input_tokens, output_tokens }) =>
  ((input_tokens * 2 + output_tokens * 10) / 1_000_000) * 0.5
