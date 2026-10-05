// 検索クエリをタグの軸から組み立てる（#107）。
//
// - 軸ごとに値1つにつき1本。組み合わせ（topics × concerns）は件数が増えるわりに結果が似るのでやらない。
// - 各クエリには「どの軸のどの値を狙ったか」を持たせる。AI の下読みでタグ候補を付けるときの手がかりにする。
// - 'any' と 'other' は検索の軸にしない。
// - 扱うのは公開記事を探すための固定の文言だけ。利用者の入力は一切混ぜない。

import { ARTICLE_MULTI_AXES, TAG_ANY } from '../../src/data/articleTags.js'
import { CONCERNS, TOPICS, labelOf } from '../../src/data/consultationIntake.js'

// 検索の主語。人ではなく状況を描写する（「陰謀論者」とは書かない）
const SUBJECT = '家族や友人が陰謀論や極端な情報を信じるようになった'

// topics: 話題ごとに、支える側向けの記事を探す
const topicQuery = (label) => `${SUBJECT}とき、${label}の話題についての接し方`

// concerns: 相談フォームの「困っていること」をそのまま状況として使う
const concernQuery = (label) => `${SUBJECT}とき、${label}場合の向き合い方`

// supportTypes: articleTags.js にラベルが無いので、検索用の言い回しをここで持つ
const SUPPORT_TYPE_QUERIES = {
  coping_tips: `${SUBJECT}ときの具体的な接し方と対処法`,
  self_care: `${SUBJECT}ことで疲れてしまった家族のセルフケア`,
  background: `人が陰謀論や極端な情報を信じるようになる心理的な背景の解説`,
  experience: `${SUBJECT}家族の体験談`,
  peer_support: `${SUBJECT}家族が同じ悩みを持つ人と話せる場`,
  consultation_service: `${SUBJECT}ときの相談窓口や支援団体`,
}

const axisValues = (axis) =>
  ARTICLE_MULTI_AXES[axis].values.filter((v) => v !== TAG_ANY)

export function buildQueries() {
  const queries = [
    ...axisValues('topics').map((value) => ({
      axis: 'topics',
      value,
      text: topicQuery(labelOf(TOPICS, value)),
    })),
    ...axisValues('concerns').map((value) => ({
      axis: 'concerns',
      value,
      text: concernQuery(labelOf(CONCERNS, value)),
    })),
    ...axisValues('supportTypes').map((value) => ({
      axis: 'supportTypes',
      value,
      text: SUPPORT_TYPE_QUERIES[value],
    })),
  ]

  // supportTypes が増えたのに言い回しを足し忘れた場合に気づけるようにする
  const missing = queries.filter((q) => !q.text)
  if (missing.length > 0) {
    throw new Error(
      `検索クエリの言い回しが無い値があります: ${missing.map((q) => `${q.axis}.${q.value}`).join(', ')}`,
    )
  }
  return queries
}
