// src/data の英語版のテスト（#217）。選択肢・アドバイス・相談窓口・記事の要約。
//
//   npm test

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { ADVICE_CARDS, FOR_YOU, SAFETY, SECTION_TITLES } from '../src/data/adviceCards.ts'
import {
  ADVICE_CARDS_EN,
  FOR_YOU_EN,
  SAFETY_EN,
  SECTION_TITLES_EN,
} from '../src/data/adviceCards.en.ts'
import { supportLineSources } from '../src/data/adviceSources.ts'
import { mockArticles } from '../src/data/articles.ts'
import {
  CONCERNS,
  DESIRED_RELATIONSHIP,
  DESIRED_SUPPORT,
  DURATIONS,
  GENDERS,
  RELATIONSHIPS,
  SUPPORT_PERSON,
  TOPICS,
  buildAdviceRequest,
  initialIntake,
  labelOf,
  localizeOptions,
  summarizeRequest,
} from '../src/data/consultationIntake.ts'
import { buildAdvice, getAdvice } from '../src/data/mockAdvice.ts'
import {
  CONSUMER_SUPPORT_LINE,
  CRISIS_SUPPORT_LINE,
  ENGLISH_SUPPORT_LINE,
  SUPPORT_LINES,
  getSupportLines,
  isOtherLanguageOnly,
  supportLineText,
} from '../src/data/supportLines.ts'

const JAPANESE = /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}「」、。]/u
const requestOf = (intake = {}) => buildAdviceRequest({ ...initialIntake, ...intake })

// 利用者に見える文字列だけを集める。sources（外部記事のタイトル）と supportLines（窓口。別に確かめる）は除く
const textsOf = (value) => {
  const out = []
  const walk = (v) => {
    if (typeof v === 'string') out.push(v)
    else if (Array.isArray(v)) v.forEach(walk)
    else if (v && typeof v === 'object') {
      for (const [k, x] of Object.entries(v)) if (k !== 'sources' && k !== 'supportLines') walk(x)
    }
  }
  walk(value)
  return out
}

// 英語でも人にラベルを貼らない・約束しない・断定しない（CLAUDE.md の7原則）
const LABELS = /conspiracy theorist|conspiracist|believers?\b|truther|anti-?vaxxer|brainwash|cult member|delusional|crazy|paranoid/i
const PROMISES = /\b(will definitely|guarantee[sd]?|always works|for sure|will change their mind|is suffering from)\b/i
// 誰を選んでも同じ文章なので、特定の続柄を入れない
const KINSHIP = /\b(father|mother|dad|mom|parents?|son|daughter|husband|wife|brother|sister|grand(?:father|mother|parents?))\b/i

const OPTION_LISTS = {
  GENDERS,
  RELATIONSHIPS,
  DURATIONS,
  TOPICS,
  CONCERNS,
  SUPPORT_PERSON,
  DESIRED_RELATIONSHIP,
  DESIRED_SUPPORT,
}

describe('フォームの選択肢', () => {
  test('value は英語版を足す前と同じ（中で使う値を変えていない）', () => {
    assert.deepEqual(
      Object.fromEntries(Object.entries(OPTION_LISTS).map(([k, o]) => [k, o.map((x) => x.value)])),
      {
        GENDERS: ['male', 'female', 'other', 'no_answer'],
        RELATIONSHIPS: ['father', 'mother', 'sibling', 'child', 'friend', 'partner', 'grandparent', 'relative', 'other'],
        DURATIONS: ['under_1_month', '1_3_months', 'about_6_months', 'about_1_year', '2_3_years', 'longer', 'unsure'],
        TOPICS: ['politics_society', 'religion_spiritual', 'celebrity', 'health', 'science_technology', 'other'],
        CONCERNS: ['angry_when_disagreed', 'conversation_breaks_down', 'repeats_same_topic', 'sends_lots_of_info', 'relationships_worsening', 'money_worries', 'self_exhausted', 'unsure_how_to_respond', 'other'],
        SUPPORT_PERSON: ['yes', 'no', 'unsure'],
        DESIRED_RELATIONSHIP: ['keep', 'improve', 'some_distance', 'more_distance', 'unsure'],
        DESIRED_SUPPORT: ['coping_tips', 'read_stories', 'talk_with_peers', 'talk_with_experienced', 'professional_referral', 'unsure'],
      },
    )
  })

  for (const [name, options] of Object.entries(OPTION_LISTS)) {
    test(`${name}: どの選択肢にも英語のラベルがあり、日本語が混ざっていない`, () => {
      for (const o of options) {
        assert.ok(o.labelEn?.trim(), `${name}.${o.value}`)
        assert.doesNotMatch(o.labelEn, JAPANESE, `${name}.${o.value}`)
        assert.doesNotMatch(o.labelEn, LABELS, `${name}.${o.value}`)
      }
      assert.equal(new Set(options.map((o) => o.labelEn)).size, options.length, `${name}: 英語のラベルが重複`)
    })
  }

  test('localizeOptions: value はそのまま、label だけ言語に合わせる', () => {
    assert.deepEqual(localizeOptions(SUPPORT_PERSON, 'en'), [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'unsure', label: 'Not sure' },
    ])
    assert.deepEqual(localizeOptions(SUPPORT_PERSON, 'ja').map((o) => o.label), ['いる', 'いない', 'わからない'])
  })

  test('labelOf は lang を省くと日本語（これまでの使い方は変わらない）', () => {
    assert.equal(labelOf(RELATIONSHIPS, 'partner'), '恋人・パートナー')
    assert.equal(labelOf(RELATIONSHIPS, 'partner', 'en'), 'Partner')
    assert.equal(labelOf(RELATIONSHIPS, 'unknown', 'en'), 'unknown')
  })
})

