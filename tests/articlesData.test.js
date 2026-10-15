// 実データ（src/data/articles.json）の取り下げ（paused）のテスト（#150）。
// 週刊誌系の記事（r27・r29・r10）を推薦から外したことを確かめる。
//
//   npm test

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { FALLBACK_ARTICLE_IDS, mockArticles } from '../src/data/articles.ts'
import {
  CONCERNS,
  DESIRED_SUPPORT,
  RELATIONSHIPS,
  TOPICS,
  buildAdviceRequest,
  initialIntake,
} from '../src/data/consultationIntake.ts'
import { recommendArticles } from '../src/data/recommendArticles.ts'

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

describe('書籍（b01・b02）', () => {
  const BOOK_IDS = ['b01', 'b02']

  test('approved の書籍で、著者と出版社があり、medicalInfo は付けない', () => {
    for (const id of BOOK_IDS) {
      const book = byId(id)
      assert.ok(book, id)
      assert.equal(book.status, 'approved', id)
      assert.equal(book.sourceType, 'book', id)
      assert.ok(book.author && book.publisher, id)
      assert.deepEqual(book.supportTypes, ['background'], id)
      assert.ok(book.concerns.includes('unsure_how_to_respond'), id)
      assert.equal(book.medicalInfo, undefined, id)
    }
  })

  test('背景を知ることが手がかりになる相談（どう接すればよいか分からない）で、本が候補に入る', () => {
    // フォームに supportTypes の background に対応する選択肢は無いので、困りごとの一致で入る
    for (const intake of [
      { relationship: 'child', topics: ['politics_society'], concerns: ['unsure_how_to_respond'] },
      { relationship: 'friend', topics: ['health'], concerns: ['unsure_how_to_respond'] },
    ]) {
      const ids = recommendIds(intake)
      for (const id of BOOK_IDS) assert.ok(ids.includes(id), `${id}: ${ids.join(',')}`)
    }
  })

  test('同じ点数なら、書籍より書籍以外の記事を先に出す（母 ＋ 話題なし ＋ どう接すればよいか分からない）', () => {
    const ids = recommendIds({ relationship: 'mother', concerns: ['unsure_how_to_respond'] })
    assert.deepEqual(ids, ['r20', 'r11', 'r12'])
    for (const id of ['r11', 'r12']) {
      for (const book of BOOK_IDS) {
        if (ids.includes(book)) assert.ok(ids.indexOf(id) < ids.indexOf(book), `${id} < ${book}`)
      }
    }
  })

  test('記事が足りないときは本で補う（子ども ＋ 政治 ＋ どう接すればよいか分からない → r12・b01・b02）', () => {
    assert.deepEqual(
      recommendIds({
        relationship: 'child',
        topics: ['politics_society'],
        concerns: ['unsure_how_to_respond'],
      }),
      ['r12', 'b01', 'b02'],
    )
  })

  test('supportTypes に background を持つ approved の記事が、書籍を含めて3本ある', () => {
    const background = mockArticles.filter(
      (a) => a.status === 'approved' && a.supportTypes.includes('background'),
    )
    assert.deepEqual(background.map((a) => a.id).sort(), ['b01', 'b02', 'r12'])
  })
})
