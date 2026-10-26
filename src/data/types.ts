// src/data の型（#166）。UI と API 差し替えの境界でやりとりする形をここにまとめる。
//
// - Advice は結果画面のアドバイスの「形」。LLM に返させる JSON もこの形にそろえる。
//   6つの枠の説明は mockAdvice.ts の冒頭コメントを参照。
// - 値は今は string のまま。選択肢の value を literal 型にするのは、使う側を TS に移してから。

// ---- 相談フォーム（consultationIntake.ts） ----

// 画面の言語（src/i18n の Lang と同じ）。src/data の文言は日本語と英語の両方を持つ（#217）
export type DataLang = 'ja' | 'en'

// 選択肢。value は英語キー（API・保存用。言語で変えない）、label / labelEn は画面表示用
export type Option = { value: string; label: string; labelEn: string }

// 画面に出す形の選択肢（どちらかの言語のラベルを選んだもの）
export type LocalizedOption = { value: string; label: string }

// フォームの入力状態。テキスト入力・select は文字列、未回答は '' / null / []
export type Intake = {
  relationship: string
  topics: string[]
  concerns: string[]
  concernsOther: string
  hasSupportPerson: string | null
  desiredRelationship: string | null
  desiredSupport: string[]
  freeText: string
}

// API に送るリクエスト（buildAdviceRequest() の戻り値）。未回答は null / []
export type AdviceRequest = {
  relationship: string | null
  topics: string[]
  concerns: string[]
  concernsOther: string | null
  hasSupportPerson: string | null
  desiredRelationship: string | null
  desiredSupport: string[]
  freeText: string
}

// buildAdvice() などが受け取る相談内容。結果画面を直接開いたときは無い（undefined）こともある
export type RequestInput = Partial<AdviceRequest> | null | undefined

// 結果画面の「相談内容のまとめ」の1行
export type SummaryRow = { label: string; value: string }

// ---- 自由記述の読み取り（freeTextKeywords.ts） ----

export type FreeTextReading = {
  concerns: string[]
  danger: boolean
  crisis: boolean
}

export type MergedFreeText = FreeTextReading & {
  // 自由記述から読み取って新しく足した困りごとだけ
  inferredConcerns: string[]
}

// ---- アドバイス（adviceCards.ts / mockAdvice.ts） ----

// どのカードを出すか（selectCardKey() の戻り値）
export type CardKey = 'default' | 'angry' | 'exhausted' | 'distance'

// 見出しの決まっている枠（SECTION_TITLES のキー）
export type SectionKey = 'avoid' | 'tryReplies' | 'askNext'

// 1. あなた自身のこと
export type ForYouSection = { title: string; body: string }

// 人が書いた 1. の文章（adviceCards.ts の FOR_YOU）。
// keyPoint は「まずは、この3つだけ」に出す、body から抜き出した要の一文（#226）。画面の 1. には出さない
export type ForYouCard = ForYouSection & { keyPoint: string }

// 結果画面の最初に出す「まずは、この3つだけ」（#226）。6つの枠の外。
// どれも6つの枠などにある文章から取る（新しい文章は作らない）
export type KeyPoints = {
  // 1. の keyPoint
  forYou: string
  // 4. こんな返し方の1つ目
  reply: string
  // 電話で相談できる窓口の1つ目（supportLines の先頭。画面の言語の文言）
  supportLine: { id: string; name: string; tel: string; note: string }
}

// 2. 今起きていること。AI を足すまでは常に null
export type WhatMayBeHappeningSection = {
  title: string
  hypotheses: string[]
  note: string
}

// 項目の本文を裏づけている記事（項目のすぐ下と「このヒントの参考にした情報」に出す）の1件
// lang はそのページの言語（記事は日本語。TELL のページは英語）。画面の言語と違えば、そのことを添える
export type AdviceSource = { id: string; title: string; url: string; domain: string; lang: DataLang }

// 3. 避けたい対応（注意の色は「避けたい」のラベルだけ）
export type AvoidContent = { title: string; items: string[]; reason: string }
export type AvoidSection = AvoidContent & { sources: AdviceSource[] }

// 4. こんな返し方 / 5. 次に聞いてみる質問
export type ItemsContent = { title: string; items: string[] }
export type ItemsSection = ItemsContent & { sources: AdviceSource[] }

