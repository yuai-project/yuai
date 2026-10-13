// 「相手との関係 → どの体験談が出るか」のテスト。
//
//   npm test

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import {
  RELATIONSHIPS,
  buildAdviceRequest,
  initialIntake,
} from '../src/data/consultationIntake.js'
import { buildAdvice } from '../src/data/mockAdvice.js'
import { getStoriesByIds, mockStories } from '../src/data/mockStories.js'
import {
  FALLBACK_STORY_IDS,
  MAX_RELATED_STORIES,
  STORY_RELATION_BY_RELATIONSHIP,
  selectRelatedStoryIds,
} from '../src/data/relatedStories.js'

const requestOf = (intake = {}) => buildAdviceRequest({ ...initialIntake, ...intake })
const select = (relationship, stories) =>
  selectRelatedStoryIds(requestOf({ relationship }), stories)

const story = (id, relation) => ({ id, relation })
const fixture = [
  story('x1', '家族'),
  story('x2', '友人'),
  story('x3', '恋人'),
  story('x4', '家族'),
  story('x5', '家族'),
  story('x6', '恋人'),
]

describe('関係 → 体験談の relation', () => {
  test('父・母・きょうだい・子ども・祖父母・親戚 → 家族', () => {
    for (const r of ['father', 'mother', 'sibling', 'child', 'grandparent', 'relative']) {
      assert.deepEqual(select(r, fixture), ['x1', 'x4'], r)
    }
  })

  test('友人 → 友人', () => {
    assert.deepEqual(select('friend', fixture), ['x2'])
  })

  test('恋人・パートナー → 恋人', () => {
    assert.deepEqual(select('partner', fixture), ['x3', 'x6'])
  })

  test('その他・未回答 → 指定なし（固定の体験談）', () => {
    assert.deepEqual(select('other', fixture), FALLBACK_STORY_IDS)
    assert.deepEqual(select('', fixture), FALLBACK_STORY_IDS)
    assert.deepEqual(selectRelatedStoryIds(undefined, fixture), FALLBACK_STORY_IDS)
  })

  test('フォームの関係は、その他を除いてすべて対応が決まっている', () => {
    for (const { value } of RELATIONSHIPS) {
      if (value === 'other') assert.equal(STORY_RELATION_BY_RELATIONSHIP[value], undefined)
      else assert.ok(STORY_RELATION_BY_RELATIONSHIP[value], value)
    }
  })
})

describe('選び方', () => {
  test('最大2件。並び順は渡した順で固定', () => {
    assert.equal(MAX_RELATED_STORIES, 2)
    assert.deepEqual(select('father', fixture), ['x1', 'x4'])
    assert.deepEqual(select('father', [...fixture].reverse()), ['x5', 'x4'])
  })

  test('同じ relation の体験談がなければ、固定の体験談', () => {
    const onlyFamily = fixture.filter((s) => s.relation === '家族')
    assert.deepEqual(select('partner', onlyFamily), FALLBACK_STORY_IDS)
    assert.deepEqual(select('friend', []), FALLBACK_STORY_IDS)
  })

  test('同じ回答なら同じ結果を返し、入力を書き換えない', () => {
    const before = JSON.stringify(fixture)
    assert.deepEqual(select('partner', fixture), select('partner', fixture))
    assert.equal(JSON.stringify(fixture), before)
    // 固定の体験談の配列を、呼び出し側が書き換えても影響しない
    select('other', fixture).push('zzz')
    assert.deepEqual(select('other', fixture), ['s1', 's3'])
  })
})

describe('実データ（mockStories.js）', () => {
  test('固定の体験談は s1・s3 で、どちらも存在する', () => {
    assert.deepEqual(FALLBACK_STORY_IDS, ['s1', 's3'])
    assert.equal(getStoriesByIds(FALLBACK_STORY_IDS).length, 2)
  })

  test('どの関係を選んでも、relation の合う体験談が2件出る', () => {
    for (const { value } of RELATIONSHIPS) {
      const stories = getStoriesByIds(select(value))
      assert.equal(stories.length, 2, value)
      const relation = STORY_RELATION_BY_RELATIONSHIP[value]
      if (relation) for (const s of stories) assert.equal(s.relation, relation, value)
    }
  })

  test('恋人・パートナー → 恋人の体験談（父・母の体験談は出ない）', () => {
    const expected = mockStories.filter((s) => s.relation === '恋人').slice(0, 2)
    assert.deepEqual(select('partner'), expected.map((s) => s.id))
    assert.ok(!select('partner').includes('s1'))
    assert.ok(!select('partner').includes('s3'))
  })

  test('アドバイスの relatedStoryIds に入る', () => {
    assert.deepEqual(
      buildAdvice(requestOf({ relationship: 'friend' })).relatedStoryIds,
      select('friend'),
    )
    assert.deepEqual(buildAdvice(undefined).relatedStoryIds, FALLBACK_STORY_IDS)
  })
})
