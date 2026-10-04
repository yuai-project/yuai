// 相談フォームの回答から記事を最大3件選ぶ推薦処理（#104）。
//
// - AI は使わない。変換表とスコア表は #95 のコメントで合意したもの。
// - 純関数のみ。日時・乱数を使わず、入力を書き換えない。同じ入力なら同じ順序で返る。
// - 自動で除外するのは「approved でない記事」と「健康を選んだ相談での、許可外の発信元」だけ。
//   stance / burden は専門家の確認（#93 / #99）が済むまで減点にとどめる。
// - 重み・減点・最大件数は WEIGHTS の1か所だけに書く。

import {
  ARTICLE_SINGLE_AXES,
  HEALTH_ALLOWED_SOURCE_TYPES,
  HEALTH_TOPIC,
  TAG_ANY,
} from './articleTags.js'
import { FALLBACK_ARTICLE_IDS, mockArticles } from './articles.js'

export const WEIGHTS = {
  supportTypes: 4, // 求めるサポートと重なる
  concerns: 3, // 困りごとが重なる
  concernsAny: 1,
  exhaustedSelfCare: 3, // 疲れている × self_care
  stance: 2, // これからの関係と向きが一致
  relationships: 2,
  relationshipsAny: 1,
  topics: 2,
  topicsAny: 1,
  moreDistanceKeepConnection: -3, // かなり距離を置きたい × keep_connection
  exhaustedHeavy: -3, // 疲れている × burden: heavy
  maxResults: 3,
}

// reasons に入る値。一致した軸の名前と、選ばれ方の印。
export const REASONS = {
  supportTypes: 'supportTypes',
  concerns: 'concerns',
  selfCare: 'self_care',
  stance: 'stance',
  relationships: 'relationships',
  topics: 'topics',
  safetySlot: 'safety_slot',
  fallback: 'fallback',
}

// penalties に入る値。効いた減点の名前。
export const PENALTIES = {
  moreDistanceKeepConnection: 'more_distance_keep_connection',
  exhaustedHeavy: 'exhausted_heavy',
}

// フォームの desiredSupport → 記事の supportTypes。ai_consultation と unsure は対応なし。
const SUPPORT_TYPE_BY_DESIRED = {
  coping_tips: 'coping_tips',
  read_stories: 'experience',
  talk_with_peers: 'peer_support',
  talk_with_experienced: 'peer_support',
  professional_referral: 'consultation_service',
}

// フォームの desiredRelationship → 記事の stance。unsure は指定なし。
const STANCE_BY_DESIRED = {
  keep: 'keep_connection',
  improve: 'keep_connection',
  some_distance: 'distance',
  more_distance: 'distance',
}

const UNSPECIFIED = new Set(['other', 'unsure'])

const specifiedValues = (values) =>
  Array.isArray(values) ? [...new Set(values.filter((v) => v && !UNSPECIFIED.has(v)))] : []

const specifiedValue = (value) => (value && !UNSPECIFIED.has(value) ? value : null)

// buildAdviceRequest() の戻り値 → 推薦に使うプロファイル。
// other / unsure / 未入力は「指定なし」（null か []）にそろえる。
export function toRecommendationProfile(request = {}) {
  const concerns = specifiedValues(request.concerns)
  const desiredSupport = specifiedValues(request.desiredSupport)
  const topics = specifiedValues(request.topics)
  const desiredRelationship = specifiedValue(request.desiredRelationship)

  const exhausted = concerns.includes('self_exhausted')
  const noSupportPerson = request.hasSupportPerson === 'no'

  return {
    relationship: specifiedValue(request.relationship),
    topics,
    concerns,
    supportTypes: [
      ...new Set(desiredSupport.map((v) => SUPPORT_TYPE_BY_DESIRED[v]).filter(Boolean)),
    ],
    stance: STANCE_BY_DESIRED[desiredRelationship] ?? null,
    wantsMoreDistance: desiredRelationship === 'more_distance',
    exhausted,
    restrictHealthSources: topics.includes(HEALTH_TOPIC),
    needsSafetySlot:
      desiredSupport.includes('professional_referral') ||
      concerns.includes('money_worries') ||
      (exhausted && noSupportPerson),
  }
}

const isAny = (values) => values.length === 1 && values[0] === TAG_ANY
const overlaps = (a, b) => a.some((v) => b.includes(v))

// 複数値の軸の一致。'real'（実際の値で一致）/ 'any' / null。
// 相談側が指定なしの軸は、any の記事も含めて一致とみなさない。
function matchAxis(articleValues, wanted) {
  if (wanted.length === 0) return null
  if (isAny(articleValues)) return 'any'
  return overlaps(articleValues, wanted) ? 'real' : null
}