// 6. 無理に話さなくていいサイン。sources は、載せている電話番号を確かめたページ
export type SafetyContent = { title: string; signs: string[]; body: string }
export type SafetySection = SafetyContent & { sources: AdviceSource[] }

// カードの1項目。title を省くと SECTION_TITLES の見出しを使う。
// sources はその項目の本文を裏づけている記事の ID（0〜3件。裏づけが無ければ []）
export type CardSection<T extends { title: string }> = Omit<T, 'title'> & {
  title?: string
  sources: string[]
}

// カードの文章だけ（sources を除いたもの）。英語版（adviceCards.en.ts）はこの形で持つ
export type CardSectionText<T extends { title: string }> = Omit<T, 'title'> & { title?: string }
export type AdviceCardText = {
  avoid: CardSectionText<AvoidContent>
  tryReplies: CardSectionText<ItemsContent>
  askNext?: CardSectionText<ItemsContent>
}

// 人が書いたカード（adviceCards.ts の ADVICE_CARDS）。askNext を持たないカードは、その枠ごと出さない
export type AdviceCard = {
  avoid: CardSection<AvoidContent>
  tryReplies: CardSection<ItemsContent>
  askNext?: CardSection<ItemsContent>
}

// 結果画面のアドバイス（buildAdvice() / getAdvice() の戻り値）。
// null の枠は画面に出さない
export type Advice = {
  // ---- 6つの枠の外 ----
  // 「まずは、この3つだけ」。safetyFirst のときは null（出さない）
  keyPoints: KeyPoints | null
  matchedLabel: string | null
  freeTextNotes: string[]
  safetyFirst: boolean
  safetyNote: string | null
  supportLines: SupportLine[]

  // ---- 6つの枠 ----
  forYou: ForYouSection
  whatMayBeHappening: WhatMayBeHappeningSection | null
  avoid: AvoidSection
  tryReplies: ItemsSection
  askNext: ItemsSection | null
  safety: SafetySection

  // ---- 6つの枠の外 ----
  // 項目ごとの sources をまとめたもの（重複なし・出てきた順）。「このヒントの参考にした情報」に出す
  sources: AdviceSource[]
}

// ---- 電話の相談窓口（supportLines.ts） ----

// 窓口の文言（name / note / description）
export type SupportLineText = { name: string; note: string; description: string }

export type SupportLine = SupportLineText & {
  id: string
  tel: string
  // 英語の画面に出す文言
  en: SupportLineText
  // 相談できる言語。英語の画面では、en を含まない窓口に「Japanese-language service」と添える
  languages: DataLang[]
  // 番号や受付時間を確かめたページ。articles.json の ID（sourceId）か、記事として載せていないページ（source）
  sourceId?: string
  source?: { title: string; url: string }
  // 英語の画面でだけ出典に足すページ（外国語で相談できることを確かめたページ。よりそいホットライン）
  languageSource?: { title: string; url: string }
}

// ---- 記事（articles.json / articleTags.ts） ----

export type Article = {
  id: string
  url: string
  title: string
  publisher: string
  summary: string
  // 英語の画面に出す要約（任意。無い記事は日本語の要約を出す）
  summaryEn?: string
  relationships: string[]
  topics: string[]
  concerns: string[]
  supportTypes: string[]
  stance: string
  burden: string
  sourceType: string
  status: string
  reviewedAt: string
  publishedAt?: string
  // 書籍（sourceType: book）のときだけ
  author?: string
  medicalInfo?: boolean
}

// 複数の値を持つタグの軸。max: null は上限なし
export type MultiAxis = { values: string[]; min: number; max: number | null }

// ---- 記事の推薦（recommendArticles.ts） ----

// 推薦に使うプロファイル（toRecommendationProfile() の戻り値）
export type RecommendationProfile = {
  relationship: string | null
  topics: string[]
  concerns: string[]
  supportTypes: string[]
  stance: string | null
  wantsMoreDistance: boolean
  exhausted: boolean
  restrictHealthSources: boolean
  needsSafetySlot: boolean
}

export type Recommendation = {
  article: Article
  score: number
  reasons: string[]
  penalties: string[]
}

export type Recommendations = {
  articles: Recommendation[]
  isFallback: boolean
}
