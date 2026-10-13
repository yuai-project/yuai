// マイページの相談窓口データのテスト。番号そのものの正しさは出典で人が確かめる。
//
//   npm test

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { SUPPORT_LINES, getSupportLines, telHref } from '../src/data/supportLines.js'

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

  test('telHref は数字だけの tel: リンクを作る', () => {
    assert.equal(telHref('0120-279-338'), 'tel:0120279338')
    assert.equal(telHref('188'), 'tel:188')
    for (const line of SUPPORT_LINES) assert.match(telHref(line.tel), /^tel:\d+$/)
  })
})
