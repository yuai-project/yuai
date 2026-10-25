// AI相談前の「相談内容入力フォーム」の選択肢・初期値・API送信用の整形。
//
// - 選択肢は { value, label, labelEn }。value は英語キー（API・保存用。言語で変えない）、
//   label（日本語）/ labelEn（英語）は画面表示用（#217）。画面には localizeOptions() で言語を選んで渡す。
// - buildAdviceRequest() の戻り値が、LLM API に送るリクエストの「形」。
//   プロンプト生成時は labelOf() で日本語ラベルに戻して使う想定。
// - このフォームは診断ではない。相手をラベリングする選択肢・文言は置かない。

import type { AdviceRequest, DataLang, Intake, LocalizedOption, Option, SummaryRow } from './types.ts'

export const GENDERS: Option[] = [
  { value: 'male', label: '男性', labelEn: 'Male' },
  { value: 'female', label: '女性', labelEn: 'Female' },
  { value: 'other', label: 'その他', labelEn: 'Other' },
  { value: 'no_answer', label: '回答しない', labelEn: 'Prefer not to say' },
]

export const RELATIONSHIPS: Option[] = [
  { value: 'father', label: '父', labelEn: 'Father' },
  { value: 'mother', label: '母', labelEn: 'Mother' },
  { value: 'sibling', label: 'きょうだい', labelEn: 'Sibling' },
  { value: 'child', label: '子ども', labelEn: 'Child' },
  { value: 'friend', label: '友人', labelEn: 'Friend' },
  { value: 'partner', label: '恋人・パートナー', labelEn: 'Partner' },
  { value: 'grandparent', label: '祖父母', labelEn: 'Grandparent' },
  { value: 'relative', label: '親戚', labelEn: 'Relative' },
  { value: 'other', label: 'その他', labelEn: 'Other' },
]

// いつ頃から気になっているか（おおまかな期間）
export const DURATIONS: Option[] = [
  { value: 'under_1_month', label: '最近（1か月未満）', labelEn: 'Recently (less than a month)' },
  { value: '1_3_months', label: '1〜3か月くらい', labelEn: 'About 1–3 months' },
  { value: 'about_6_months', label: '半年くらい', labelEn: 'About six months' },
  { value: 'about_1_year', label: '1年くらい', labelEn: 'About a year' },
  { value: '2_3_years', label: '2〜3年くらい', labelEn: 'About 2–3 years' },
  { value: 'longer', label: 'それ以上', labelEn: 'Longer than that' },
  { value: 'unsure', label: 'わからない', labelEn: 'Not sure' },
]

export const TOPICS: Option[] = [
  { value: 'politics_society', label: '政治・社会', labelEn: 'Politics and society' },
  { value: 'religion_spiritual', label: '宗教・スピリチュアル', labelEn: 'Religion and spirituality' },
  { value: 'celebrity', label: '有名人・芸能', labelEn: 'Celebrities and entertainment' },
  { value: 'health', label: '健康・ワクチン・健康療法', labelEn: 'Health, vaccines, and health remedies' },
  { value: 'science_technology', label: '科学・テクノロジー', labelEn: 'Science and technology' },
  { value: 'other', label: 'その他', labelEn: 'Other' },
]

export const CONCERNS: Option[] = [
  { value: 'angry_when_disagreed', label: '否定すると怒ってしまう', labelEn: 'They get upset when I disagree' },
  { value: 'conversation_breaks_down', label: '会話が成り立たない', labelEn: "We can't really have a conversation" },
  { value: 'repeats_same_topic', label: '同じ話を何度もされる', labelEn: 'They bring up the same topic again and again' },
  { value: 'sends_lots_of_info', label: '情報を大量に送られてくる', labelEn: 'They send me a lot of information' },
  { value: 'relationships_worsening', label: '家族・友人関係が悪化している', labelEn: 'Relationships with family or friends are getting worse' },
  { value: 'money_worries', label: 'お金の使い方が心配', labelEn: "I'm worried about how they spend money" },
  { value: 'self_exhausted', label: '自分自身が疲れている', labelEn: "I'm feeling worn out myself" },
  { value: 'unsure_how_to_respond', label: 'どう接すればよいか分からない', labelEn: "I don't know how to respond to them" },
  { value: 'other', label: 'その他', labelEn: 'Other' },
]