describe('入力した内容のまとめ', () => {
  const request = requestOf({
    userAge: '35',
    userGender: 'female',
    relationship: 'father',
    duration: 'about_1_year',
    immersionLevel: 7,
    topics: ['health', 'politics_society'],
    concerns: ['angry_when_disagreed', 'other'],
    concernsOther: '夜遅くに電話がくる',
    hasSupportPerson: 'no',
    desiredRelationship: 'improve',
    freeText: '話すと怒ってしまいます。',
  })

  test('日本語は今までと同じ', () => {
    assert.deepEqual(summarizeRequest(request), [
      { label: 'あなたの年齢', value: '35歳' },
      { label: 'あなたの性別', value: '女性' },
      { label: '相手との関係', value: '父' },
      { label: '気になり始めた時期', value: '1年くらい' },
      { label: '信じている強さ（あなたの感じ方）', value: '7 / 10' },
      { label: 'どんな内容について', value: '健康・ワクチン・健康療法、政治・社会' },
      { label: '困っていること', value: '否定すると怒ってしまう、その他（夜遅くに電話がくる）' },
      { label: '周囲に相談できる人', value: 'いない' },
      { label: 'これからの関係', value: '関係を改善したい' },
      { label: '詳しい内容', value: '話すと怒ってしまいます。' },
    ])
  })

  test('英語では、見出しと選択肢が英語。書かれた文はそのまま', () => {
    const rows = summarizeRequest(request, 'en')
    assert.deepEqual(rows.map((r) => r.label), [
      'Your age',
      'Your gender',
      'Your relationship with them',
      'When it started to concern you',
      'How strongly they seem to believe it (your impression)',
      'What it is about',
      'What is troubling you',
      'Someone you can talk to',
      'Your relationship from here',
      'Details',
    ])
    assert.equal(rows[5].value, 'Health, vaccines, and health remedies, Politics and society')
    assert.equal(rows[6].value, 'They get upset when I disagree, Other (夜遅くに電話がくる)')
    assert.equal(rows[9].value, '話すと怒ってしまいます。')
    for (const row of rows.slice(0, 6)) assert.doesNotMatch(row.value, JAPANESE, row.label)
  })
})

describe('アドバイスの英語版（adviceCards.en.ts）', () => {
  test('日本語と同じ形（カード・項目・文の数・見出しの有無）', () => {
    assert.deepEqual(Object.keys(ADVICE_CARDS_EN).sort(), Object.keys(ADVICE_CARDS).sort())
    for (const [key, card] of Object.entries(ADVICE_CARDS)) {
      const en = ADVICE_CARDS_EN[key]
      for (const section of ['avoid', 'tryReplies', 'askNext']) {
        assert.equal(Boolean(en[section]), Boolean(card[section]), `${key}.${section} の有無`)
        if (!card[section]) continue
        assert.equal(en[section].items.length, card[section].items.length, `${key}.${section} の数`)
        assert.equal('title' in en[section], 'title' in card[section], `${key}.${section}.title の有無`)
        assert.equal('reason' in en[section], 'reason' in card[section], `${key}.${section}.reason の有無`)
        assert.ok(!('sources' in en[section]), `${key}.${section}: 出典は日本語側にだけ置く`)
      }
    }
    assert.deepEqual(Object.keys(FOR_YOU_EN).sort(), Object.keys(FOR_YOU).sort())
    assert.deepEqual(Object.keys(SECTION_TITLES_EN).sort(), Object.keys(SECTION_TITLES).sort())
    assert.equal(SAFETY_EN.signs.length, SAFETY.signs.length)
  })

  test('日本語が混ざっていない。ラベル貼り・約束・続柄の言葉がない', () => {
    for (const text of textsOf({ ADVICE_CARDS_EN, FOR_YOU_EN, SAFETY_EN, SECTION_TITLES_EN })) {
      assert.doesNotMatch(text, JAPANESE, text)
      assert.doesNotMatch(text, LABELS, text)
      assert.doesNotMatch(text, PROMISES, text)
      assert.doesNotMatch(text, KINSHIP, text)
    }
  })
})

