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
  CONCERN_KEYWORDS_EN,
  CRISIS_KEYWORDS,
  CRISIS_KEYWORDS_EN,
  DANGER_KEYWORDS,
  DANGER_KEYWORDS_EN,
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

// ---- 英語（#219） ----
// 日本語と英語のどちらで書かれても、画面の言語に関係なく両方のキーワードで読み取る

describe('英語の危険ワード', () => {
  // 指示で挙がった言い回し（"disappear" は「消えたい」にあたる言い回しで持つ）
  const REQUIRED = ['hit me', 'hurts me', 'threaten', 'I want to die', 'kill myself', 'want to disappear', "can't go home"]

  test('指示で挙がった言い回しがすべて入っている', () => {
    const all = DANGER_KEYWORDS_EN.join('|')
    for (const k of REQUIRED) assert.equal(readFreeText(`Sometimes ${k}.`).danger, true, k)
    assert.ok(all.includes('disappear'))
  })

  for (const keyword of DANGER_KEYWORDS_EN) {
    test(`"${keyword}" で safetyFirst になる（日本語の画面でも英語の画面でも）`, () => {
      const freeText = `My partner and I argued again. ${keyword} sometimes.`
      assert.equal(readFreeText(freeText).danger, true)
      for (const lang of ['ja', 'en']) {
        const advice = buildAdvice(requestOf({ freeText }), lang)
        assert.equal(advice.safetyFirst, true, lang)
        assert.ok(advice.safetyNote, lang)
      }
    })
  }

  test('大文字・小文字を区別しない', () => {
    for (const text of ['HE HIT ME.', 'He Threatened me', 'I WANT TO DIE', 'Kill Myself']) {
      assert.equal(readFreeText(text).danger, true, text)
    }
  })

  test('アポストロフィは省略・カーリー（’）でもよい。空白が多くても読み取る', () => {
    for (const text of ["I can't go home", 'I cant go home', 'I can’t go home', 'I  can’t   go home', 'i dont want to live']) {
      assert.equal(readFreeText(text).danger, true, text)
    }
  })

  test('日本語の文の中に英語が混ざっていても読み取る', () => {
    assert.equal(readFreeText('最近、彼が hit me してきます').danger, true)
    assert.equal(readFreeText('正直、want to dieって思う').crisis, true)
  })
})

describe('英語の crisis（「死にたい」系）', () => {
  test('crisis の言葉はすべて危険の言葉にも入っている', () => {
    for (const k of CRISIS_KEYWORDS_EN) assert.ok(DANGER_KEYWORDS_EN.includes(k), k)
  })

  for (const keyword of CRISIS_KEYWORDS_EN) {
    test(`"${keyword}" で crisis になり、#いのちSOS が足される`, () => {
      const freeText = `Lately I feel like I ${keyword}.`
      assert.equal(readFreeText(freeText).crisis, true)
      for (const lang of ['ja', 'en']) {
        assert.ok(buildAdvice(requestOf({ freeText }), lang).supportLines.includes(CRISIS_SUPPORT_LINE), lang)
      }
    })
  }

  test('暴力・脅しだけの言葉では crisis にならない（日本語と同じ）', () => {
    for (const text of ['He hit me.', 'She threatens me', "I can't go home"]) {
      const read = readFreeText(text)
      assert.equal(read.danger, true, text)
      assert.equal(read.crisis, false, text)
    }
  })

  test('英語の画面の crisis では、先頭が TELL Lifeline（TELL → よりそい → #いのちSOS）', () => {
    const advice = buildAdvice(requestOf({ freeText: 'I want to die.' }), 'en')
    assert.deepEqual(advice.supportLines.map((l) => l.id).slice(0, 3), ['tell', 'yorisoi', 'inochi-sos'])
    // 日本語の言葉で書いても、英語の画面なら同じ並び
    const ja = buildAdvice(requestOf({ freeText: '死にたい' }), 'en')
    assert.deepEqual(ja.supportLines.map((l) => l.id).slice(0, 3), ['tell', 'yorisoi', 'inochi-sos'])
  })

  test('日本語の画面の crisis では、今までどおり #いのちSOS が先頭（英語の言葉で書いても同じ）', () => {
    for (const freeText of ['死にたい', 'I want to die.']) {
      const advice = buildAdvice(requestOf({ freeText }), 'ja')
      assert.equal(advice.supportLines[0], CRISIS_SUPPORT_LINE, freeText)
      assert.deepEqual(advice.supportLines.slice(1), SUPPORT_LINES, freeText)
    }
  })
})

