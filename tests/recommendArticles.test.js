// 「フォーム回答→期待する結果」のテスト（#104）。#96 の評価クエリとは別物。
// 期待値は下書きで、専門家の確認（#93 / #99）前。
//
//   npm test

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import {
  ARTICLE_MULTI_AXES,
  ARTICLE_SINGLE_AXES,
  HEALTH_ALLOWED_SOURCE_TYPES,
} from '../src/data/articleTags.js'
import { buildAdviceRequest, initialIntake } from '../src/data/consultationIntake.js'
import {
  PENALTIES,
  REASONS,
  WEIGHTS,
  recommendArticles,
  toRecommendationProfile,
} from '../src/data/recommendArticles.js'
import { FIXTURE_FALLBACK_IDS, fixtureArticles } from './fixtures/recommendArticles.js'

// フォームの入力状態から、実際に送られるリクエストを作る
const requestOf = (intake) => buildAdviceRequest({ ...initialIntake, ...intake })

const recommend = (intake, articles = fixtureArticles) =>
  recommendArticles(requestOf(intake), articles, { fallbackIds: FIXTURE_FALLBACK_IDS })

const ids = (result) => result.articles.map((r) => r.article.id)
const byId = (id) => fixtureArticles.find((a) => a.id === id)

describe('フィクスチャ', () => {
  test('値がすべて articleTags.js のスキーマ内にある', () => {
    for (const a of fixtureArticles) {
      for (const [axis, { values }] of Object.entries(ARTICLE_MULTI_AXES)) {
        for (const v of a[axis]) assert.ok(values.includes(v), `${a.id}.${axis}: ${v}`)
      }
      for (const [axis, values] of Object.entries(ARTICLE_SINGLE_AXES)) {
        assert.ok(values.includes(a[axis]), `${a.id}.${axis}: ${a[axis]}`)
      }
    }
  })
})

describe('toRecommendationProfile', () => {
  test('other / unsure / 未入力は指定なしになる', () => {
    const profile = toRecommendationProfile(
      requestOf({
        relationship: 'other',
        topics: ['other'],
        concerns: ['other'],
        concernsOther: '自由記述',
        desiredRelationship: 'unsure',
        desiredSupport: ['unsure'],
        hasSupportPerson: 'unsure',
      }),
    )
    assert.equal(profile.relationship, null)
    assert.deepEqual(profile.topics, [])
    assert.deepEqual(profile.concerns, [])
    assert.deepEqual(profile.supportTypes, [])
    assert.equal(profile.stance, null)
    assert.equal(profile.needsSafetySlot, false)
  })

  test('#95 の変換表どおりに変換する', () => {
    const profile = toRecommendationProfile(
      requestOf({
        relationship: 'mother',
        topics: ['health', 'other'],
        concerns: ['self_exhausted', 'other'],
        desiredRelationship: 'improve',
        desiredSupport: [
          'coping_tips',
          'read_stories',
          'talk_with_peers',
          'talk_with_experienced',
          'ai_consultation',
        ],
      }),
    )
    assert.equal(profile.relationship, 'mother')
    assert.deepEqual(profile.topics, ['health'])
    assert.deepEqual(profile.concerns, ['self_exhausted'])
    assert.deepEqual(profile.supportTypes, ['coping_tips', 'experience', 'peer_support'])
    assert.equal(profile.stance, 'keep_connection')
    assert.equal(profile.exhausted, true)
    assert.equal(profile.restrictHealthSources, true)
  })
})