export const SUPPORT_PERSON_UNSURE = 'unsure'
export const SUPPORT_PERSON: Option[] = [
  { value: 'yes', label: 'いる', labelEn: 'Yes' },
  { value: 'no', label: 'いない', labelEn: 'No' },
  { value: SUPPORT_PERSON_UNSURE, label: 'わからない', labelEn: 'Not sure' },
]

export const DESIRED_RELATIONSHIP: Option[] = [
  { value: 'keep', label: '今までと変わらずにいたい', labelEn: 'Keep things as they have been' },
  { value: 'improve', label: '関係を改善したい', labelEn: 'Improve our relationship' },
  { value: 'some_distance', label: '少し距離を置きたい', labelEn: 'Keep a little distance' },
  { value: 'more_distance', label: 'かなり距離を置きたい', labelEn: 'Keep a lot of distance' },
  { value: 'unsure', label: 'わからない', labelEn: 'Not sure' },
]

// 'unsure' は他の選択肢と同時に選べない（排他）
export const DESIRED_SUPPORT_UNSURE = 'unsure'
export const DESIRED_SUPPORT: Option[] = [
  { value: 'coping_tips', label: '具体的な対処法を知りたい', labelEn: 'Learn practical ways to respond' },
  { value: 'read_stories', label: '同じような経験をした人の話を読みたい', labelEn: 'Read about people with similar experiences' },
  { value: 'talk_with_peers', label: '同じ悩みを持つ人と話したい', labelEn: 'Talk with people who have the same worries' },
  { value: 'talk_with_experienced', label: '似た状況を経験し、乗り越えた人と話したい', labelEn: 'Talk with someone who has been through a similar situation' },
  { value: 'professional_referral', label: '専門家・NPOなどの相談先を知りたい', labelEn: 'Find places to get advice, such as professionals or nonprofits' },
  { value: DESIRED_SUPPORT_UNSURE, label: 'わからない', labelEn: 'Not sure' },
]

// その話をどのくらい強く信じているように見えるか（相談者本人の主観。医学的評価ではない）
export const IMMERSION_MIN = 1
export const IMMERSION_MAX = 10

export const FREE_TEXT_MAX = 1000
export const CONCERNS_OTHER_MAX = 200

// フォームの入力状態。テキスト入力・selectは文字列、未回答は '' / null / []。
export const initialIntake: Intake = {
  userAge: '',
  userGender: '',
  relationship: '',
  duration: '',
  immersionLevel: null,
  topics: [],
  concerns: [],
  concernsOther: '',
  hasSupportPerson: null,
  desiredRelationship: null,
  desiredSupport: [],
  freeText: '',
}

const toIntOrNull = (s: string | null | undefined, min: number, max: number) => {
  if (s === '' || s == null) return null
  const n = Number(s)
  return Number.isInteger(n) && n >= min && n <= max ? n : null
}

// フォーム状態 → API送信用リクエスト。未回答は null / [] にそろえる。
export function buildAdviceRequest(intake: Intake): AdviceRequest {
  const concernsOther = intake.concerns.includes('other')
    ? intake.concernsOther.trim() || null
    : null

  return {
    userAge: toIntOrNull(intake.userAge, 1, 120),
    userGender: intake.userGender || null,
    relationship: intake.relationship || null,
    duration: intake.duration || null,
    immersionLevel: intake.immersionLevel,
    topics: intake.topics,
    concerns: intake.concerns,
    concernsOther,
    hasSupportPerson: intake.hasSupportPerson,
    desiredRelationship: intake.desiredRelationship,
    desiredSupport: intake.desiredSupport,
    freeText: intake.freeText.trim(),
  }
}

