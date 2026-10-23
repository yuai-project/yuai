// 承認済みの記事を articles.json に足す処理（scripts/sync-articles）の、シートの行の変換のテスト（#168）。
//
//   npm test

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, test } from 'node:test'
import {
  formatArticles,
  pickNewApproved,
  readReviewRows,
  toId,
  toTags,
  todayJst,
} from '../scripts/sync-articles/convert.mjs'

const HEADER = ['No', 'タイトル', 'URL', '発信元', '関係性', '話題', '困りごと', '記事の種類', '判定', '判定者', 'コメント（却下・保留は理由を一言）']

const row = (overrides = {}) => ({
  No: '70',
  タイトル: 'テストの記事',
  URL: 'https://example.com/a',
  発信元: 'テスト',
  関係性: '母',
  話題: '健康・ワクチン・健康療法',
  困りごと: '会話が成り立たない',
  記事の種類: '具体的な対処法を知りたい',
  判定: '承認',
  ...overrides,
})

describe('readReviewRows', () => {
  test('見出しの名前で列を探す（補足付きの見出しも同じ列とみなす）', () => {
    const [r] = readReviewRows([HEADER, ['1', 't', 'https://example.com/', 'p', '父', '政治・社会', '', '', '承認']])
    assert.equal(r.No, '1')
    assert.equal(r['判定'], '承認')
    assert.equal(r['困りごと'], '')
  })

  test('必要な見出しが無ければ止める', () => {
    assert.throws(() => readReviewRows([HEADER.filter((h) => h !== '判定'), []]), /判定/)
  })
})

describe('toTags', () => {
  test('日本語ラベルを value にする。「全般」は any', () => {
    const { tags, warnings } = toTags(row({ 関係性: '父, 恋人・パートナー', 話題: '全般', 記事の種類: '同じような経験をした人の話を読みたい' }))
    assert.deepEqual(tags.relationships, ['father', 'partner'])
    assert.deepEqual(tags.topics, ['any'])
    assert.deepEqual(tags.supportTypes, ['experience'])
    assert.deepEqual(warnings, [])
  })

  test('困りごとは3個まで。外したものは warnings に残す', () => {
    const { tags, warnings } = toTags(
      row({ 困りごと: '情報を大量に送られてくる, 家族・友人関係が悪化している, 会話が成り立たない, 否定すると怒ってしまう' }),
    )
    assert.equal(tags.concerns.length, 3)
    assert.match(warnings[0], /否定すると怒ってしまう/)
  })

  test('読めないラベルは外し、空になった軸は any にする', () => {
    const { tags, warnings } = toTags(row({ 話題: '詐欺' }))
    assert.deepEqual(tags.topics, ['any'])
    assert.equal(warnings.length, 2)
  })

  test('シートでの体験談の書き方も experience にする', () => {
    assert.deepEqual(toTags(row({ 記事の種類: '同じような体験談を読みたい' })).tags.supportTypes, ['experience'])
  })

  test('記事の種類は any を付けられないので、空なら空のまま返す', () => {
    assert.deepEqual(toTags(row({ 記事の種類: '' })).tags.supportTypes, [])
  })

  test('any とほかの値が一緒なら any を外す', () => {
    const { tags } = toTags(row({ 関係性: '全般, 母' }))
    assert.deepEqual(tags.relationships, ['mother'])
  })
})

describe('pickNewApproved', () => {
  const articles = [{ url: 'https://www.example.com/known/' }]

  test('承認済みで、URL が articles.json に無いものだけを選ぶ', () => {
    const rows = [
      row({ No: '1', URL: 'https://example.com/known' }), // 末尾のスラッシュと www の違いは同じ記事
      row({ No: '2', 判定: '保留', URL: 'https://example.com/b' }),
      row({ No: '3', URL: 'https://example.com/c' }),
      row({ No: '4', URL: 'https://example.com/c?utm_source=x' }), // シートの中の重複
    ]
    const { picked } = pickNewApproved(rows, articles)
    assert.deepEqual(picked.map((r) => r.No), ['3'])
  })

  test('除外ドメイン・https でない URL・読めない URL は理由を付けて飛ばす', () => {
    const { picked, skipped } = pickNewApproved(
      [
        row({ No: '5', URL: 'https://www.youtube.com/watch?v=1' }),
        row({ No: '6', URL: 'http://example.com/plain' }),
        row({ No: '7', URL: 'not a url' }),
      ],
      articles,
    )
    assert.equal(picked.length, 0)
    assert.deepEqual(skipped.map((s) => s.reason), ['除外ドメイン', 'https ではない', 'URL を読めない'])
  })
})

describe('toId', () => {
  test('シートの No から作り、ぶつかったら末尾に番号を付ける', () => {
    const used = new Set(['r16'])
    assert.equal(toId('5', used), 'r05')
    assert.equal(toId('16', used), 'r16-2')
    assert.equal(toId('16', used), 'r16-3')
  })
})

describe('formatArticles', () => {
  test('今の articles.json を書き直しても差分が出ない', () => {
    const path = new URL('../src/data/articles.json', import.meta.url)
    const text = readFileSync(path, 'utf8')
    assert.equal(formatArticles(JSON.parse(text)), text)
  })
})

describe('todayJst', () => {
  test('日本時間の日付にする', () => {
    assert.equal(todayJst(new Date('2026-10-22T15:30:00Z')), '2026-10-23')
  })
})
