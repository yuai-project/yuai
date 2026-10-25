// 詳しい内容（自由記述）をキーワードで読み取る処理のテスト。
// キーワードは下書きで、チーム・専門家の確認前。ここでは読み取り方と、結果への反映を確かめる。
//
//   npm test

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { SAFETY } from '../src/data/adviceCards.ts'
import {
  CONCERNS,
  buildAdviceRequest,
  initialIntake,
  labelOf,
} from '../src/data/consultationIntake.ts'
import {
  CONCERN_KEYWORDS,
  CRISIS_KEYWORDS,
  DANGER_KEYWORDS,
  mergeFreeText,
  readFreeText,
} from '../src/data/freeTextKeywords.ts'
import { buildAdvice, selectCardKey } from '../src/data/mockAdvice.ts'
import {
  REASONS,
  recommendArticles,
  toRecommendationProfile,
} from '../src/data/recommendArticles.ts'
import {
  CONSUMER_SUPPORT_LINE,
  CRISIS_SUPPORT_LINE,
  SUPPORT_LINES,
} from '../src/data/supportLines.ts'
import { FIXTURE_FALLBACK_IDS, fixtureArticles } from './fixtures/recommendArticles.js'

const requestOf = (intake = {}) => buildAdviceRequest({ ...initialIntake, ...intake })
const adviceOf = (intake) => buildAdvice(requestOf(intake))
const recommend = (intake) =>
  recommendArticles(requestOf(intake), fixtureArticles, { fallbackIds: FIXTURE_FALLBACK_IDS })

// キーワードを含まない、ふつうの文
const PLAIN = '最近、実家に帰ると話題に困ります。'
const DANGER_NOTE = '詳しい内容から、あなたの安全が心配な状況かもしれないと考えました'
// 「怖い」を外した分を補う言葉
const ADDED_DANGER_KEYWORDS = ['家に帰れない', '帰りたくない']

describe('readFreeText', () => {
  test('キーワードの表が、フォームの困りごとの value だけでできている', () => {
    const values = CONCERNS.map((c) => c.value)
    for (const concern of Object.keys(CONCERN_KEYWORDS)) {
      assert.ok(values.includes(concern), concern)
      assert.ok(CONCERN_KEYWORDS[concern].length > 0, concern)
    }
  })

  for (const [concern, keywords] of Object.entries(CONCERN_KEYWORDS)) {
    test(`${concern}: どのキーワードでも困りごとが足される`, () => {
      for (const keyword of keywords) {
        const read = readFreeText(`このごろ${keyword}ことが続いています。`)
        assert.ok(read.concerns.includes(concern), keyword)
      }
    })
  }

  test('危険のキーワードは、困りごとではなく danger として返る', () => {
    for (const keyword of DANGER_KEYWORDS) {
      assert.equal(readFreeText(`${keyword}ことがありました`).danger, true, keyword)
    }
    assert.deepEqual(readFreeText('脅されています'), { concerns: [], danger: true, crisis: false })
  })

  test('「死にたい」「消えたい」「いなくなりたい」は danger かつ crisis', () => {
    assert.deepEqual(CRISIS_KEYWORDS, ['死にたい', '消えたい', 'いなくなりたい'])
    for (const keyword of CRISIS_KEYWORDS) {
      assert.ok(DANGER_KEYWORDS.includes(keyword), keyword)
      const read = readFreeText(`もう${keyword}と思うことがあります`)
      assert.equal(read.danger, true, keyword)
      assert.equal(read.crisis, true, keyword)
    }
  })

  test('ほかの危険のキーワードは crisis にしない', () => {
    for (const keyword of DANGER_KEYWORDS.filter((k) => !CRISIS_KEYWORDS.includes(k))) {
      assert.equal(readFreeText(`${keyword}ことがありました`).crisis, false, keyword)
    }
  })

  test('「怖い」は危険のキーワードにしない（相手の言葉にも反応してしまうため）', () => {
    assert.ok(!DANGER_KEYWORDS.includes('怖い'))
    for (const text of ['母がワクチンは怖いと言っています', '将来が怖いです']) {
      assert.deepEqual(readFreeText(text), { concerns: [], danger: false, crisis: false })
    }
  })

  test('キーワードが無ければ何も読み取らない', () => {
    for (const text of [PLAIN, '', '   ', null, undefined, 123]) {
      assert.deepEqual(readFreeText(text), { concerns: [], danger: false, crisis: false })
    }
  })

  test('複数の困りごとを一度に読み取る。順番は表の順で、重複しない', () => {
    const read = readFreeText('彼女が政治の話ばかりして疲れます。毎回同じ話で疲れました。')
    assert.deepEqual(read, {
      concerns: ['self_exhausted', 'repeats_same_topic'],
      danger: false,
      crisis: false,
    })
  })

  test('全角・半角の表記ゆれをそろえて読む', () => {
    assert.ok(readFreeText('すぐｷﾚるんです').concerns.includes('angry_when_disagreed'))
    assert.ok(readFreeText('ﾘﾝｸが届く').concerns.includes('sends_lots_of_info'))
  })

  test('限界: 否定の文も拾ってしまう（キーワードが含まれているかしか見ない）', () => {
    assert.ok(readFreeText('疲れてはいない').concerns.includes('self_exhausted'))
  })

  test('同じ文章なら同じ結果を返す', () => {
    const text = 'お金のことでけんかになり、怒鳴られました'
    assert.deepEqual(readFreeText(text), readFreeText(text))
  })
})

