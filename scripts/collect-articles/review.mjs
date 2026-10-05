// AI の下読み（#107）。候補1件ごとに、ラベル・理由・観点・タグ候補を付ける。
//
// - 判定基準は reviewPrompt.mjs（仮置き。#108 で詰める）。
// - 利用者の入力は一切使わない。渡すのは公開記事の情報だけ。
// - タグ候補はスキーマ外の値を落とし、articleTags.js の制約（any の排他・個数の上限）に合わせて整える。

import Anthropic from '@anthropic-ai/sdk'
import { ARTICLE_MULTI_AXES, HEALTH_ALLOWED_SOURCE_TYPES, HEALTH_TOPIC, TAG_ANY } from '../../src/data/articleTags.js'
import { fetchPage } from './fetchPage.mjs'
import { EXCLUSION_FLAGS, LABEL_UNCHECKED, REVIEW_SCHEMA, SYSTEM_PROMPT, buildUserMessage } from './reviewPrompt.mjs'

// Haiku 4.5 ではラベルが甘く、病名を軸にした記事やコピーサイトを通していたので Sonnet にした。
// 分類なので effort は low。思考は Sonnet 5.5 では切れない（adaptive のまま）
const MODEL = 'claude-sonnet-5-5'
const EFFORT = 'low'
// 記事ページの取得と API 呼び出しを同時に何件まで走らせるか
const CONCURRENCY = 5

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

async function reviewOne(client, candidate) {
  const page = await fetchPage(candidate.url)
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildUserMessage(candidate, page) }],
    output_config: { effort: EFFORT, format: { type: 'json_schema', schema: REVIEW_SCHEMA } },
  })

  if (response.stop_reason === 'refusal') {
    throw new Error(`下読みを断られました（${response.stop_details?.category ?? '理由不明'}）`)
  }
  if (response.stop_reason !== 'end_turn') {
    throw new Error(`下読みが途中で止まりました（stop_reason: ${response.stop_reason}）`)
  }
  const text = response.content.find((b) => b.type === 'text')?.text
  const parsed = JSON.parse(text)
  const { tags, warnings } = normalizeTags(parsed.tags)

  return {
    review: {
      label: decideLabel(parsed.label, parsed.flags),
      aiLabel: parsed.label,
      reason: parsed.reason,
      flags: parsed.flags,
      tags,
      warnings,
      pageFetched: page.ok ? page.kind : `失敗: ${page.error}`,
    },
    usage: response.usage,
  }
}

// candidates に review を付けて返す。1件の失敗で全体を止めず、その候補は review.error に理由を残す
export async function reviewCandidates(candidates, { onProgress } = {}) {
  const client = new Anthropic()
  const results = new Array(candidates.length)
  const usage = { input_tokens: 0, output_tokens: 0 }
  let next = 0
  let done = 0

  async function worker() {
    while (next < candidates.length) {
      const i = next++
      const c = candidates[i]
      try {
        const r = await reviewOne(client, c)
        results[i] = { ...c, review: r.review }
        usage.input_tokens += r.usage.input_tokens
        usage.output_tokens += r.usage.output_tokens
      } catch (e) {
        results[i] = { ...c, review: { error: e.message } }
      }
      onProgress?.(++done, candidates.length)
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker))
  return { reviewed: results, usage }
}

// Sonnet 5.5: 入力 $2 / 出力 $10（100万トークンあたり）。output_tokens には思考の分も含まれる
export const estimateCost = ({ input_tokens, output_tokens }) =>
  (input_tokens * 2 + output_tokens * 10) / 1_000_000