describe('recommendArticles', () => {
  test('対処法を知りたい＋否定すると怒る → その困りごとの coping_tips 記事が先頭', () => {
    const result = recommend({
      concerns: ['angry_when_disagreed'],
      desiredSupport: ['coping_tips'],
    })
    const top = result.articles[0]
    assert.equal(result.isFallback, false)
    assert.ok(top.article.supportTypes.includes('coping_tips'))
    assert.ok(top.article.concerns.includes('angry_when_disagreed'))
    assert.deepEqual(top.reasons, [REASONS.supportTypes, REASONS.concerns])
  })

  test('疲れている＋相談できる人がいない → 先頭が consultation_service、self_care を含む', () => {
    const result = recommend({
      concerns: ['self_exhausted'],
      hasSupportPerson: 'no',
    })
    const [top] = result.articles
    assert.ok(top.article.supportTypes.includes('consultation_service'))
    assert.ok(top.reasons.includes(REASONS.safetySlot))
    assert.ok(result.articles.some((r) => r.article.supportTypes.includes('self_care')))
  })

  test('professional_referral を選んだ → 先頭が consultation_service', () => {
    const result = recommend({
      concerns: ['repeats_same_topic'],
      desiredSupport: ['professional_referral'],
    })
    const [top] = result.articles
    assert.equal(top.article.id, 'f-consult')
    assert.ok(top.reasons.includes(REASONS.safetySlot))
  })

  test('かなり距離を置きたい → keep_connection の記事が、同じ条件の distance の記事より下', () => {
    const pair = [byId('f-keep'), byId('f-distance')]
    const result = recommend(
      { concerns: ['relationships_worsening'], desiredRelationship: 'more_distance' },
      pair,
    )
    assert.deepEqual(ids(result), ['f-distance', 'f-keep'])
    const [distance, keep] = result.articles
    assert.equal(
      keep.score,
      distance.score - WEIGHTS.stance + WEIGHTS.moreDistanceKeepConnection,
    )
  })

  test('疲れている → heavy の記事が、同じ条件の moderate の記事より下', () => {
    const pair = [byId('f-heavy'), byId('f-moderate')]
    const result = recommend({ concerns: ['self_exhausted', 'repeats_same_topic'] }, pair)
    assert.deepEqual(ids(result), ['f-moderate', 'f-heavy'])
    const [moderate, heavy] = result.articles
    assert.equal(heavy.score, moderate.score + WEIGHTS.exhaustedHeavy)
  })

  test('効いた減点は penalties に入り、reasons には入らない', () => {
    const result = recommend(
      {
        concerns: ['self_exhausted', 'relationships_worsening', 'repeats_same_topic'],
        desiredRelationship: 'more_distance',
      },
      [byId('f-keep'), byId('f-heavy'), byId('f-distance')],
    )
    const penaltiesOf = (id) => result.articles.find((r) => r.article.id === id).penalties
    assert.deepEqual(penaltiesOf('f-keep'), [PENALTIES.moreDistanceKeepConnection])
    assert.deepEqual(penaltiesOf('f-heavy'), [PENALTIES.exhaustedHeavy])
    assert.deepEqual(penaltiesOf('f-distance'), [])
    const penaltyNames = Object.values(PENALTIES)
    for (const r of result.articles) {
      assert.ok(r.reasons.every((reason) => !penaltyNames.includes(reason)), r.article.id)
    }
  })

  test('関係と話題だけが一致 → フォールバック', () => {
    const result = recommend({ relationship: 'mother', topics: ['politics_society'] })
    assert.equal(result.isFallback, true)
    assert.deepEqual(ids(result), FIXTURE_FALLBACK_IDS)
    assert.ok(result.articles.every((r) => r.reasons.includes(REASONS.fallback)))
  })

  test('関係だけ入力、ほかは「わからない」 → フォールバック', () => {
    const result = recommend({
      relationship: 'father',
      duration: 'unsure',
      hasSupportPerson: 'unsure',
      desiredRelationship: 'unsure',
      desiredSupport: ['unsure'],
    })
    assert.equal(result.isFallback, true)
    assert.deepEqual(ids(result), FIXTURE_FALLBACK_IDS)
  })

  test('paused の記事は、どの入力でも返らない', () => {
    const intakes = [
      {},
      { concerns: ['angry_when_disagreed'], desiredSupport: ['coping_tips'] },
      { concerns: ['money_worries'], desiredSupport: ['professional_referral'] },
      { concerns: ['self_exhausted'], hasSupportPerson: 'no' },
      { topics: ['health'], concerns: ['angry_when_disagreed'] },
    ]
    for (const intake of intakes) {
      assert.ok(!ids(recommend(intake)).includes('f-paused'), JSON.stringify(intake))
    }
  })

  test('健康を選んだ相談 → 許可された発信元以外の記事が返らない', () => {
    const intakes = [
      // 通常の採用（topics: any の media 記事が候補にいる）
      { topics: ['health'], concerns: ['angry_when_disagreed'], desiredSupport: ['coping_tips'] },
      // フォールバック（support_org の f-selfcare が候補にいる）
      { topics: ['health'] },
      // 安全枠
      { topics: ['health'], concerns: ['self_exhausted'], hasSupportPerson: 'no' },
    ]
    for (const intake of intakes) {
      const result = recommend(intake)
      assert.ok(result.articles.length > 0, JSON.stringify(intake))
      for (const { article } of result.articles) {
        assert.ok(
          HEALTH_ALLOWED_SOURCE_TYPES.includes(article.sourceType),
          `${article.id}（${article.sourceType}）: ${JSON.stringify(intake)}`,
        )
      }
    }
    assert.deepEqual(ids(recommend({ topics: ['health'] })), ['f-consult'])
  })

  test('同じ入力なら同じ順序で返る。記事の並び順を入れ替えても結果が同じ', () => {
    const intake = {
      relationship: 'mother',
      topics: ['politics_society'],
      concerns: ['repeats_same_topic', 'self_exhausted'],
      desiredSupport: ['read_stories'],
      hasSupportPerson: 'no',
    }
    const first = recommend(intake)
    assert.deepEqual(recommend(intake), first)
    assert.deepEqual(recommend(intake, [...fixtureArticles].reverse()), first)
    const rotated = [...fixtureArticles.slice(5), ...fixtureArticles.slice(0, 5)]
    assert.deepEqual(recommend(intake, rotated), first)
  })

  test('最大3件を超えない。入力のオブジェクトが書き換わっていない', () => {
    const request = requestOf({
      concerns: ['angry_when_disagreed', 'relationships_worsening', 'repeats_same_topic'],
      desiredSupport: ['coping_tips', 'read_stories', 'professional_referral'],
    })
    const requestBefore = structuredClone(request)
    const articlesBefore = structuredClone(fixtureArticles)

    const result = recommendArticles(request, fixtureArticles, {
      fallbackIds: FIXTURE_FALLBACK_IDS,
    })
    assert.equal(result.articles.length, WEIGHTS.maxResults)
    assert.deepEqual(request, requestBefore)
    assert.deepEqual(fixtureArticles, articlesBefore)
  })

  test('articles を省略すると articles.js のデータを使う', () => {
    const result = recommendArticles(requestOf({ concerns: ['self_exhausted'] }))
    assert.ok(result.articles.length > 0)
    assert.ok(result.articles.every((r) => r.article.status === 'approved'))
  })
})
