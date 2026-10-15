// 実データ（src/data/articles.json）の取り下げ（paused）のテスト（#150）。
// 週刊誌系の記事（r27・r29・r10）を推薦から外したことを確かめる。
//
//   npm test

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { FALLBACK_ARTICLE_IDS, mockArticles } from '../src/data/articles.js'
import {
  CONCERNS,
  DESIRED_SUPPORT,
  RELATIONSHIPS,
  TOPICS,
  buildAdviceRequest,
  initialIntake,
} from '../src/data/consultationIntake.js'
import { recommendArticles } from '../src/data/recommendArticles.js'

const PAUSED_IDS = ['r27', 'r29', 'r10']
const byId = (id) => mockArticles.find((a) => a.id === id)
const recommendIds = (intake) =>
  recommendArticles(buildAdviceRequest({ ...initialIntake, ...intake })).articles.map(
    (r) => r.article.id,
  )

describe('週刊誌系の記事を推薦から外す', () => {
  test('r27・r29・r10 は paused（データは残す）', () => {
    for (const id of PAUSED_IDS) {
      assert.ok(byId(id), id)
      assert.equal(byId(id).status, 'paused', id)
    }
  })

  test('r09（日経ビジネス）と r17（mi-mollet）は approved のまま', () => {
    assert.equal(byId('r09').status, 'approved')
    assert.equal(byId('r17').status, 'approved')
  })

  test('フォールバックの記事に、paused の記事は入っていない', () => {
    for (const id of FALLBACK_ARTICLE_IDS) {
      assert.ok(!PAUSED_IDS.includes(id), id)
      assert.equal(byId(id).status, 'approved', id)
    }
  })

  test('どんな回答でも、paused の記事は推薦に出ない', () => {
    const values = (options) => options.map((o) => o.value)
    for (const relationship of values(RELATIONSHIPS)) {
      for (const topic of [null, ...values(TOPICS)]) {
        for (const concern of [null, ...values(CONCERNS)]) {
          for (const support of [null, ...values(DESIRED_SUPPORT)]) {
            const ids = recommendIds({
              relationship,
              topics: topic ? [topic] : [],
              concerns: concern ? [concern] : [],
              desiredSupport: support ? [support] : [],
            })
            for (const id of PAUSED_IDS) {
              assert.ok(!ids.includes(id), `${id}: ${relationship} / ${topic} / ${concern} / ${support}`)
            }
          }
        }
      }
    }
  })

  test('子ども・友人を選んでも、関係が any の記事やフォールバックで記事は出る', () => {
    for (const relationship of ['child', 'friend']) {
      assert.ok(recommendIds({ relationship }).length > 0, relationship)
      assert.ok(
        recommendIds({ relationship, concerns: ['unsure_how_to_respond'] }).length > 0,
        relationship,
      )
    }
  })
})
