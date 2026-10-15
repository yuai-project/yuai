// マイページの相談窓口データのテスト。番号そのものの正しさは出典で人が確かめる。
//
//   npm test

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import {
  CONSUMER_SUPPORT_LINE,
  CRISIS_SUPPORT_LINE,
  SUPPORT_LINES,
  getSupportLines,
  telHref,
} from '../src/data/supportLines.ts'

describe('相談窓口', () => {
  test('どの窓口にも、名前・番号・説明がある', () => {
    assert.ok(getSupportLines().length > 0)
    for (const line of getSupportLines()) {
      assert.ok(line.id && line.name && line.tel && line.description, line.id)
      assert.match(line.tel, /^[\d-]+$/, line.id)
    }
    const ids = SUPPORT_LINES.map((l) => l.id)
    assert.equal(new Set(ids).size, ids.length)
  })

  test('いつもの一覧に #いのちSOS は入らない。crisis のときだけ一番上に足す', () => {
    assert.equal(getSupportLines(), SUPPORT_LINES)
    assert.ok(!getSupportLines().includes(CRISIS_SUPPORT_LINE))
    assert.deepEqual(getSupportLines({ crisis: false }), SUPPORT_LINES)
    const lines = getSupportLines({ crisis: true })
    assert.equal(lines[0], CRISIS_SUPPORT_LINE)
    assert.deepEqual(lines.slice(1), SUPPORT_LINES)
    assert.equal(new Set(lines.map((l) => l.id)).size, lines.length)
    assert.equal(telHref(CRISIS_SUPPORT_LINE.tel), 'tel:0120061338')
    // 一覧そのものは書き換えない
    assert.equal(SUPPORT_LINES.length, 2)
  })

  test('いつもの一覧（マイページ）に消費者ホットラインは入らない。money のときだけ最後に足す', () => {
    assert.deepEqual(
      getSupportLines().map((l) => l.id),
      ['yorisoi', 'kokoro'],
    )
    assert.ok(!getSupportLines().some((l) => l.tel === '188'))
    const lines = getSupportLines({ money: true })
    assert.deepEqual(lines.slice(0, -1), SUPPORT_LINES)
    assert.equal(lines.at(-1), CONSUMER_SUPPORT_LINE)
    assert.equal(telHref(CONSUMER_SUPPORT_LINE.tel), 'tel:188')
    assert.equal(SUPPORT_LINES.length, 2)
  })

  test('crisis と money の両方 → #いのちSOS が先頭、消費者ホットラインが最後', () => {
    const lines = getSupportLines({ crisis: true, money: true })
    assert.deepEqual(
      lines.map((l) => l.id),
      ['inochi-sos', 'yorisoi', 'kokoro', 'consumer'],
    )
  })

  test('telHref は数字だけの tel: リンクを作る', () => {
    assert.equal(telHref('0120-279-338'), 'tel:0120279338')
    assert.equal(telHref('188'), 'tel:188')
    for (const line of SUPPORT_LINES) assert.match(telHref(line.tel), /^tel:\d+$/)
  })
})
