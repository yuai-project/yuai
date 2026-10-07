// 判定用シートへの書き込みの形（#107 / #100）。タブは2つ:
//
// - 「レビュー」: 監修者が判定するタブ。AI が「使える」「要確認」としたものだけを入れる。
//   列は監修者が作ったもので、見出しの名前で探して書く（並べ替えても壊れない）
// - 「収集候補」: 集めた候補の全件の台帳。重複判定と、AI が落としたものの確認に使う
//
// 「収集候補」について:
// - 左の4列は監修者が書く。スクリプトは空のまま追記する。
// - Exa の規約（4.2(a)）の許可が出るまで、検索結果の要約文は書かない。
// - 列を足す・動かすときは、シートの見出しも同じ順に直す（違うと追記の前に止まる）。

import {
  CONCERNS,
  DESIRED_SUPPORT,
  RELATIONSHIPS,
  TOPICS,
  labelOf,
} from '../../src/data/consultationIntake.js'
import { TAG_ANY } from '../../src/data/articleTags.js'

export const CANDIDATE_TAB = '収集候補'
export const REVIEW_TAB = 'レビュー'

// 「レビュー」タブに入れる AI のラベル
export const REVIEW_TARGET_LABELS = ['使える', '要確認']

export const JUDGMENT_VALUES = ['承認', '却下', '保留']

const TAG_AXES = ['relationships', 'topics', 'concerns', 'supportTypes', 'stance', 'burden', 'sourceType']

export const HEADER = [
  '判定',
  '判定者',
  '判定日',
  'コメント',
  'AI ラベル',
  'タイトル',
  'URL',
  '発信元',
  'AI の理由',
  'AI の観点',
  '公開日',
  '取得日',
  '検索クエリ',
  ...TAG_AXES.map((axis) => `タグ: ${axis}`),
  '注意',
  '取得状況',
  'AI の元のラベル',
]

export const JUDGMENT_COLUMN = HEADER.indexOf('判定')

// 観点（flags）のシート用の短い名前。定義は reviewPrompt.mjs の REVIEW_FLAGS
const FLAG_NAMES = {
  paywalled: '有料',
  non_expert_qa: '非専門家のQ&A',
  copied_content: 'コピーの疑い',
  promotional: '集客',
  aggregator: 'まとめ',
  diagnostic_framing: '決めつけ',
  debunk_focused: '論破寄り',
  promotes_misinformation: '誤情報をすすめる',
  believer_oriented: '本人向け',
  off_topic: '話題ずれ',
  foreign_language: '外国語',
  health_source_concern: '健康情報の発信元',
  no_content: '本文なし',
}

const join = (v) => (Array.isArray(v) ? v.join(', ') : (v ?? ''))

export function toRow(c) {
  const r = c.review ?? {}
  const tags = r.tags ?? {}
  const row = {
    'AI ラベル': r.label,
    タイトル: c.title,
    URL: c.url,
    発信元: c.publisher,
    'AI の理由': r.reason,
    'AI の観点': join((r.flags ?? []).map((f) => FLAG_NAMES[f] ?? f)),
    公開日: c.publishedAt,
    取得日: c.fetchedAt,
    検索クエリ: `${c.queryAxis}.${c.queryValue}`,
    ...Object.fromEntries(TAG_AXES.map((axis) => [`タグ: ${axis}`, join(tags[axis])])),
    注意: join(r.warnings),
    取得状況: r.pageFetched,
    'AI の元のラベル': r.aiLabel,
  }
  return HEADER.map((h) => row[h] ?? '')
}

// ---- 「レビュー」タブ ----

// スクリプトが書く列。どれかが見出しに無ければ、追記の前に止める
export const REVIEW_REQUIRED_HEADERS = [
  'No',
  'タイトル',
  'URL',
  '発信元',
  '関係性',
  '話題',
  '困りごと',
  '記事の種類',
  'AIの下書きメモ',
]

// 記事の種類（supportTypes）。相談フォームの「求めているサポート」に対応があればそのラベルで書く
const SUPPORT_TYPE_LABELS = {
  coping_tips: labelOf(DESIRED_SUPPORT, 'coping_tips'),
  experience: labelOf(DESIRED_SUPPORT, 'read_stories'),
  peer_support: labelOf(DESIRED_SUPPORT, 'talk_with_peers'),
  consultation_service: labelOf(DESIRED_SUPPORT, 'professional_referral'),
  self_care: 'セルフケア',
  background: '背景の解説',
}

// タグを、監修者が付けている形（相談フォームの日本語ラベル。any は「全般」）にする
const tagLabels = (options, values = []) =>
  values.map((v) => (v === TAG_ANY ? '全般' : labelOf(options, v))).join(', ')

// 候補1件を { 見出し: 値 } にする。no は通し番号
export function toReviewRow(c, no) {
  const r = c.review
  const flags = r.flags.map((f) => FLAG_NAMES[f] ?? f).join('、')
  return {
    No: no,
    タイトル: c.title,
    URL: c.url,
    発信元: r.siteName || c.publisher,
    関係性: tagLabels(RELATIONSHIPS, r.tags.relationships),
    話題: tagLabels(TOPICS, r.tags.topics),
    困りごと: tagLabels(CONCERNS, r.tags.concerns),
    記事の種類: (r.tags.supportTypes ?? []).map((v) => SUPPORT_TYPE_LABELS[v] ?? v).join(', '),
    AIの下書きメモ: `【AI: ${r.label}】${r.reason}${flags ? `（観点: ${flags}）` : ''}`,
  }
}