describe('mergeFreeText', () => {
  test('フォームで選んだ困りごとは消えない。読み取ったものを後ろに足す', () => {
    const request = requestOf({
      concerns: ['money_worries', 'unsure_how_to_respond'],
      freeText: '話を聞くのに疲れました',
    })
    const merged = mergeFreeText(request)
    assert.deepEqual(merged.concerns, ['money_worries', 'unsure_how_to_respond', 'self_exhausted'])
    assert.deepEqual(merged.inferredConcerns, ['self_exhausted'])
    assert.equal(merged.danger, false)
  })

  test('すでに選んでいる困りごとは、二重に足さない', () => {
    const merged = mergeFreeText(
      requestOf({ concerns: ['self_exhausted'], freeText: '疲れました' }),
    )
    assert.deepEqual(merged.concerns, ['self_exhausted'])
    assert.deepEqual(merged.inferredConcerns, [])
  })

  test('入力を書き換えない', () => {
    const request = requestOf({ concerns: ['money_worries'], freeText: '疲れました' })
    const before = JSON.stringify(request)
    mergeFreeText(request)
    buildAdvice(request)
    recommendArticles(request, fixtureArticles, { fallbackIds: FIXTURE_FALLBACK_IDS })
    assert.equal(JSON.stringify(request), before)
  })

  test('request が無くても落ちない', () => {
    assert.deepEqual(mergeFreeText(undefined), {
      concerns: [],
      inferredConcerns: [],
      danger: false,
      crisis: false,
    })
  })
})

