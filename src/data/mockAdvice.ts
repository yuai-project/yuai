// 結果画面のアドバイスを、フォームの回答から組み立てる。
// AI は使わない。人が書いた文章（adviceCards.ts）を、決まったルールで選ぶ。
//
// 後で LLM API (OpenAI / Anthropic 等) を足す際は、
// getAdvice() の中身をfetch呼び出しに置き換えるだけでUIは変更不要。
//
// レスポンスの「形」= buildAdvice() の戻り値の構造（6つの枠）。
// APIにはこの構造でJSONを返させるようプロンプト設計する。
//
//   forYou             1. まず、あなた自身へ            { title, body }
//   whatMayBeHappening 2. 今起きていること              { title, hypotheses[], note } | null
//   avoid              3. 避けたい対応                 { title, items[], reason, sources[] }
//   tryReplies         4. こんな返し方（コピー可能）     { title, items[], sources[] }
//   askNext            5. 次に聞いてみる質問            { title, items[], sources[] } | null
//   safety             6. 無理に話さなくていいサイン     { title, signs[], body, sources[] }
//
// sources[] はその項目の出典（{ id, title, url, domain }）。AI を足すときも、AI には作らせず
// adviceCards.ts / supportLines.ts の人が確かめた ID から入れる（#213）。
//
// 文章は lang（'ja' / 'en'）に合わせて選ぶ（#217）。英語は adviceCards.en.ts。
// どのカードを選ぶか・出典・窓口の決め方は、言語にかかわらず同じ。
//
// 以前あった 7. 似た体験談（relatedStoryIds）は、体験談のページごと外した（#148）。
// null の枠は画面に出さない。whatMayBeHappening は相手の状況の見立てで、
// 人が書いた固定の文章では回答に合わせられないため、今は常に null（AI を足すときに使う）。

import { ADVICE_CARDS, FOR_YOU, SAFETY, SECTION_TITLES } from './adviceCards.ts'
import { ADVICE_CARDS_EN, FOR_YOU_EN, SAFETY_EN, SECTION_TITLES_EN } from './adviceCards.en.ts'
import { mergeSources, resolveSources, supportLineSources } from './adviceSources.ts'
import { CONCERNS, DESIRED_RELATIONSHIP, labelOf } from './consultationIntake.ts'
import { mergeFreeText } from './freeTextKeywords.ts'
import { getSupportLines } from './supportLines.ts'
import type {
  Advice,
  AdviceRequest,
  CardKey,
  CardSection,
  CardSectionText,
  DataLang,
  MergedFreeText,
  RequestInput,
  SectionKey,
} from './types.ts'

const DISTANCE_VALUES = ['some_distance', 'more_distance']

// どのカードを出すか。上から順に判定し、最初に当てはまったものを使う。
// 困りごとは、フォームで選んだものに、詳しい内容（自由記述）から読み取ったものを足して見る。
export function selectCardKey(request: RequestInput): CardKey {
  const { concerns } = mergeFreeText(request)
  if (DISTANCE_VALUES.includes(request?.desiredRelationship ?? '')) return 'distance'
  if (concerns.includes('self_exhausted')) return 'exhausted'
  if (concerns.includes('angry_when_disagreed')) return 'angry'
  return 'default'
}

// カードが選ばれるもとになった困りごと
const CONCERN_OF_CARD: Partial<Record<CardKey, string>> = { exhausted: 'self_exhausted', angry: 'angry_when_disagreed' }

// 「どの回答に合わせたか」の一行。default のときは出さない（null）。
// 困りごとをフォームで選んでいない（自由記述から読み取っただけ）のときも出さない。
// 「選んだあなたへ」が事実と違ってしまうため。その場合は freeTextNotes の一行で伝える。
function matchedLabelOf(cardKey: CardKey, request: RequestInput, lang: DataLang): string | null {
  if (cardKey === 'distance') {
    const label = labelOf(DESIRED_RELATIONSHIP, request?.desiredRelationship ?? '', lang)
    return lang === 'en' ? `Since you chose “${label}”` : `${label}あなたへ`
  }
  const concern = CONCERN_OF_CARD[cardKey]
  if (!concern || !(request?.concerns ?? []).includes(concern)) return null
  const label = labelOf(CONCERNS, concern, lang)
  return lang === 'en' ? `Since you chose “${label}”` : `「${label}」を選んだあなたへ`
}

// 詳しい内容（自由記述）に危険を示す言葉があったときに、安全のカードの上に出す一行。
// どの言葉に反応したかは出さない。
export const SAFETY_NOTE = '詳しい内容から、あなたの安全が心配な状況かもしれないと考えました'
export const SAFETY_NOTE_EN =
  'Based on the details you shared, we thought you might be in a situation where your safety is a concern'

