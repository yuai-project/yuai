// 実データ（src/data/articles.json）の取り下げ（paused）のテスト（#150・#244）。
// 週刊誌系の記事（r27・r29・r10）と、専門家ではない書き手が対処法を書いている記事（r08・r09）を
// 推薦から外したことを確かめる。
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
import { ADVICE_CARDS } from '../src/data/adviceCards.ts'
import { buildAdvice } from '../src/data/mockAdvice.ts'
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

  test('r17（mi-mollet）は approved のまま（r09 は #244 で別の理由により paused）', () => {
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
  // 推薦の並びは記事が増えると変わる（#233 で判定シートから27本増えた）。
  // ここで確かめたいのは書籍の扱いなので、このテストを書いたときの記事だけで推薦する
  const BASE_IDS = [
    'r01', 'r07', 'r08', 'r09', 'r10', 'r11', 'r12', 'r13', 'r14', 'r15',
    'r16', 'r17', 'r20', 'r25', 'r27', 'r29', 'c01', 'c02', 'b01', 'b02',
  ]
  const baseArticles = mockArticles.filter((a) => BASE_IDS.includes(a.id))
  const recommendBaseIds = (intake) =>
    recommendArticles(buildAdviceRequest({ ...initialIntake, ...intake }), baseArticles).articles.map(
      (r) => r.article.id,
    )

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
      const ids = recommendBaseIds(intake)
      for (const id of BOOK_IDS) assert.ok(ids.includes(id), `${id}: ${ids.join(',')}`)
    }
  })

  test('同じ点数なら、書籍より書籍以外の記事を先に出す（母 ＋ 話題なし ＋ どう接すればよいか分からない）', () => {
    const ids = recommendBaseIds({ relationship: 'mother', concerns: ['unsure_how_to_respond'] })
    assert.deepEqual(ids, ['r20', 'r11', 'r12'])
    for (const id of ['r11', 'r12']) {
      for (const book of BOOK_IDS) {
        if (ids.includes(book)) assert.ok(ids.indexOf(id) < ids.indexOf(book), `${id} < ${book}`)
      }
    }
  })

  test('記事が足りないときは本で補う（子ども ＋ 政治 ＋ どう接すればよいか分からない → r12・b01・b02）', () => {
    assert.deepEqual(
      recommendBaseIds({
        relationship: 'child',
        topics: ['politics_society'],
        concerns: ['unsure_how_to_respond'],
      }),
      ['r12', 'b01', 'b02'],
    )
  })

  test('このテストを書いたときの記事では、supportTypes に background を持つ approved の記事が書籍を含めて3本', () => {
    const background = baseArticles.filter(
      (a) => a.status === 'approved' && a.supportTypes.includes('background'),
    )
    assert.deepEqual(background.map((a) => a.id).sort(), ['b01', 'b02', 'r12'])
  })
})

describe('専門家ではない書き手が対処法を書いている記事を外す（判定シート No.8・No.9。#244）', () => {
  const IDS = ['r08', 'r09']

  test('r08・r09 は paused（データは残す）', () => {
    for (const id of IDS) {
      assert.ok(byId(id), id)
      assert.equal(byId(id).status, 'paused', id)
    }
  })

  test('どのカードの、どの項目の出典にも入っていない', () => {
    for (const [key, card] of Object.entries(ADVICE_CARDS)) {
      for (const section of ['avoid', 'tryReplies', 'askNext']) {
        for (const id of IDS) assert.ok(!(card[section]?.sources ?? []).includes(id), `${key}.${section}: ${id}`)
      }
    }
  })

  test('どんな相談でも、推薦にも出典にも出ない', () => {
    for (const relationship of ['father', 'mother', 'partner', 'child', '']) {
      for (const topics of [[], ['health'], ['politics_society']]) {
        for (const concerns of [['angry_when_disagreed'], ['self_exhausted'], ['unsure_how_to_respond']]) {
          for (const desiredRelationship of [null, 'some_distance']) {
            const request = buildAdviceRequest({ ...initialIntake, relationship, topics, concerns, desiredRelationship })
            const recommended = recommendArticles(request).articles.map((r) => r.article.id)
            const sources = buildAdvice(request).sources.map((s) => s.id)
            for (const id of IDS) {
              assert.ok(!recommended.includes(id), `推薦 ${id} ${JSON.stringify(request)}`)
              assert.ok(!sources.includes(id), `出典 ${id} ${JSON.stringify(request)}`)
            }
          }
        }
      }
    }
  })
})
