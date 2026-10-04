#!/usr/bin/env node
// 記事データ（src/data/articles.json）を articleTags.js のスキーマで検証する。
// 1件でも違反があれば一覧を出して exit 1。CI でも実行する。
//
//   npm run validate:articles                 # src/data/articles.json を検証
//   node scripts/validate-articles.mjs <file> # 任意のファイルを検証（確認用）

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import {
  ARTICLE_MULTI_AXES,
  ARTICLE_OPTIONAL_DATE_FIELDS,
  ARTICLE_REQUIRED_TEXT_FIELDS,
  ARTICLE_SINGLE_AXES,
  EXCLUDED_DOMAINS,
  HEALTH_ALLOWED_SOURCE_TYPES,
  HEALTH_TOPIC,
  TAG_ANY,
} from '../src/data/articleTags.js'
import { FALLBACK_ARTICLE_IDS } from '../src/data/articles.js'

const defaultPath = fileURLToPath(new URL('../src/data/articles.json', import.meta.url))
const path = process.argv[2] ?? defaultPath

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const KNOWN_FIELDS = new Set([
  ...ARTICLE_REQUIRED_TEXT_FIELDS,
  ...ARTICLE_OPTIONAL_DATE_FIELDS,
  ...Object.keys(ARTICLE_MULTI_AXES),
  ...Object.keys(ARTICLE_SINGLE_AXES),
])

const isNonEmptyString = (v) => typeof v === 'string' && v.trim() !== ''

const isValidDate = (v) =>
  typeof v === 'string' &&
  DATE_RE.test(v) &&
  new Date(`${v}T00:00:00Z`).toISOString().startsWith(v)

const isExcludedHost = (host) =>
  EXCLUDED_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`))

function validateArticle(a, label) {
  const errors = []
  const err = (msg) => errors.push(`${label}: ${msg}`)

  for (const key of Object.keys(a)) {
    if (!KNOWN_FIELDS.has(key)) err(`スキーマに無い項目 "${key}"`)
  }

  for (const field of ARTICLE_REQUIRED_TEXT_FIELDS) {
    if (!isNonEmptyString(a[field])) err(`必須項目 "${field}" が空か欠けている`)
  }
  if (isNonEmptyString(a.reviewedAt) && !isValidDate(a.reviewedAt)) {
    err(`reviewedAt "${a.reviewedAt}" が YYYY-MM-DD の日付ではない`)
  }
  for (const field of ARTICLE_OPTIONAL_DATE_FIELDS) {
    if (a[field] !== undefined && !isValidDate(a[field])) {
      err(`${field} "${a[field]}" が YYYY-MM-DD の日付ではない`)
    }
  }

  if (isNonEmptyString(a.url)) {
    let url = null
    try {
      url = new URL(a.url)
    } catch {
      err(`url "${a.url}" を URL として解釈できない`)
    }
    if (url) {
      if (url.protocol !== 'https:') err(`url "${a.url}" が https ではない`)
      const host = url.hostname.toLowerCase()
      if (isExcludedHost(host)) err(`url のドメイン "${host}" は除外ドメイン`)
    }
  }

  for (const [axis, { values, min, max }] of Object.entries(ARTICLE_MULTI_AXES)) {
    const v = a[axis]
    if (!Array.isArray(v)) {
      err(`"${axis}" が配列ではない（必須）`)
      continue
    }
    for (const x of v) {
      if (!values.includes(x)) err(`${axis} にスキーマ外の値 "${x}"`)
    }
    if (new Set(v).size !== v.length) err(`${axis} に同じ値が重複している`)
    if (v.length < min) err(`${axis} は ${min} 個以上必要（${v.length} 個）`)
    if (max != null && v.length > max) {
      err(`${axis} は ${max} 個まで（${v.length} 個）`)
    }
    if (v.includes(TAG_ANY) && v.length > 1) {
      err(`${axis} の "${TAG_ANY}" はほかの値と一緒に付けられない`)
    }
  }

  for (const [axis, values] of Object.entries(ARTICLE_SINGLE_AXES)) {
    const v = a[axis]
    if (v === undefined) err(`必須項目 "${axis}" が欠けている`)
    else if (!values.includes(v)) err(`${axis} にスキーマ外の値 ${JSON.stringify(v)}`)
  }

  if (
    Array.isArray(a.topics) &&
    a.topics.includes(HEALTH_TOPIC) &&
    !HEALTH_ALLOWED_SOURCE_TYPES.includes(a.sourceType)
  ) {
    err(
      `topics に "${HEALTH_TOPIC}" を含む記事の sourceType は ${HEALTH_ALLOWED_SOURCE_TYPES.join(' / ')} に限る（"${a.sourceType}"）`,
    )
  }

  return errors
}

function validateArticles(articles) {
  if (!Array.isArray(articles)) return ['記事データのトップレベルが配列ではない']

  const errors = []
  const seen = { id: new Map(), url: new Map() }

  articles.forEach((a, i) => {
    const label = `[${i}] ${a?.id ?? '(id なし)'}`
    if (a === null || typeof a !== 'object' || Array.isArray(a)) {
      errors.push(`${label}: 記事がオブジェクトではない`)
      return
    }
    errors.push(...validateArticle(a, label))

    for (const key of ['id', 'url']) {
      if (!isNonEmptyString(a[key])) continue
      if (seen[key].has(a[key])) {
        errors.push(`${label}: ${key} "${a[key]}" が [${seen[key].get(a[key])}] と重複`)
      } else {
        seen[key].set(a[key], i)
      }
    }
  })

  for (const id of FALLBACK_ARTICLE_IDS) {
    const a = articles.find((x) => x?.id === id)
    if (!a) errors.push(`フォールバック記事 "${id}" が存在しない`)
    else {
      if (a.status !== 'approved') {
        errors.push(`フォールバック記事 "${id}" が approved ではない（${a.status ?? '未設定'}）`)
      }
      if (a.burden !== 'light') {
        errors.push(`フォールバック記事 "${id}" の burden が light ではない（${a.burden ?? '未設定'}）`)
      }
    }
  }

  return errors
}

let articles
try {
  articles = JSON.parse(await readFile(path, 'utf8'))
} catch (e) {
  console.error(`✗ ${path} を読み込めませんでした: ${e.message}`)
  process.exit(1)
}

const errors = validateArticles(articles)
if (errors.length > 0) {
  console.error(`✗ ${path}: ${errors.length} 件の問題があります`)
  for (const e of errors) console.error(`  - ${e}`)
  process.exit(1)
}
console.log(`✓ ${path}: ${articles.length} 件の記事がスキーマに沿っています`)