describe('buildAdvice(request, lang)', () => {
  const INTAKES = [
    {},
    { concerns: ['unsure_how_to_respond'] },
    { relationship: 'partner', concerns: ['angry_when_disagreed'] },
    { relationship: 'father', topics: ['health'], concerns: ['self_exhausted'] },
    { relationship: 'mother', desiredRelationship: 'more_distance', concerns: ['money_worries'] },
    { freeText: '死にたいと思うことがあります。疲れました。' },
  ]

  test('lang を省くと日本語（今までと同じ）', () => {
    for (const intake of INTAKES) assert.deepEqual(buildAdvice(requestOf(intake)), buildAdvice(requestOf(intake), 'ja'))
  })

  for (const intake of INTAKES) {
    test(`英語: ${JSON.stringify(intake)}`, () => {
      const request = requestOf(intake)
      const ja = buildAdvice(request, 'ja')
      const en = buildAdvice(request, 'en')
      // どのカードか・出典・安全を先に出すかは、言語で変わらない
      assert.deepEqual(en.sources, ja.sources)
      for (const s of ['avoid', 'tryReplies', 'askNext']) {
        assert.deepEqual(en[s]?.sources, ja[s]?.sources, s)
        assert.equal(en[s]?.items.length, ja[s]?.items.length, s)
      }
      assert.equal(en.safetyFirst, ja.safetyFirst)
      assert.equal(Boolean(en.safetyNote), Boolean(ja.safetyNote))
      assert.equal(Boolean(en.matchedLabel), Boolean(ja.matchedLabel))
      assert.equal(en.freeTextNotes.length, ja.freeTextNotes.length)
      // 画面に出る文に日本語が混ざらない（出典のタイトルと窓口は除く）
      for (const text of textsOf(en)) {
        assert.doesNotMatch(text, JAPANESE, text)
        assert.doesNotMatch(text, LABELS, text)
      }
    })
  }

  test('どの回答に合わせたかの一行（英語）', () => {
    assert.equal(
      buildAdvice(requestOf({ concerns: ['angry_when_disagreed'] }), 'en').matchedLabel,
      'Since you chose “They get upset when I disagree”',
    )
    assert.equal(
      buildAdvice(requestOf({ desiredRelationship: 'some_distance' }), 'en').matchedLabel,
      'Since you chose “Step back a little”',
    )
  })

  test('詳しい内容から読み取った困りごと（英語）', () => {
    assert.deepEqual(buildAdvice(requestOf({ freeText: '疲れました' }), 'en').freeTextNotes, [
      'Based on the details you shared, we also took “I\'m feeling worn out myself” into account',
    ])
  })

  test('getAdvice も言語を受け取る', async () => {
    const advice = await getAdvice(requestOf({ concerns: ['angry_when_disagreed'] }), 'en')
    assert.equal(advice.forYou.title, 'First, for you')
  })
})

