// AI の下読みの判定基準（#107）。
//
// **仮置き。** 判定基準は #108 で監修者（@kitaruna）と詰める。決まったらこのファイルだけ直す。
// ラベルは #99 の下書きの定義、観点は #108 に出ている不採用の理由から取っている。
//
// ここで決めるのは「人が判定する前の下読み」まで。AI の判定で候補を捨てることはせず、
// 除外と判定したものもシートに入れて人が見る。

import { ARTICLE_MULTI_AXES, ARTICLE_SINGLE_AXES } from '../../src/data/articleTags.js'

// #99 の採否ラベル（下書き）。シートにはこの文字列のまま書く
export const REVIEW_LABELS = ['使える', '本人向け', '論破系', '危険・陰謀論側', '無関係', '除外候補']

// 判定の根拠になった観点。複数付けてよい
export const REVIEW_FLAGS = {
  paywalled: '有料記事・会員限定で、本文が読めない',
  non_expert_qa: 'Q&A サイトや掲示板などで、書き手が専門家か判断できない',
  copied_content: '別サイトの記事の転載・コピーに見える（発信元とドメインが合わない、無関係なドメインに日本語記事がある など）',
  promotional: '探偵・興信所・商品・有料サービスなどへの集客が主な目的',
  aggregator: 'まとめサイト・SNS 投稿の寄せ集め',
  diagnostic_framing: '相手を病名や「〜な人」と決めつけて扱う、または相手の心理状態を断定している',
  debunk_focused: '相手を論破・説得して考えを変えさせることが主眼',
  promotes_misinformation: '陰謀論や根拠のない健康法をすすめている',
  believer_oriented: '支える側ではなく、信じている本人に向けて書かれている',
  off_topic: '身近な人が極端な情報を信じることとは関係が薄い',
  foreign_language: '日本語ではない',
  health_source_concern: '健康・医療の情報を含むが、発信元が公的機関・研究者・専門職ではない',
  no_content: '本文が取得できず、判断の材料が足りない',
}

// 本文が取れず判断できなかった候補に付けるラベル。AI には選ばせず、コードで付ける（review.mjs）。
// 「載せるべきでない（除外候補）」と「判断できなかった」を分け、監修者が見落とさないようにする
export const LABEL_UNCHECKED = '要確認'

// これが1つでも付いた候補は、AI のラベルが「使える」でも「除外候補」に寄せる（review.mjs）。
// AI が観点を挙げながらラベルだけ甘く付けることがあるため、コードで食い違いをなくす
export const EXCLUSION_FLAGS = [
  'promotional',
  'aggregator',
  'copied_content',
  'paywalled',
  'diagnostic_framing',
  'non_expert_qa',
  'off_topic',
]

const flagGuide = Object.entries(REVIEW_FLAGS)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join('\n')

export const SYSTEM_PROMPT = `あなたは、記事の候補を人が判定する前に下読みする担当です。

## このサービスについて
「Yorido」は、身近な人（家族・友人・パートナーなど）が陰謀論や極端な情報を信じるようになり、どう接すればよいか悩んでいる人を支えるアプリです。
支えるのは悩んでいる側（相談者）で、信じている本人を論破・矯正するためのものではありません。
アプリでは、相談者に役立つ外部の記事を紹介します。あなたの下読みのあと、監修者が採否を決めます。

## ラベル（1つ選ぶ）
- 使える: 相談者（支える側）がそのまま読んで役に立つ。接し方・セルフケア・背景の解説・体験談・相談先など
- 本人向け: 内容はまともだが、信じている本人に向けて書かれている
- 論破系: 相手を論破・説得して考えを変えさせることが主眼
- 危険・陰謀論側: 陰謀論や根拠のない健康法を広める・すすめる
- 無関係: このテーマとは関係が薄い
- 除外候補: テーマには合うが、載せるべきでない事情がある（有料で読めない、集客ページ、まとめサイト、転載・コピー、書き手が専門家か判断できない Q&A、相手を病名で決めつける など）

迷ったら「使える」に寄せず、迷った理由を reason に書いてください。最終判断は人がします。

## 判断の観点
- 書き手・発信元は誰か（公的機関、支援団体、研究者、専門職、報道、個人）
- 本文が読めるか（有料記事・会員限定ではないか）
- 発信元とドメインが合っているか。無関係な海外ドメインや見慣れないドメインに日本語の記事がある場合は、転載・コピーを疑う
- 相手の心理状態を断定したり、相手を「陰謀論者」などとラベリングしたりしていないか
- 相手を必ず変えられると約束していないか
- 健康・医療の情報を含む場合、発信元が公的機関・研究者・専門職か

## タグの候補
記事の内容から、各軸の値をスキーマの中から選んでください。迷う軸は、当てはまりそうなものを控えめに付けてください。
- relationships / topics / concerns: 特定の関係・話題・困りごとに限らない記事なら "any" だけを付ける。"any" はほかの値と一緒に付けない
- concerns は 3 個まで、supportTypes は 2 個まで
- 健康に関する情報を含む記事には、topics に "health" を必ず付ける

## reason の書き方
日本語で 1〜2 文。なぜそのラベルにしたかを、監修者が記事を開く前に分かるように書く。
相手（信じている本人）を見下したりラベリングしたりする言葉は使わない。

## flags（判断の根拠になった観点。当てはまるものをすべて）
${flagGuide}`

const multi = (axis) => ({
  type: 'array',
  items: { type: 'string', enum: ARTICLE_MULTI_AXES[axis].values },
})
const single = (axis) => ({ type: 'string', enum: ARTICLE_SINGLE_AXES[axis] })

// structured outputs に渡す JSON Schema
export const REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    label: { type: 'string', enum: REVIEW_LABELS },
    reason: { type: 'string' },
    flags: { type: 'array', items: { type: 'string', enum: Object.keys(REVIEW_FLAGS) } },
    tags: {
      type: 'object',
      properties: {
        relationships: multi('relationships'),
        topics: multi('topics'),
        concerns: multi('concerns'),
        supportTypes: multi('supportTypes'),
        stance: single('stance'),
        burden: single('burden'),
        sourceType: single('sourceType'),
      },
      required: ['relationships', 'topics', 'concerns', 'supportTypes', 'stance', 'burden', 'sourceType'],
      additionalProperties: false,
    },
  },
  required: ['label', 'reason', 'flags', 'tags'],
  additionalProperties: false,
}

// 候補1件ぶんのユーザーメッセージ。扱うのは公開記事の情報だけ
export function buildUserMessage(candidate, page) {
  const lines = [
    `URL: ${candidate.url}`,
    page.finalUrl && page.finalUrl !== candidate.url ? `転送先: ${page.finalUrl}` : null,
    `検索結果のタイトル: ${candidate.title || '(なし)'}`,
    `検索クエリの狙い: ${candidate.queryAxis}.${candidate.queryValue}`,
    page.ok ? null : `ページの取得: 失敗（${page.error}）`,
    page.kind === 'pdf' ? 'ページの種類: PDF（本文は取得していない）' : null,
    page.title ? `ページのタイトル: ${page.title}` : null,
    page.siteName ? `サイト名: ${page.siteName}` : null,
    page.author ? `著者: ${page.author}` : null,
    page.description ? `説明文: ${page.description}` : null,
    page.excerpt ? `\n本文の冒頭:\n${page.excerpt}` : null,
  ]
  return `次の記事を下読みしてください。\n\n${lines.filter(Boolean).join('\n')}`
}
