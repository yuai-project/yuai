// 詳しい内容（自由記述）を、決まったキーワードで読み取る。AI は使わない。
//
// - 純関数のみ。入力した文章は外に送らず、ブラウザの中だけで処理する。
// - 読み取った困りごとは、フォームで選んだ困りごとに「足す」だけ。選んだものは消さない。
// - キーワードが含まれているかを見るだけなので、否定の文（「疲れてはいない」）や、
//   相手の言葉の引用（「死にたいと言っている」）も拾ってしまう。
// - 将来 AI に置き換えるときは、readFreeText() の中身だけを差し替える。
//   戻り値の形（{ concerns, danger, crisis }）を変えなければ、使う側は変更不要。
//
// 注意: キーワードは下書きで、チーム・専門家の確認前。

import type { FreeTextReading, MergedFreeText, RequestInput } from './types.ts'

// 困りごと（consultationIntake.ts の CONCERNS の value）ごとのキーワード。
export const CONCERN_KEYWORDS: Record<string, string[]> = {
  self_exhausted: ['疲れ', 'しんどい', 'つらい', '辛い', '限界', '眠れない', '消耗'],
  angry_when_disagreed: ['怒る', '怒って', '怒られ', 'キレる', 'キレて', '不機嫌'],
  repeats_same_topic: ['同じ話', '何度も', '毎回', 'ばかり', 'ばっかり'],
  sends_lots_of_info: ['送ってくる', '送られて', '動画', 'リンク'],
  relationships_worsening: ['けんか', '喧嘩', '険悪', '口をきか', '別れ'],
  money_worries: ['お金', '高額', '借金', '貯金', '買わされ', '払って'],
  conversation_breaks_down: ['話が通じない', '会話にならない', '話にならない'],
}

// 危険を示すキーワード。困りごとではなく、安全の印として扱う。
// どの言葉に反応したかは、画面に出さない。
// 「怖い」は相手の言葉（「ワクチンが怖いと言っている」など）にも反応してしまうので入れない。
export const DANGER_KEYWORDS = [
  '殴',
  '叩かれ',
  '暴力',
  '脅',
  '怒鳴',
  '死にたい',
  '消えたい',
  'いなくなりたい',
  '家に帰れない',
  '帰りたくない',
]

// 危険のキーワードのうち、「死にたい」と感じるほどつらい気持ちを示すもの。
// これがあるときは、窓口の一番上に #いのちSOS を足す（supportLines.ts）。
export const CRISIS_KEYWORDS = ['死にたい', '消えたい', 'いなくなりたい']

// 全角・半角などの表記ゆれをそろえる
const normalize = (text: unknown): string => (typeof text === 'string' ? text.normalize('NFKC') : '')

const includesAny = (text: string, keywords: string[]) => keywords.some((k) => text.includes(normalize(k)))

// 自由記述 → { concerns: 読み取った困りごと, danger: 危険を示す言葉があるか,
//               crisis: 「死にたい」と感じるほどつらい気持ちを示す言葉があるか }。
// concerns は CONCERN_KEYWORDS の並び順で、重複なし。
export function readFreeText(text: unknown): FreeTextReading {
  const normalized = normalize(text)
  if (normalized.trim() === '') return { concerns: [], danger: false, crisis: false }
  return {
    concerns: Object.entries(CONCERN_KEYWORDS)
      .filter(([, keywords]) => includesAny(normalized, keywords))
      .map(([concern]) => concern),
    danger: includesAny(normalized, DANGER_KEYWORDS),
    crisis: includesAny(normalized, CRISIS_KEYWORDS),
  }
}

// フォームの回答（buildAdviceRequest() の戻り値）に、自由記述から読み取った困りごとを足す。
// - concerns: フォームで選んだもの ＋ 読み取ったもの（選んだものが先。消さない）
// - inferredConcerns: 読み取って新しく足したものだけ
// - danger / crisis: readFreeText() と同じ
export function mergeFreeText(request: RequestInput): MergedFreeText {
  const selected = Array.isArray(request?.concerns) ? request.concerns : []
  const read = readFreeText(request?.freeText)
  const inferredConcerns = read.concerns.filter((c) => !selected.includes(c))
  return {
    concerns: [...selected, ...inferredConcerns],
    inferredConcerns,
    danger: read.danger,
    crisis: read.crisis,
  }
}