describe('相談窓口', () => {
  const ALL = [...SUPPORT_LINES, CRISIS_SUPPORT_LINE, CONSUMER_SUPPORT_LINE, ENGLISH_SUPPORT_LINE]

  test('どの窓口にも英語の文言と、相談できる言語がある', () => {
    for (const line of ALL) {
      assert.ok(line.en.name && line.en.description, line.id)
      for (const text of Object.values(line.en)) assert.doesNotMatch(text, JAPANESE, `${line.id}: ${text}`)
      assert.ok(line.languages.length > 0, line.id)
    }
  })

  test('よりそいホットラインは英語でも相談できる（ガイダンスで 2）。英語の画面で「Japanese-language service」を添えない', () => {
    const yorisoi = SUPPORT_LINES.find((l) => l.id === 'yorisoi')
    assert.deepEqual(yorisoi.languages, ['ja', 'en'])
    assert.equal(isOtherLanguageOnly(yorisoi, 'en'), false)
    assert.match(yorisoi.en.description, /press 2/)
    assert.match(yorisoi.en.note, /10 am–10 pm/)
    assert.deepEqual(yorisoi.languageSource, {
      title: 'Yorisoi Hotline English',
      url: 'https://www.since2011.net/yorisoi/en/',
    })
  })

  test('ほかの日本の窓口は日本語だけ（外国語の記載を公式ページで確かめられなかった）。英語の画面で「Japanese-language service」を添える', () => {
    for (const line of [...SUPPORT_LINES.filter((l) => l.id !== 'yorisoi'), CRISIS_SUPPORT_LINE, CONSUMER_SUPPORT_LINE]) {
      assert.deepEqual(line.languages, ['ja'], line.id)
      assert.equal(isOtherLanguageOnly(line, 'en'), true, line.id)
      assert.equal(isOtherLanguageOnly(line, 'ja'), false, line.id)
    }
    assert.equal(isOtherLanguageOnly(ENGLISH_SUPPORT_LINE, 'en'), false)
  })

  test('番号は言語で変わらない', () => {
    for (const line of ALL) {
      assert.equal(supportLineText(line, 'en').name, line.en.name)
      assert.equal(supportLineText(line, 'ja').name, line.name)
    }
  })

  test('日本語の画面には TELL を出さない（今までと同じ一覧）', () => {
    assert.equal(getSupportLines(), SUPPORT_LINES)
    assert.equal(getSupportLines({ lang: 'ja' }), SUPPORT_LINES)
    for (const opts of [{ crisis: true }, { money: true }, { crisis: true, money: true }]) {
      assert.ok(!getSupportLines({ ...opts, lang: 'ja' }).includes(ENGLISH_SUPPORT_LINE))
    }
  })

  test('英語の画面では TELL を足す。#いのちSOS は一番上のまま', () => {
    assert.deepEqual(getSupportLines({ lang: 'en' }).map((l) => l.id), ['tell', 'yorisoi', 'kokoro'])
    assert.deepEqual(
      getSupportLines({ crisis: true, money: true, lang: 'en' }).map((l) => l.id),
      ['inochi-sos', 'tell', 'yorisoi', 'kokoro', 'consumer'],
    )
  })

  test('TELL の番号と出典（公式ページで確かめたもの）', () => {
    assert.equal(ENGLISH_SUPPORT_LINE.tel, '0800-300-8355')
    assert.deepEqual(ENGLISH_SUPPORT_LINE.source, {
      title: 'TELL Hours: Lifeline Phone and Chat',
      url: 'https://telljp.com/tell-hours/',
    })
    const sources = supportLineSources(getSupportLines({ crisis: true, lang: 'en' }), 'en')
    assert.deepEqual(sources.map((s) => [s.domain, s.lang]), [
      ['mhlw.go.jp', 'ja'],
      ['telljp.com', 'en'],
      ['since2011.net', 'en'],
    ])
  })

  test('英語の結果画面の安全の案内に、TELL と、その出典が入る', () => {
    const advice = buildAdvice(requestOf({ freeText: '死にたい' }), 'en')
    assert.deepEqual(advice.supportLines.map((l) => l.id), ['inochi-sos', 'tell', 'yorisoi', 'kokoro'])
    assert.ok(advice.safety.sources.some((s) => s.domain === 'telljp.com'))
    // よりそいホットラインの外国語の相談を確かめたページも、英語の画面でだけ出典に入る
    assert.ok(advice.safety.sources.some((s) => s.domain === 'since2011.net'))
    // 日本語の結果画面は今までどおり
    const ja = buildAdvice(requestOf({ freeText: '死にたい' }))
    assert.deepEqual(ja.supportLines.map((l) => l.id), ['inochi-sos', 'yorisoi', 'kokoro'])
    assert.deepEqual(ja.safety.sources.map((s) => s.id), ['c01'])
  })
})

describe('記事の英語の要約（summaryEn）', () => {
  test('今ある記事にはすべて英語の要約がある', () => {
    for (const a of mockArticles) assert.ok(a.summaryEn?.trim(), a.id)
  })

  test('日本語が混ざっていない。ラベル貼り・約束の言葉がない', () => {
    for (const a of mockArticles) {
      assert.doesNotMatch(a.summaryEn, JAPANESE, a.id)
      assert.doesNotMatch(a.summaryEn, LABELS, a.id)
      assert.doesNotMatch(a.summaryEn, PROMISES, a.id)
    }
  })
})