// 選択肢のラベル。lang を省くと日本語（プロンプト生成やテストはこれまでどおり日本語で使う）
export const labelOf = (options: Option[], value: string, lang: DataLang = 'ja'): string => {
  const option = options.find((o) => o.value === value)
  if (!option) return value
  return lang === 'en' ? option.labelEn : option.label
}

export const labelsOf = (options: Option[], values: string[] = [], lang: DataLang = 'ja'): string[] =>
  values.map((v) => labelOf(options, v, lang))

// 画面に渡す選択肢（{ value, label }）。value はそのまま、label だけ言語に合わせる
export const localizeOptions = (options: Option[], lang: DataLang = 'ja'): LocalizedOption[] =>
  options.map(({ value, label, labelEn }) => ({ value, label: lang === 'en' ? labelEn : label }))

// 「相談内容のまとめ」の見出しと、値の書き方
const SUMMARY_TEXT = {
  ja: {
    age: 'あなたの年齢',
    ageValue: (age: number) => `${age}歳`,
    gender: 'あなたの性別',
    relationship: '相手との関係',
    duration: '気になり始めた時期',
    immersion: '信じている強さ（あなたの感じ方）',
    topics: 'どんな内容について',
    concerns: '困っていること',
    supportPerson: '周囲に相談できる人',
    desiredRelationship: 'これからの関係',
    freeText: '詳しい内容',
    separator: '、',
    other: (text: string) => `（${text}）`,
  },
  en: {
    age: 'Your age',
    ageValue: (age: number) => `${age}`,
    gender: 'Your gender',
    relationship: 'Your relationship with them',
    duration: 'When it started to concern you',
    immersion: 'How strongly they seem to believe it (your impression)',
    topics: 'What it is about',
    concerns: 'What is troubling you',
    supportPerson: 'Someone you can talk to',
    desiredRelationship: 'Your relationship from here',
    freeText: 'Details',
    separator: ', ',
    other: (text: string) => ` (${text})`,
  },
}

// 結果画面の「相談内容のまとめ」用。回答された項目だけを [{ label, value }] で返す。
// 求めているサポート（desiredSupport）は結果画面で専用カードに出すため含めない。
// 自由記述（その他の困りごと・詳しい内容）は、書かれたまま出す。
export function summarizeRequest(req: AdviceRequest, lang: DataLang = 'ja'): SummaryRow[] {
  const s = SUMMARY_TEXT[lang]
  const concerns = req.concerns?.length
    ? labelsOf(CONCERNS, req.concerns, lang).join(s.separator) +
      (req.concernsOther ? s.other(req.concernsOther) : '')
    : null

  const rows: [string, string | null][] = [
    [s.age, req.userAge != null ? s.ageValue(req.userAge) : null],
    [s.gender, req.userGender && labelOf(GENDERS, req.userGender, lang)],
    [s.relationship, req.relationship && labelOf(RELATIONSHIPS, req.relationship, lang)],
    [s.duration, req.duration && labelOf(DURATIONS, req.duration, lang)],
    [
      s.immersion,
      req.immersionLevel != null ? `${req.immersionLevel} / ${IMMERSION_MAX}` : null,
    ],
    [
      s.topics,
      req.topics?.length ? labelsOf(TOPICS, req.topics, lang).join(s.separator) : null,
    ],
    [s.concerns, concerns],
    [
      s.supportPerson,
      req.hasSupportPerson && labelOf(SUPPORT_PERSON, req.hasSupportPerson, lang),
    ],
    [
      s.desiredRelationship,
      req.desiredRelationship &&
        labelOf(DESIRED_RELATIONSHIP, req.desiredRelationship, lang),
    ],
    [s.freeText, req.freeText || null],
  ]

  return rows
    .filter((row): row is [string, string] => Boolean(row[1]))
    .map(([label, value]) => ({ label, value }))
}
