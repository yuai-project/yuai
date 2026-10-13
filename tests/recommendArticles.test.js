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

  test('政治の話題の相談 → 宗教の窓口が先頭に入らない（安全枠は話題が合う窓口だけ）', () => {
    const religionConsult = {
      ...byId('f-consult'),
      id: 'f-consult-religion',
      topics: ['religion_spiritual'],
    }
    const politicsCoping = {
      ...byId('f-coping-angry'),
      id: 'f-coping-politics',
      topics: ['politics_society'],
      concerns: ['money_worries'],
    }
    const articles = [religionConsult, politicsCoping]
    const intake = { concerns: ['money_worries'], desiredSupport: ['coping_tips'] }

    const politics = recommend({ ...intake, topics: ['politics_society'] }, articles)
    assert.equal(politics.articles[0].article.id, 'f-coping-politics')
    for (const r of politics.articles) assert.ok(!r.reasons.includes(REASONS.safetySlot))

    // 話題が重なる相談では、今までどおり先頭に入る
    const religion = recommend({ ...intake, topics: ['religion_spiritual'] }, articles)
    assert.equal(religion.articles[0].article.id, 'f-consult-religion')
    assert.ok(religion.articles[0].reasons.includes(REASONS.safetySlot))
  })

  describe('話題を選んだ相談には、話題の合わない記事を出さない', () => {
    // 霊感商法の窓口（宗教・スピリチュアルの話題の記事）と、どの話題にも出せる記事
    const reikan = {
      ...byId('f-consult'),
      id: 'f-consult-reikan',
      topics: ['religion_spiritual'],
      concerns: ['money_worries'],
    }
    const anyTopic = { ...byId('f-selfcare'), id: 'f-any-topic', topics: ['any'] }
    const articles = [reikan, anyTopic]
    // フォールバックにも安全枠にも reikan が入りうる状態で確かめる
    const run = (intake) =>
      recommendArticles(requestOf(intake), articles, {
        fallbackIds: ['f-consult-reikan', 'f-any-topic'],
      })

    test('政治＋お金が心配 → 霊感商法の窓口が出ない（通常の候補・安全枠）', () => {
      const result = run({ topics: ['politics_society'], concerns: ['money_worries'] })
      assert.ok(!ids(result).includes('f-consult-reikan'), ids(result).join(','))
      for (const r of result.articles) assert.ok(!r.reasons.includes(REASONS.safetySlot))
    })

    test('政治だけ → フォールバックにも霊感商法の窓口が出ない', () => {
      const result = run({ topics: ['politics_society'] })
      assert.equal(result.isFallback, true)
      assert.deepEqual(ids(result), ['f-any-topic'])
    })

    test('宗教＋お金が心配 → 霊感商法の窓口が先頭に出る', () => {
      const result = run({ topics: ['religion_spiritual'], concerns: ['money_worries'] })
      assert.equal(result.articles[0].article.id, 'f-consult-reikan')
      assert.ok(result.articles[0].reasons.includes(REASONS.safetySlot))
    })

    test('複数の話題を選んだ → どれか1つと重なれば出る', () => {
      const result = run({
        topics: ['politics_society', 'religion_spiritual'],
        concerns: ['money_worries'],
      })
      assert.ok(ids(result).includes('f-consult-reikan'))
    })

    test('話題なし → 今までどおり（困りごとの一致で出る。安全枠には入らない）', () => {
      for (const topics of [[], ['other']]) {
        const result = run({ topics, concerns: ['money_worries'] })
        assert.equal(result.isFallback, false)
        assert.deepEqual(ids(result), ['f-consult-reikan'])
        assert.deepEqual(result.articles[0].reasons, [REASONS.concerns])
      }
    })

    test('話題なし → フォールバックも今までどおり', () => {
      const result = run({})
      assert.equal(result.isFallback, true)
      assert.deepEqual(ids(result), ['f-consult-reikan', 'f-any-topic'])
    })
  })

  describe('相手との関係の合わない記事を出さない', () => {
    // 父についての記事（窓口でもある）と、どの関係にも出せる記事
    const fatherOnly = {
      ...byId('f-consult'),
      id: 'f-father-only',
      relationships: ['father'],
      concerns: ['angry_when_disagreed', 'money_worries'],
    }
    const anyRelation = { ...byId('f-selfcare'), id: 'f-any-relation', relationships: ['any'] }
    const articles = [fatherOnly, anyRelation]
    // フォールバックにも安全枠にも fatherOnly が入りうる状態で確かめる
    const run = (intake) =>
      recommendArticles(requestOf(intake), articles, {
        fallbackIds: ['f-father-only', 'f-any-relation'],
      })

    test('恋人・パートナー＋否定すると怒ってしまう → 父についての記事が出ない（通常の候補）', () => {
      const result = run({ relationship: 'partner', concerns: ['angry_when_disagreed'] })
      assert.ok(!ids(result).includes('f-father-only'), ids(result).join(','))
    })

    test('恋人・パートナー＋お金が心配 → 父についての窓口が安全枠にも入らない', () => {
      const result = run({ relationship: 'partner', concerns: ['money_worries'] })
      assert.ok(!ids(result).includes('f-father-only'), ids(result).join(','))
      for (const r of result.articles) assert.ok(!r.reasons.includes(REASONS.safetySlot))
    })

    test('恋人・パートナーだけ → フォールバックにも父についての記事が出ない', () => {
      const result = run({ relationship: 'partner' })
      assert.equal(result.isFallback, true)
      assert.deepEqual(ids(result), ['f-any-relation'])
    })

    test('父 → 父についての記事が出る', () => {
      const result = run({ relationship: 'father', concerns: ['money_worries'] })
      assert.equal(result.articles[0].article.id, 'f-father-only')
      assert.ok(result.articles[0].reasons.includes(REASONS.relationships))
      assert.ok(result.articles[0].reasons.includes(REASONS.safetySlot))
    })

    test('関係が「その他」・未回答 → 絞らない（今までどおり）', () => {
      for (const relationship of ['other', '']) {
        const result = run({ relationship, concerns: ['angry_when_disagreed'] })
        assert.deepEqual(ids(result), ['f-father-only'], relationship)
        const fallback = run({ relationship })
        assert.deepEqual(ids(fallback), ['f-father-only', 'f-any-relation'], relationship)
      }
    })
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

  test('関係と話題だけが一致 → 話題の一致で採用する（フォールバックにしない）', () => {
    const result = recommend({ relationship: 'mother', topics: ['politics_society'] })
    assert.equal(result.isFallback, false)
    assert.deepEqual(ids(result), ['f-relation-topic'])
    assert.deepEqual(result.articles[0].reasons, [REASONS.relationships, REASONS.topics])
  })

  test('話題だけが一致 → 採用する', () => {
    const result = recommend({ relationship: 'other', topics: ['politics_society'] })
    assert.equal(result.isFallback, false)
    assert.deepEqual(ids(result), ['f-relation-topic'])
    assert.deepEqual(result.articles[0].reasons, [REASONS.topics])
  })

  test('関係だけが一致 → 今までどおりフォールバック', () => {
    const result = recommend({ relationship: 'mother' })
    assert.equal(result.isFallback, true)
    assert.deepEqual(ids(result), FIXTURE_FALLBACK_IDS)
    assert.ok(result.articles.every((r) => r.reasons.includes(REASONS.fallback)))
  })

  test('話題を選んでも、topics: any の記事しか無ければフォールバック（any は一致に数えない）', () => {
    const anyOnly = fixtureArticles.filter((a) => a.topics.includes('any'))
    const result = recommend({ topics: ['politics_society'] }, anyOnly)
    assert.equal(result.isFallback, true)
  })

  test('話題だけが一致した記事は、困りごと・サポートも合う記事より下に来る', () => {
    const result = recommend({
      relationship: 'mother',
      topics: ['politics_society'],
      concerns: ['angry_when_disagreed'],
      desiredSupport: ['coping_tips'],
    })
    assert.equal(result.isFallback, false)
    const [top] = result.articles
    assert.notEqual(top.article.id, 'f-relation-topic')
    assert.ok(top.reasons.includes(REASONS.supportTypes))
    assert.ok(top.reasons.includes(REASONS.concerns))
    // 話題だけの記事は採用の対象にはなるが、点数は上位の記事より低い
    const all = recommendArticles(
      requestOf({ relationship: 'mother', topics: ['politics_society'] }),
      fixtureArticles,
      { fallbackIds: FIXTURE_FALLBACK_IDS },
    )
    const topicOnly = all.articles.find((r) => r.article.id === 'f-relation-topic')
    assert.ok(topicOnly)
    assert.ok(topicOnly.score < top.score)
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
      // 話題の一致だけ
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
    // 健康だけを選んだ相談は、話題の一致で、許可された発信元の健康の記事が出る
    const healthOnly = recommend({ topics: ['health'] })
    assert.equal(healthOnly.isFallback, false)
    assert.deepEqual(ids(healthOnly), ['f-health-pro'])
    // 健康の記事が無ければフォールバック。support_org の f-selfcare は発信元で外れる
    const withoutHealthArticle = fixtureArticles.filter((a) => a.id !== 'f-health-pro')
    const fallback = recommend({ topics: ['health'] }, withoutHealthArticle)
    assert.equal(fallback.isFallback, true)
    assert.deepEqual(ids(fallback), ['f-consult'])
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
