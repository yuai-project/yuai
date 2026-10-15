// アドバイスのカードの「参考にした情報」（sources）のテスト（#156）。
//
//   npm test

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { ADVICE_CARDS } from '../src/data/adviceCards.js'
import {
  MAX_SOURCES_PER_CARD,
  invalidSourceIds,
  resolveSources,
} from '../src/data/adviceSources.js'
import { mockArticles } from '../src/data/articles.js'
import { buildAdviceRequest, initialIntake } from '../src/data/consultationIntake.js'
import { buildAdvice, selectCardKey } from '../src/data/mockAdvice.js'

const byId = (id) => mockArticles.find((a) => a.id === id)
const requestOf = (intake = {}) => buildAdviceRequest({ ...initialIntake, ...intake })

describe('カードの sources（実データ）', () => {
  for (const [key, card] of Object.entries(ADVICE_CARDS)) {
    test(`${key}: sources の ID がすべて存在し、status が approved で、書籍ではない`, () => {
      assert.ok(Array.isArray(card.sources), key)
      assert.ok(card.sources.length <= MAX_SOURCES_PER_CARD, key)
      assert.equal(new Set(card.sources).size, card.sources.length, `${key}: 重複`)
      assert.deepEqual(invalidSourceIds(card.sources), [], key)
      for (const id of card.sources) {
        assert.ok(byId(id), `${key}: ${id} が存在しない`)
        assert.equal(byId(id).status, 'approved', `${key}: ${id}`)
        assert.notEqual(byId(id).sourceType, 'book', `${key}: ${id}`)
      }
    })
  }

  test('書籍（b01・b02）と、本文を取得できなかった r07 は、どのカードにも入っていない', () => {
    const all = Object.values(ADVICE_CARDS).flatMap((c) => c.sources)
    for (const id of ['b01', 'b02', 'r07']) assert.ok(!all.includes(id), id)
  })
})

describe('invalidSourceIds', () => {
  const articles = [
    { id: 'ok', status: 'approved', sourceType: 'media', url: 'https://example.com/ok', title: 'OK' },
    { id: 'paused', status: 'paused', sourceType: 'media', url: 'https://example.com/p', title: 'P' },
    { id: 'book', status: 'approved', sourceType: 'book', url: 'https://example.com/b', title: 'B' },
  ]

  test('問題がなければ空', () => {
    assert.deepEqual(invalidSourceIds(['ok'], articles), [])
    assert.deepEqual(invalidSourceIds([], articles), [])
  })

  test('存在しない ID があると失敗する', () => {
    assert.deepEqual(invalidSourceIds(['ok', 'nope'], articles), [{ id: 'nope', reason: 'missing' }])
  })

  test('paused の記事があると失敗する', () => {
    assert.deepEqual(invalidSourceIds(['paused'], articles), [
      { id: 'paused', reason: 'not_approved' },
    ])
  })

  test('書籍があると失敗する', () => {
    assert.deepEqual(invalidSourceIds(['book'], articles), [{ id: 'book', reason: 'book' }])
  })

  test('実データの paused の記事（r10・r27・r29）を入れると失敗する', () => {
    for (const id of ['r10', 'r27', 'r29']) {
      assert.deepEqual(invalidSourceIds([id]), [{ id, reason: 'not_approved' }], id)
    }
  })
})

describe('resolveSources', () => {
  test('画面に出す形（タイトル・URL・ドメイン）にする。www. はドメインから外す', () => {
    assert.deepEqual(resolveSources(['r08']), [
      {
        id: 'r08',
        title: byId('r08').title,
        url: 'https://www.businessinsider.jp/article/260362/',
        domain: 'businessinsider.jp',
      },
    ])
  })

  test('引用してはいけない ID は、画面に出す形からも外す', () => {
    assert.deepEqual(
      resolveSources(['r08', 'nope', 'r27', 'b01']).map((s) => s.id),
      ['r08'],
    )
  })
})

describe('アドバイスへの反映', () => {
  const INTAKE_OF = {
    default: { concerns: ['unsure_how_to_respond'] },
    angry: { concerns: ['angry_when_disagreed'] },
    exhausted: { concerns: ['self_exhausted'] },
    distance: { desiredRelationship: 'some_distance' },
  }

  for (const [key, intake] of Object.entries(INTAKE_OF)) {
    test(`${key}: 選ばれたカードの sources が、アドバイスの sources に入る`, () => {
      const request = requestOf(intake)
      assert.equal(selectCardKey(request), key)
      assert.deepEqual(
        buildAdvice(request).sources.map((s) => s.id),
        ADVICE_CARDS[key].sources,
      )
    })
  }

  test('sources が空のカードなら、アドバイスの sources も空（画面には何も出さない）', () => {
    assert.deepEqual(resolveSources([]), [])
  })
})
