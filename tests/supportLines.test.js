// マイページの相談窓口データのテスト。番号そのものの正しさは出典で人が確かめる。
//
//   npm test

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import {
  CRISIS_SUPPORT_LINE,
  SUPPORT_LINES,
  getSupportLines,
  telHref,
} from '../src/data/supportLines.js'

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
    assert.equal(SUPPORT_LINES.length, 3)
  })

  test('telHref は数字だけの tel: リンクを作る', () => {
    assert.equal(telHref('0120-279-338'), 'tel:0120279338')
    assert.equal(telHref('188'), 'tel:188')
    for (const line of SUPPORT_LINES) assert.match(telHref(line.tel), /^tel:\d+$/)
  })
})