function scoreArticle(article, profile) {
  let score = 0
  const reasons = []
  const penalties = []
  const add = (points, reason) => {
    score += points
    if (reason) reasons.push(reason)
  }
  const subtract = (points, penalty) => {
    score += points
    penalties.push(penalty)
  }

  const supportMatched = overlaps(article.supportTypes, profile.supportTypes)
  if (supportMatched) add(WEIGHTS.supportTypes, REASONS.supportTypes)

  const concerns = matchAxis(article.concerns, profile.concerns)
  if (concerns === 'real') add(WEIGHTS.concerns, REASONS.concerns)
  if (concerns === 'any') add(WEIGHTS.concernsAny)

  if (profile.exhausted && article.supportTypes.includes('self_care')) {
    add(WEIGHTS.exhaustedSelfCare, REASONS.selfCare)
  }

  if (profile.stance && article.stance === profile.stance) {
    add(WEIGHTS.stance, REASONS.stance)
  }

  const relationships = matchAxis(
    article.relationships,
    profile.relationship ? [profile.relationship] : [],
  )
  if (relationships === 'real') add(WEIGHTS.relationships, REASONS.relationships)
  if (relationships === 'any') add(WEIGHTS.relationshipsAny)

  const topics = matchAxis(article.topics, profile.topics)
  if (topics === 'real') add(WEIGHTS.topics, REASONS.topics)
  if (topics === 'any') add(WEIGHTS.topicsAny)

  if (profile.wantsMoreDistance && article.stance === 'keep_connection') {
    subtract(WEIGHTS.moreDistanceKeepConnection, PENALTIES.moreDistanceKeepConnection)
  }
  if (profile.exhausted && article.burden === 'heavy') {
    subtract(WEIGHTS.exhaustedHeavy, PENALTIES.exhaustedHeavy)
  }

  return { article, score, reasons, penalties, eligible: supportMatched || concerns === 'real' }
}

const burdenRank = (b) => ARTICLE_SINGLE_AXES.burden.indexOf(b)

// 点数の高い順 → burden が軽い順 → reviewedAt が新しい順 → id 順。
// 文字列比較はロケールに依らない < / > で行う。
function compareScored(x, y) {
  if (x.score !== y.score) return y.score - x.score
  const burden = burdenRank(x.article.burden) - burdenRank(y.article.burden)
  if (burden !== 0) return burden
  if (x.article.reviewedAt !== y.article.reviewedAt) {
    return x.article.reviewedAt > y.article.reviewedAt ? -1 : 1
  }
  if (x.article.id === y.article.id) return 0
  return x.article.id < y.article.id ? -1 : 1
}

function isCandidate(article, profile) {
  if (article.status !== 'approved') return false
  if (profile.restrictHealthSources) {
    return HEALTH_ALLOWED_SOURCE_TYPES.includes(article.sourceType)
  }
  return true
}

const toResult = ({ article, score, reasons, penalties }) => ({
  article,
  score,
  reasons,
  penalties,
})

// 戻り値: { articles: [{ article, score, reasons, penalties }], isFallback }
// reasons は一致した軸と選ばれ方、penalties は効いた減点（無ければ []）。
// options.fallbackIds はテスト用。省略時は articles.js の FALLBACK_ARTICLE_IDS。
export function recommendArticles(
  request,
  articles = mockArticles,
  { fallbackIds = FALLBACK_ARTICLE_IDS } = {},
) {
  const profile = toRecommendationProfile(request)
  const scored = articles
    .filter((a) => isCandidate(a, profile))
    .map((a) => scoreArticle(a, profile))
    .sort(compareScored)

  let picked = scored.filter((s) => s.eligible)
  const isFallback = picked.length === 0
  if (isFallback) {
    // 条件は緩めない。人が選んだ固定の記事だけを、決めた順で出す
    picked = fallbackIds
      .map((id) => scored.find((s) => s.article.id === id))
      .filter(Boolean)
      .map((s) => ({ ...s, reasons: [...s.reasons, REASONS.fallback] }))
  }

  if (profile.needsSafetySlot) {
    const safety = scored.find((s) => s.article.supportTypes.includes('consultation_service'))
    if (safety) {
      const rest = picked.filter((s) => s.article.id !== safety.article.id)
      const already = picked.find((s) => s.article.id === safety.article.id)
      picked = [
        { ...(already ?? safety), reasons: [...(already ?? safety).reasons, REASONS.safetySlot] },
        ...rest,
      ]
    }
  }

  return {
    articles: picked.slice(0, WEIGHTS.maxResults).map(toResult),
    isFallback,
  }
}