describe('アドバイスへの反映', () => {
  test('「彼女が政治の話ばかりして疲れます」→ 疲れている人向けのカードが出る', () => {
    const intake = { relationship: 'partner', freeText: '彼女が政治の話ばかりして疲れます' }
    assert.equal(selectCardKey(requestOf(intake)), 'exhausted')
    const advice = adviceOf(intake)
    assert.deepEqual(advice.forYou, adviceOf({ concerns: ['self_exhausted'] }).forYou)
    assert.deepEqual(advice.avoid, adviceOf({ concerns: ['self_exhausted'] }).avoid)
    assert.deepEqual(advice.freeTextNotes, [
      '詳しい内容から「自分自身が疲れている」「同じ話を何度もされる」も合わせて考えました',
    ])
  })

  test('読み取っただけの困りごとには「選んだあなたへ」と出さない', () => {
    assert.equal(adviceOf({ freeText: '疲れました' }).matchedLabel, null)
    assert.equal(adviceOf({ freeText: 'すぐ怒るんです' }).matchedLabel, null)
    // フォームで選んでいれば、今までどおり出す
    assert.equal(
      adviceOf({ concerns: ['self_exhausted'], freeText: '疲れました' }).matchedLabel,
      '「自分自身が疲れている」を選んだあなたへ',
    )
  })

  test('読み取った困りごとでも、カードの優先順位は同じ（距離 > 疲れ > 怒り）', () => {
    const freeText = 'すぐ怒るので疲れました'
    assert.equal(selectCardKey(requestOf({ freeText })), 'exhausted')
    assert.equal(
      selectCardKey(requestOf({ freeText, desiredRelationship: 'some_distance' })),
      'distance',
    )
    assert.equal(selectCardKey(requestOf({ freeText: 'すぐ怒るんです' })), 'angry')
  })

  test('読み取ったことの一行は、フォームの選択肢の文言を使う', () => {
    for (const concern of Object.keys(CONCERN_KEYWORDS)) {
      const [keyword] = CONCERN_KEYWORDS[concern]
      const [note] = adviceOf({ freeText: keyword }).freeTextNotes
      assert.ok(note.includes(`「${labelOf(CONCERNS, concern)}」`), note)
    }
  })

  test('危険のキーワード → SAFETY を一番上に出す印が付き、どの言葉に反応したかは出さない', () => {
    for (const keyword of DANGER_KEYWORDS) {
      const advice = adviceOf({ freeText: `${keyword}ことがありました` })
      assert.equal(advice.safetyFirst, true, keyword)
      const { sources: _sources, ...safetyText } = advice.safety
      assert.deepEqual(safetyText, SAFETY)
      assert.equal(advice.safetyNote, DANGER_NOTE, keyword)
      assert.ok(!advice.safetyNote.includes(keyword), keyword)
      assert.deepEqual(advice.freeTextNotes, [], keyword)
    }
  })

  test('「怖い」では安全のカードが先頭にならない', () => {
    const advice = adviceOf({ freeText: '母がワクチンは怖いと言って、話を聞いてくれません' })
    assert.equal(advice.safetyFirst, false)
    assert.deepEqual(advice.freeTextNotes, [])
    assert.deepEqual(advice.supportLines, SUPPORT_LINES)
  })

  test('危険の言葉がなくても、安全のカードに出す窓口が入っている', () => {
    for (const intake of [{}, { concerns: ['angry_when_disagreed'] }, { freeText: PLAIN }]) {
      const advice = adviceOf(intake)
      assert.equal(advice.safetyFirst, false)
      assert.deepEqual(advice.supportLines, SUPPORT_LINES)
      assert.ok(advice.supportLines.length > 0)
    }
    assert.deepEqual(buildAdvice(undefined).supportLines, SUPPORT_LINES)
  })

  test('「死にたい」「消えたい」「いなくなりたい」→ #いのちSOS が窓口の先頭に入る', () => {
    for (const keyword of CRISIS_KEYWORDS) {
      const advice = adviceOf({ freeText: `もう${keyword}です` })
      assert.equal(advice.safetyFirst, true, keyword)
      assert.equal(advice.supportLines[0], CRISIS_SUPPORT_LINE, keyword)
      assert.equal(advice.supportLines[0].tel, '0120-061-338')
      assert.deepEqual(advice.supportLines.slice(1), SUPPORT_LINES, keyword)
      // どの言葉に反応したかは、一行には出さない
      assert.equal(advice.safetyNote, DANGER_NOTE, keyword)
      assert.deepEqual(advice.freeTextNotes, [], keyword)
    }
  })

  test('「お金の使い方が心配」を選んだときだけ、消費者ホットラインが窓口に入る', () => {
    const advice = adviceOf({ concerns: ['money_worries'] })
    assert.deepEqual(advice.supportLines, [...SUPPORT_LINES, CONSUMER_SUPPORT_LINE])
    for (const intake of [{}, { concerns: ['self_exhausted'] }, { freeText: PLAIN }]) {
      assert.ok(!adviceOf(intake).supportLines.includes(CONSUMER_SUPPORT_LINE))
    }
  })

  test('自由記述からお金の心配を読み取ったときも、消費者ホットラインが入る', () => {
    const advice = adviceOf({ freeText: '高額なものを次々に買ってきます' })
    assert.deepEqual(advice.supportLines, [...SUPPORT_LINES, CONSUMER_SUPPORT_LINE])
    // 「死にたい」などと一緒のときは、#いのちSOS が先頭、消費者ホットラインが最後
    const both = adviceOf({ freeText: '借金のことを考えると消えたいです' })
    assert.deepEqual(both.supportLines, [
      CRISIS_SUPPORT_LINE,
      ...SUPPORT_LINES,
      CONSUMER_SUPPORT_LINE,
    ])
  })

  test('ほかの危険のキーワードでは、#いのちSOS は足さない（いつもの窓口だけ）', () => {
    const advice = adviceOf({ freeText: '怒鳴られることがあります' })
    assert.equal(advice.safetyFirst, true)
    assert.deepEqual(advice.supportLines, SUPPORT_LINES)
  })

  test('危険と困りごとの両方を読み取ったら、安全の一行と困りごとの一行を分けて持つ', () => {
    const advice = adviceOf({ freeText: 'お金のことで怒鳴られました' })
    assert.equal(advice.safetyFirst, true)
    assert.equal(advice.safetyNote, DANGER_NOTE)
    assert.deepEqual(advice.freeTextNotes, [
      '詳しい内容から「お金の使い方が心配」も合わせて考えました',
    ])
  })

  test('「家に帰れない」「帰りたくない」→ 安全のカードを先に出す', () => {
    for (const keyword of ADDED_DANGER_KEYWORDS) assert.ok(DANGER_KEYWORDS.includes(keyword))
    for (const text of ['父といると落ち着かず、家に帰れない日があります', '実家に帰りたくないです']) {
      const advice = adviceOf({ freeText: text })
      assert.equal(advice.safetyFirst, true, text)
      assert.equal(advice.safetyNote, DANGER_NOTE, text)
      // 「死にたい」などではないので、#いのちSOS は足さない
      assert.deepEqual(advice.supportLines, SUPPORT_LINES, text)
    }
  })

  test('危険の言葉がなければ、安全の一行は無い（今の並びのまま）', () => {
    for (const intake of [{}, { freeText: PLAIN }, { freeText: '疲れました' }]) {
      const advice = adviceOf(intake)
      assert.equal(advice.safetyFirst, false)
      assert.equal(advice.safetyNote, null)
    }
  })

  test('キーワードが無ければ今までどおり', () => {
    for (const intake of [
      {},
      { concerns: ['angry_when_disagreed'] },
      { concerns: ['self_exhausted'], desiredRelationship: 'more_distance' },
    ]) {
      const advice = adviceOf({ ...intake, freeText: PLAIN })
      assert.deepEqual(advice, adviceOf(intake))
      assert.equal(advice.safetyFirst, false)
      assert.deepEqual(advice.freeTextNotes, [])
    }
  })
})

