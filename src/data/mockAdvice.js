// 結果画面のアドバイスを、フォームの回答から組み立てる。
// AI は使わない。人が書いた文章（adviceCards.js）を、決まったルールで選ぶ。
//
// 後で LLM API (OpenAI / Anthropic 等) を足す際は、
// getAdvice() の中身をfetch呼び出しに置き換えるだけでUIは変更不要。
//
// レスポンスの「形」= buildAdvice() の戻り値の構造（7つの枠）。
// APIにはこの構造でJSONを返させるようプロンプト設計する。
//
//   forYou             1. まず、あなた自身へ            { title, body }
//   whatMayBeHappening 2. 今起きていること              { title, hypotheses[], note } | null
//   avoid              3. 避けたい対応（やさしい警告色） { title, items[], reason }
//   tryReplies         4. こんな返し方（コピー可能）     { title, items[] }
//   askNext            5. 次に聞いてみる質問            { title, items[] } | null
//   safety             6. 無理に話さなくていいサイン     { title, signs[], body }
//   relatedStoryIds    7. 似た体験談（IDでmockStoriesと紐づけ）
//
// null の枠は画面に出さない。whatMayBeHappening は相手の状況の見立てで、
// 人が書いた固定の文章では回答に合わせられないため、今は常に null（AI を足すときに使う）。

import { ADVICE_CARDS, FOR_YOU, SAFETY, SECTION_TITLES } from './adviceCards.js'
import { CONCERNS, DESIRED_RELATIONSHIP, labelOf } from './consultationIntake.js'

const DISTANCE_VALUES = ['some_distance', 'more_distance']

// どのカードを出すか。上から順に判定し、最初に当てはまったものを使う。
export function selectCardKey(request) {
  const concerns = request?.concerns ?? []
  if (DISTANCE_VALUES.includes(request?.desiredRelationship)) return 'distance'
  if (concerns.includes('self_exhausted')) return 'exhausted'
  if (concerns.includes('angry_when_disagreed')) return 'angry'
  return 'default'
}

// 「どの回答に合わせたか」の一行。default のときは出さない（null）。
function matchedLabelOf(cardKey, request) {
  switch (cardKey) {
    case 'distance':
      return `${labelOf(DESIRED_RELATIONSHIP, request.desiredRelationship)}あなたへ`
    case 'exhausted':
      return `「${labelOf(CONCERNS, 'self_exhausted')}」を選んだあなたへ`
    case 'angry':
      return `「${labelOf(CONCERNS, 'angry_when_disagreed')}」を選んだあなたへ`
    default:
      return null
  }
}

const withTitle = (key, section) =>
  section ? { title: SECTION_TITLES[key], ...section } : null

// フォームの回答 → アドバイス。同じ回答なら必ず同じ結果を返す純関数。
// request は相談フォームの buildAdviceRequest()（src/data/consultationIntake.js）の戻り値:
//   { userAge, userGender, relationship, duration, immersionLevel, topics,
//     concerns, concernsOther, hasSupportPerson, desiredRelationship, desiredSupport, freeText }
export function buildAdvice(request) {
  const cardKey = selectCardKey(request)
  const card = ADVICE_CARDS[cardKey]

  return {
    // どの回答に合わせたか（7つの枠の外。画面ではアドバイスの先頭に出す）
    matchedLabel: matchedLabelOf(cardKey, request),

    // angry に専用の文章はないので default を使う
    forYou: FOR_YOU[cardKey] ?? FOR_YOU.default,
    whatMayBeHappening: null,
    avoid: withTitle('avoid', card.avoid),
    tryReplies: withTitle('tryReplies', card.tryReplies),
    askNext: withTitle('askNext', card.askNext),
    safety: SAFETY,
    relatedStoryIds: ['s1', 's3'],
  }
}

// APIに差し替えるときはこの関数だけを書き換える。
// 例: const res = await fetch('/api/advice', { method:'POST', body: JSON.stringify(request) })
export async function getAdvice(request) {
  // モックのローディング演出
  await new Promise((r) => setTimeout(r, 1600))
  return buildAdvice(request)
}
