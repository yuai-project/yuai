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
import { resolveSources } from '../src/data/adviceSources.ts'
import { articleLang } from '../src/data/articleTags.ts'
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

describe('英語の記事（#243）', () => {
  // ページの言語を1本ずつ確かめた結果（2026-11-02）。r30-2 は r30 と同じ記事なので paused
  const ENGLISH_IDS = ['r18', 'r19', 'r21', 'r24', 'r30', 'r30-2', 'r31', 'r34', 'r64']
  const JAPANESE = /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u

  test('英語の記事は lang が en。ほかの記事は日本語（lang が無いか ja）', () => {
    for (const a of mockArticles) {
      assert.equal(articleLang(a), ENGLISH_IDS.includes(a.id) ? 'en' : 'ja', a.id)
    }
  })

  test('approved の記事のうち、タイトルに日本語を含まないものは lang が en', () => {
    const noJapaneseTitle = mockArticles.filter((a) => a.status === 'approved' && !JAPANESE.test(a.title))
    assert.ok(noJapaneseTitle.length > 0)
    for (const a of noJapaneseTitle) assert.equal(a.lang, 'en', a.id)
  })

  test('lang が en の記事のタイトルは原文のまま（「（英語）」などを足さない）', () => {
    for (const a of mockArticles.filter((x) => x.lang === 'en')) {
      assert.doesNotMatch(a.title, JAPANESE, a.id)
    }
  })

  test('英語の記事にはすべて、日本語の要約と英語の要約がある', () => {
    for (const a of mockArticles.filter((x) => x.lang === 'en')) {
      assert.match(a.summary, JAPANESE, a.id)
      assert.ok(a.summaryEn?.trim(), a.id)
      assert.doesNotMatch(a.summaryEn, JAPANESE, a.id)
    }
  })

  test('r30 と r30-2 は同じ記事。公式の URL の r30 を残し、r30-2 は paused（消さない）', () => {
    assert.equal(byId('r30').status, 'approved')
    assert.equal(byId('r30').publisher, 'MIT Technology Review')
    assert.ok(byId('r30').url.startsWith('https://www.technologyreview.com/'))
    assert.equal(byId('r30-2').status, 'paused')
  })

  test('要約は summary が日本語、summaryEn が英語', () => {
    assert.match(byId('r64').summary, /[\p{Script=Hiragana}]/u)
    assert.doesNotMatch(byId('r64').summaryEn, /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u)
  })

  test('出典にしたとき、ページの言語が en になる。lang の無い記事は ja', () => {
    assert.equal(resolveSources(['r64'])[0].lang, 'en')
    assert.equal(resolveSources(['r11'])[0].lang, 'ja')
  })

  test('話題を選んだ相談では、話題が合わないと出ない（健康には出ない）', () => {
    const ids = recommendIds({ relationship: 'mother', topics: ['health'], concerns: ['angry_when_disagreed'] })
    assert.ok(!ids.includes('r64'), ids.join(','))
  })
})