describe('記事選びへの反映', () => {
  test('読み取った困りごとが、記事選びのプロファイルに足される', () => {
    const profile = toRecommendationProfile(
      requestOf({ concerns: ['money_worries'], freeText: '話を聞くのに疲れました' }),
    )
    assert.deepEqual(profile.concerns, ['money_worries', 'self_exhausted'])
    assert.equal(profile.exhausted, true)
  })

  test('読み取った困りごとで選ばれる記事は、フォームで選んだときと同じ', () => {
    assert.deepEqual(
      recommend({ freeText: 'すぐ怒るんです' }),
      recommend({ concerns: ['angry_when_disagreed'] }),
    )
  })

  test('危険のキーワード → 相談窓口の記事が先頭に入る（安全枠）', () => {
    for (const keyword of DANGER_KEYWORDS) {
      const request = requestOf({ freeText: `${keyword}ことがありました` })
      assert.equal(toRecommendationProfile(request).needsSafetySlot, true, keyword)
      const [top] = recommend({ freeText: `${keyword}ことがありました` }).articles
      assert.ok(top.article.supportTypes.includes('consultation_service'), keyword)
      assert.ok(top.reasons.includes(REASONS.safetySlot), keyword)
    }
  })

  test('キーワードが無ければ今までどおり', () => {
    for (const intake of [
      {},
      { concerns: ['angry_when_disagreed'], desiredSupport: ['coping_tips'] },
      { relationship: 'mother', topics: ['politics_society'] },
    ]) {
      assert.deepEqual(recommend({ ...intake, freeText: PLAIN }), recommend(intake))
      assert.equal(toRecommendationProfile(requestOf({ ...intake, freeText: PLAIN })).needsSafetySlot, false)
    }
  })
})
