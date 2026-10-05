// 判定用シートの「収集候補」タブの列の定義と、候補1件を1行にする変換（#107 / #100）。
//
// - 左の4列は監修者が書く。スクリプトは空のまま追記する。
// - Exa の規約（4.2(a)）の許可が出るまで、検索結果の要約文は書かない。
// - 列を足す・動かすときは、シートの見出しも同じ順に直す（違うと追記の前に止まる）。

export const CANDIDATE_TAB = '収集候補'

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
