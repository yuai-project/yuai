// AI相談前の「相談内容入力フォーム」の選択肢・初期値・API送信用の整形。
//
// - 選択肢は { value, label }。value は英語キー（API・保存用）、label は画面表示用。
// - buildAdviceRequest() の戻り値が、LLM API に送るリクエストの「形」。
//   プロンプト生成時は labelOf() で日本語ラベルに戻して使う想定。
// - このフォームは診断ではない。相手をラベリングする選択肢・文言は置かない。

export const GENDERS = [
  { value: 'male', label: '男性' },
  { value: 'female', label: '女性' },
  { value: 'other', label: 'その他' },
  { value: 'no_answer', label: '回答しない' },
]

export const RELATIONSHIPS = [
  { value: 'father', label: '父' },
  { value: 'mother', label: '母' },
  { value: 'sibling', label: 'きょうだい' },
  { value: 'child', label: '子ども' },
  { value: 'friend', label: '友人' },
  { value: 'partner', label: '恋人・パートナー' },
  { value: 'grandparent', label: '祖父母' },
  { value: 'relative', label: '親戚' },
  { value: 'other', label: 'その他' },
]

// いつ頃から気になっているか（おおまかな期間）
export const DURATIONS = [
  { value: 'under_1_month', label: '最近（1か月未満）' },
  { value: '1_3_months', label: '1〜3か月くらい' },
  { value: 'about_6_months', label: '半年くらい' },
  { value: 'about_1_year', label: '1年くらい' },
  { value: '2_3_years', label: '2〜3年くらい' },
  { value: 'longer', label: 'それ以上' },
  { value: 'unsure', label: 'わからない' },
]

export const TOPICS = [
  { value: 'politics_society', label: '政治・社会' },
  { value: 'religion_spiritual', label: '宗教・スピリチュアル' },
  { value: 'celebrity', label: '有名人・芸能' },
  { value: 'health', label: '健康・ワクチン・健康療法' },
  { value: 'science_technology', label: '科学・テクノロジー' },
  { value: 'other', label: 'その他' },
]

export const CONCERNS = [
  { value: 'angry_when_disagreed', label: '否定すると怒ってしまう' },
  { value: 'conversation_breaks_down', label: '会話が成り立たない' },
  { value: 'repeats_same_topic', label: '同じ話を何度もされる' },
  { value: 'sends_lots_of_info', label: '情報を大量に送られてくる' },
  { value: 'relationships_worsening', label: '家族・友人関係が悪化している' },
  { value: 'money_worries', label: 'お金の使い方が心配' },
  { value: 'self_exhausted', label: '自分自身が疲れている' },
  { value: 'unsure_how_to_respond', label: 'どう接すればよいか分からない' },
  { value: 'other', label: 'その他' },
]

export const SUPPORT_PERSON_UNSURE = 'unsure'
export const SUPPORT_PERSON = [
  { value: 'yes', label: 'いる' },
  { value: 'no', label: 'いない' },
  { value: SUPPORT_PERSON_UNSURE, label: 'わからない' },
]

export const DESIRED_RELATIONSHIP = [
  { value: 'keep', label: '今までと変わらずにいたい' },
  { value: 'improve', label: '関係を改善したい' },
  { value: 'some_distance', label: '少し距離を置きたい' },
  { value: 'more_distance', label: 'かなり距離を置きたい' },
  { value: 'unsure', label: 'わからない' },
]

// 'unsure' は他の選択肢と同時に選べない（排他）
export const DESIRED_SUPPORT_UNSURE = 'unsure'
export const DESIRED_SUPPORT = [
  { value: 'coping_tips', label: '具体的な対処法を知りたい' },
  { value: 'read_stories', label: '同じような体験談を読みたい' },
  { value: 'ai_consultation', label: 'AIに相談したい' },
  { value: 'talk_with_peers', label: '同じ悩みを持つ人と話したい' },
  { value: 'talk_with_experienced', label: '似た状況を経験し、乗り越えた人と話したい' },
  { value: 'professional_referral', label: '専門家・NPOなどの相談先を知りたい' },
  { value: DESIRED_SUPPORT_UNSURE, label: 'わからない' },
]

// のめり込みの程度（相談者本人の主観。医学的評価ではない）
export const IMMERSION_MIN = 1
export const IMMERSION_MAX = 10

export const FREE_TEXT_MAX = 1000
export const CONCERNS_OTHER_MAX = 200

// フォームの入力状態。テキスト入力・selectは文字列、未回答は '' / null / []。
export const initialIntake = {
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

const toIntOrNull = (s, min, max) => {
  if (s === '' || s == null) return null
  const n = Number(s)
  return Number.isInteger(n) && n >= min && n <= max ? n : null
}

// フォーム状態 → API送信用リクエスト。未回答は null / [] にそろえる。
export function buildAdviceRequest(intake) {
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

export const labelOf = (options, value) =>
  options.find((o) => o.value === value)?.label ?? value

export const labelsOf = (options, values = []) =>
  values.map((v) => labelOf(options, v))

// 結果画面の「相談内容のまとめ」用。回答された項目だけを [{ label, value }] で返す。
// 求めているサポート（desiredSupport）は結果画面で専用カードに出すため含めない。
export function summarizeRequest(req) {
  const concerns = req.concerns?.length
    ? labelsOf(CONCERNS, req.concerns).join('、') +
      (req.concernsOther ? `（${req.concernsOther}）` : '')
    : null

  const rows = [
    ['あなたの年齢', req.userAge != null ? `${req.userAge}歳` : null],
    ['あなたの性別', req.userGender && labelOf(GENDERS, req.userGender)],
    ['相手との関係', req.relationship && labelOf(RELATIONSHIPS, req.relationship)],
    ['気になり始めた時期', req.duration && labelOf(DURATIONS, req.duration)],
    [
      'のめり込みの程度（あなたの感じ方）',
      req.immersionLevel != null ? `${req.immersionLevel} / ${IMMERSION_MAX}` : null,
    ],
    [
      'どんな内容について',
      req.topics?.length ? labelsOf(TOPICS, req.topics).join('、') : null,
    ],
    ['困っていること', concerns],
    [
      '周囲に相談できる人',
      req.hasSupportPerson && labelOf(SUPPORT_PERSON, req.hasSupportPerson),
    ],
    [
      'これからの関係',
      req.desiredRelationship &&
        labelOf(DESIRED_RELATIONSHIP, req.desiredRelationship),
    ],
    ['詳しい内容', req.freeText || null],
  ]

  return rows
    .filter(([, value]) => value)
    .map(([label, value]) => ({ label, value }))
}
