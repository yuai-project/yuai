// 判定用シートの「レビュー」タブの行を、articles.json の記事の形にする（#168）。純関数だけを置く。
//
// - 関係性・話題・困りごと・記事の種類は、監修者がシートに付けた値をそのまま使う（日本語ラベル → value）。
// - 要約・stance・burden・sourceType はシートに列が無いので、ここでは決めない（summarize.mjs で AI が下書きする）。
// - 既に articles.json にある URL（paused も含む）は取り込まない。載せないと決めた記事は paused で残せば、次から出てこない。

import { ARTICLE_MULTI_AXES, EXCLUDED_DOMAINS, TAG_ANY } from '../../src/data/articleTags.ts'
import { CONCERNS, RELATIONSHIPS, TOPICS } from '../../src/data/consultationIntake.ts'
import { isExcludedHost, normalizeUrl } from '../collect-articles/dedupe.mjs'
import { SUPPORT_TYPE_LABELS } from '../collect-articles/sheetRow.mjs'

export const APPROVED = '承認'

// シートで「どれにも当てはまる」を表す書き方
const ANY_LABEL = '全般'

// 見出しは先頭が一致すれば同じ列とみなす（「コメント（却下・保留は理由を一言）」のような補足を許す）
export function columnIndex(header, key) {
  return header.findIndex((h) => h === key || h.startsWith(`${key}（`) || h.startsWith(`${key}(`))
}

const REQUIRED_HEADERS = ['No', 'タイトル', 'URL', '発信元', '関係性', '話題', '困りごと', '記事の種類', '判定']

// 見出し行と本体の行から、{ 見出し: 値 } の配列にする。必要な見出しが無ければ例外
export function readReviewRows([header = [], ...rows]) {
  const missing = REQUIRED_HEADERS.filter((h) => columnIndex(header, h) === -1)
  if (missing.length > 0) {
    throw new Error(`「レビュー」の見出しに ${missing.map((h) => `"${h}"`).join(' / ')} がありません`)
  }
  return rows.map((r) =>
    Object.fromEntries(REQUIRED_HEADERS.map((h) => [h, String(r[columnIndex(header, h)] ?? '').trim()])),
  )
}

const labelMap = (options) =>
  new Map([...options.filter((o) => o.value !== 'other').map((o) => [o.label, o.value]), [ANY_LABEL, TAG_ANY]])

const LABELS = {
  relationships: labelMap(RELATIONSHIPS),
  topics: labelMap(TOPICS),
  concerns: labelMap(CONCERNS),
  supportTypes: new Map([
    ...Object.entries(SUPPORT_TYPE_LABELS).map(([value, label]) => [label, value]),
    // 監修者がシートで使っている書き方
    ['同じような体験談を読みたい', 'experience'],
  ]),
}

const SHEET_COLUMN = { relationships: '関係性', topics: '話題', concerns: '困りごと', supportTypes: '記事の種類' }

// 「父, 母」→ ['father', 'mother']。読めないラベルと、スキーマの制約（any の排他・上限）で直したことは warnings に残す
export function toTags(row) {
  const tags = {}
  const warnings = []
  for (const [axis, column] of Object.entries(SHEET_COLUMN)) {
    const labels = row[column].split(/[,、]/).map((s) => s.trim()).filter(Boolean)
    let values = []
    for (const label of labels) {
      const value = LABELS[axis].get(label)
      if (value) values.push(value)
      else warnings.push(`${column}「${label}」はタグに無いので外した`)
    }
    values = [...new Set(values)]
    if (values.includes(TAG_ANY) && values.length > 1) {
      values = values.filter((v) => v !== TAG_ANY)
      warnings.push(`${column}: 「${ANY_LABEL}」をほかの値と一緒に付けていたので外した`)
    }
    const { max } = ARTICLE_MULTI_AXES[axis]
    if (max != null && values.length > max) {
      warnings.push(`${column}: ${max} 個までなので「${labels.slice(max).join(', ')}」を外した`)
      values = values.slice(0, max)
    }
    // 空のときは、any を付けられる軸なら any にする。付けられない軸（記事の種類）は空のまま返し、呼び出し側で補う
    if (values.length === 0 && ARTICLE_MULTI_AXES[axis].values.includes(TAG_ANY)) {
      warnings.push(`${column}: 値が無いので「${ANY_LABEL}」にした`)
      values = [TAG_ANY]
    }
    tags[axis] = values
  }
  return { tags, warnings }
}

// シートの No から id を作る（No.16 → r16）。既にある id とぶつかるときは末尾に -2, -3… を付ける
export function toId(no, usedIds) {
  const base = `r${String(no).padStart(2, '0')}`
  let id = base
  for (let i = 2; usedIds.has(id); i++) id = `${base}-${i}`
  usedIds.add(id)
  return id
}

// 取り込む行を選ぶ。承認済みで、URL が articles.json に無く、https で、除外ドメインでないもの。
// シートの中で同じ URL が2回あれば、先の行だけを使う
export function pickNewApproved(rows, articles) {
  const known = new Set(articles.map((a) => normalizeUrl(a.url)).filter(Boolean))
  const picked = []
  const skipped = []
  for (const row of rows) {
    if (row['判定'] !== APPROVED) continue
    const key = normalizeUrl(row.URL)
    if (!key) {
      skipped.push({ row, reason: 'URL を読めない' })
      continue
    }
    if (known.has(key)) continue
    known.add(key)
    // articles.json は https だけを許す（validate-articles.mjs）。シートの URL を直してもらう
    if (new URL(row.URL).protocol !== 'https:') {
      skipped.push({ row, reason: 'https ではない' })
      continue
    }
    if (isExcludedHost(new URL(row.URL).hostname, EXCLUDED_DOMAINS)) {
      skipped.push({ row, reason: '除外ドメイン' })
      continue
    }
    picked.push(row)
  }
  return { picked, skipped }
}

// articles.json と同じ書き方にする（インデント2、文字列だけの配列は1行）。
// 手で書いた既存のファイルを読み直しても差分が出ないこと（tests/syncArticles.test.js）
export function formatArticles(articles) {
  const json = JSON.stringify(articles, null, 2).replace(
    /\[\s*((?:"(?:[^"\\]|\\.)*"\s*,\s*)*"(?:[^"\\]|\\.)*")\s*\]/g,
    (_, inner) => `[${inner.match(/"(?:[^"\\]|\\.)*"/g).join(', ')}]`,
  )
  return `${json}\n`
}

// 日本時間の今日（YYYY-MM-DD）
export const todayJst = (now = new Date()) =>
  new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