describe('画面の言語に関係なく、両方の言葉で読み取る', () => {
  test('英語の画面＋日本語の危険ワードでも反応する', () => {
    for (const keyword of DANGER_KEYWORDS) {
      const advice = buildAdvice(requestOf({ freeText: `${keyword}ことがありました` }), 'en')
      assert.equal(advice.safetyFirst, true, keyword)
    }
  })

  test('日本語の画面＋英語の危険ワードでも反応する', () => {
    assert.equal(buildAdvice(requestOf({ freeText: 'He yells at me.' }), 'ja').safetyFirst, true)
  })

  test('読み取りの結果は、画面の言語で変わらない', () => {
    for (const freeText of ['He hit me and I want to die', '疲れました', 'I am so tired of the videos', PLAIN]) {
      const ja = buildAdvice(requestOf({ freeText }), 'ja')
      const en = buildAdvice(requestOf({ freeText }), 'en')
      assert.equal(en.safetyFirst, ja.safetyFirst, freeText)
      assert.equal(en.freeTextNotes.length, ja.freeTextNotes.length, freeText)
      assert.equal(en.supportLines.includes(CRISIS_SUPPORT_LINE), ja.supportLines.includes(CRISIS_SUPPORT_LINE), freeText)
    }
  })
})

describe('英語の誤検知を防ぐ（語の区切りで照らし合わせる）', () => {
  test('"die" が "diet" などに反応しない', () => {
    for (const text of [
      'I want to diet.',
      'She wants to diet and says sugar is poison.',
      'He studied the diet plans all night.',
      'The plant will die if he stops watering it.',
      'Diesel cars are a conspiracy, he says.',
    ]) {
      assert.equal(readFreeText(text).danger, false, text)
      assert.equal(readFreeText(text).crisis, false, text)
    }
  })

  test('"disappear" だけ・"hit" だけ・"threat" だけでは反応しない', () => {
    for (const text of [
      'He says the evidence will disappear.',
      'The posts disappear after a day.',
      'That song was a hit.',
      'He thinks 5G is a threat.',
      'It is hard to hear him.',
    ]) {
      assert.deepEqual(readFreeText(text), { concerns: [], danger: false, crisis: false }, text)
    }
  })

  test('語の一部では困りごとにならない（"retired" は "tired" ではない、"linked" は "link" ではない）', () => {
    for (const text of ['My father retired last year.', 'He linked up with old friends.', 'He has a short temperament']) {
      assert.deepEqual(readFreeText(text).concerns, [], text)
    }
  })
})

describe('英語の困りごとのキーワード', () => {
  test('困りごとのキーは日本語と同じ（CONCERN_KEYWORDS と揃える）', () => {
    assert.deepEqual(Object.keys(CONCERN_KEYWORDS_EN).sort(), Object.keys(CONCERN_KEYWORDS).sort())
  })

  for (const [concern, keywords] of Object.entries(CONCERN_KEYWORDS_EN)) {
    test(`${concern}: それぞれの言葉で読み取る`, () => {
      for (const keyword of keywords) {
        const read = readFreeText(`Lately, ${keyword} is the problem.`)
        assert.ok(read.concerns.includes(concern), `${concern}: ${keyword}`)
        assert.equal(read.danger, false, keyword)
      }
    })
  }

  test('英語で書いても、日本語と同じように困りごとを足す（読み取った一行は画面の言語で出る）', () => {
    const request = requestOf({ freeText: "I'm so tired. He keeps sending me videos." })
    assert.deepEqual(mergeFreeText(request).inferredConcerns, ['self_exhausted', 'sends_lots_of_info'])
    assert.equal(selectCardKey(request), 'exhausted')
    assert.deepEqual(buildAdvice(request, 'ja').freeTextNotes, [
      `詳しい内容から「${labelOf(CONCERNS, 'self_exhausted')}」「${labelOf(CONCERNS, 'sends_lots_of_info')}」も合わせて考えました`,
    ])
    assert.match(buildAdvice(request, 'en').freeTextNotes[0], /worn out myself.*send me a lot of information/)
  })
})