// 詳しい内容（自由記述）から読み取った困りごとを伝える行。読み取ったものが無ければ []。
function freeTextNotesOf({ inferredConcerns }: MergedFreeText, lang: DataLang): string[] {
  if (inferredConcerns.length === 0) return []
  if (lang === 'en') {
    const labels = inferredConcerns.map((c) => `“${labelOf(CONCERNS, c, 'en')}”`).join(', ')
    return [`Based on the details you shared, we also took ${labels} into account`]
  }
  const labels = inferredConcerns.map((c) => `「${labelOf(CONCERNS, c)}」`).join('')
  return [`詳しい内容から${labels}も合わせて考えました`]
}

// カードの1項目 → 画面に出す形。カード側に title があればそちらを優先する。
// 文章は lang に合わせて選び（英語は en の文章）、sources（記事の ID）は日本語のカードのものを使う。
// sources は、その人に合わない記事を外して、画面に出す形にする
const sectionOf = <T extends { title: string }>(
  key: SectionKey,
  { sources, ...ja }: CardSection<T>,
  en: CardSectionText<T>,
  request: RequestInput,
  lang: DataLang,
) => ({
  title: (lang === 'en' ? SECTION_TITLES_EN : SECTION_TITLES)[key],
  ...(lang === 'en' ? en : ja),
  sources: resolveSources(sources, { request }),
})

// フォームの回答 → アドバイス。同じ回答なら必ず同じ結果を返す純関数。
// request は相談フォームの buildAdviceRequest()（src/data/consultationIntake.ts）の戻り値:
//   { userAge, userGender, relationship, duration, immersionLevel, topics,
//     concerns, concernsOther, hasSupportPerson, desiredRelationship, desiredSupport, freeText }
// lang は画面の言語。省くと日本語
export function buildAdvice(request: RequestInput, lang: DataLang = 'ja'): Advice {
  const cardKey = selectCardKey(request)
  const card = ADVICE_CARDS[cardKey]
  const cardEn = ADVICE_CARDS_EN[cardKey]
  const freeText = mergeFreeText(request)
  const supportLines = getSupportLines({
    crisis: freeText.crisis,
    money: freeText.concerns.includes('money_worries'),
    lang,
  })
  const avoid = sectionOf('avoid', card.avoid, cardEn.avoid, request, lang)
  const tryReplies = sectionOf('tryReplies', card.tryReplies, cardEn.tryReplies, request, lang)
  const askNext =
    card.askNext && cardEn.askNext
      ? sectionOf('askNext', card.askNext, cardEn.askNext, request, lang)
      : null
  const forYou = lang === 'en' ? FOR_YOU_EN : FOR_YOU

  return {
    // どの回答に合わせたか（6つの枠の外。画面ではアドバイスの先頭に出す）
    matchedLabel: matchedLabelOf(cardKey, request, lang),
    // 詳しい内容から読み取った困りごと（6つの枠の外。matchedLabel の下に出す）
    freeTextNotes: freeTextNotesOf(freeText, lang),
    // true のとき、safety の枠をイントロのすぐ下（記事・相談内容のまとめより上）に出す。
    // 詳しい内容に危険を示す言葉があったとき。safetyNote はその上に添える一行（無ければ null）
    safetyFirst: freeText.danger,
    safetyNote: freeText.danger ? (lang === 'en' ? SAFETY_NOTE_EN : SAFETY_NOTE) : null,
    // safety の枠の中に出す、電話で相談できる窓口（6つの枠の外）。
    // 番号を間違えると危ないので、AI を足すときも AI には作らせず、supportLines.ts から入れる
    // 消費者ホットラインは、「お金の使い方が心配」を選んだか、詳しい内容から読み取ったときだけ
    supportLines,

    // angry に専用の文章はないので default を使う
    forYou: forYou[cardKey] ?? forYou.default,
    whatMayBeHappening: null,
    // avoid / tryReplies / askNext の sources は、その項目を裏づけている記事。[{ id, title, url, domain }]。
    // 推薦と同じ入口の絞り込みで、その人に合わない記事（関係・話題が合わないなど）は外す。
    // 画面では項目の本文のすぐ下に小さなリンクで出す。空ならリンクを出さない
    avoid,
    tryReplies,
    askNext,
    // safety の sources は、一緒に出す電話窓口の番号を確かめたページ
    safety: { ...(lang === 'en' ? SAFETY_EN : SAFETY), sources: supportLineSources(supportLines, lang) },

    // このヒント（選ばれたカード）の参考にした記事（6つの枠の外）。項目ごとの sources を重複なしでまとめたもの。
    // 画面では最後の枠のすぐ後ろに小さく出す。空なら何も出さない
    sources: mergeSources([avoid.sources, tryReplies.sources, askNext?.sources ?? []]),
  }
}

// APIに差し替えるときはこの関数だけを書き換える。
// 例: const res = await fetch('/api/advice', { method:'POST', body: JSON.stringify(request) })
export async function getAdvice(request: AdviceRequest, lang: DataLang = 'ja'): Promise<Advice> {
  // モックのローディング演出
  await new Promise<void>((r) => setTimeout(r, 1600))
  return buildAdvice(request, lang)
}
