// 記事に付けるタグのスキーマ（#95）。
//
// - どの軸も閉じた集合。スキーマ外の値が出ないことが、変な記事を出さない担保になる。
// - relationships / topics / concerns は相談フォーム（consultationIntake.js）の value をそのまま使う。
//   値を二重に書かないよう定数から組み立てる。'other' は記事側では使わず、代わりに 'any' を足す。
// - 'any' は「どれにも当てはまる」の意味で、単独でしか付けられない。
// - 検証は scripts/validate-articles.mjs。推薦処理（変換・スコア計算）は #104。

import { CONCERNS, RELATIONSHIPS, TOPICS } from './consultationIntake.js'

export const TAG_ANY = 'any'

const formValues = (options) =>
  options.map((o) => o.value).filter((v) => v !== 'other')

// 複数の値を持つ軸。max: null は上限なし。
export const ARTICLE_MULTI_AXES = {
  relationships: {
    values: [...formValues(RELATIONSHIPS), TAG_ANY],
    min: 1,
    max: null,
  },
  topics: {
    values: [...formValues(TOPICS), TAG_ANY],
    min: 1,
    max: null,
  },
  concerns: {
    values: [...formValues(CONCERNS), TAG_ANY],
    min: 1,
    max: 3,
  },
  supportTypes: {
    values: [
      'coping_tips', // 具体的な接し方・対処法
      'self_care', // 相談者自身のケア
      'background', // 背景の解説
      'experience', // 体験談
      'peer_support', // 同じ悩みを持つ人・経験者とつながる場
      'consultation_service', // 公的機関・専門家などの相談窓口
    ],
    min: 1,
    max: 2,
  },
}

// 値を1つだけ持つ軸。
export const ARTICLE_SINGLE_AXES = {
  // 相手との関係についての記事の向き
  stance: ['keep_connection', 'distance', 'neutral'],
  // 読む負担
  burden: ['light', 'moderate', 'heavy'],
  // 発信元の種類
  sourceType: ['public_agency', 'support_org', 'academic', 'professional', 'media'],
  // approved 以外は推薦に出さない。paused は取り下げ
  status: ['approved', 'paused'],
}

// topics に health を含む記事は、この発信元のものに限る。
export const HEALTH_TOPIC = 'health'
export const HEALTH_ALLOWED_SOURCE_TYPES = ['public_agency', 'academic', 'professional']

// 必須の文字列項目（タグの軸以外）。publishedAt だけ任意。
export const ARTICLE_REQUIRED_TEXT_FIELDS = [
  'id',
  'url',
  'title',
  'publisher',
  'summary',
  'reviewedAt',
]
export const ARTICLE_OPTIONAL_DATE_FIELDS = ['publishedAt']

// 記事として採用しないドメイン。サブドメインも含めて除外する。
// 最小限のたたき台。中身は収集側（#96）の除外リストと合わせる。
export const EXCLUDED_DOMAINS = [
  'x.com',
  'twitter.com',
  'facebook.com',
  'instagram.com',
  'tiktok.com',
  'youtube.com',
  'chiebukuro.yahoo.co.jp',
]
