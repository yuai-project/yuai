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
//
// 英語（#219）:
// - 日本語と英語のどちらで書かれても、画面の言語に関係なく、両方のキーワードで読み取る
//   （英語の画面で日本語を書く人も、日本語の画面で英語を書く人もいるため）
// - 英語は大文字・小文字を区別せず、語の区切りで照らし合わせる（"die" が "diet" に、"tired" が "retired" に反応しない）。
//   キーワードの空白は1つ以上の空白に、アポストロフィは省略・カーリー（’）も許す（"can't" "cant" "can’t"）
// - 日本語と同じく、否定の文（"I'm not tired"）や、相手の言葉の引用（"he says he wants to die"）も拾う。
//   また "it hit me that…"（気づいた）のような慣用句にも反応する。安全のための読み取りなので、
//   取りこぼすより拾いすぎるほうを選んでいる（拾いすぎても、安全の案内が先に出るだけ）

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

// 英語の困りごとのキーワード（語の区切りで照らし合わせる）
export const CONCERN_KEYWORDS_EN: Record<string, string[]> = {
  self_exhausted: ['tired', 'exhausted', 'worn out', 'drained', 'burned out', 'burnt out', "can't sleep", 'cannot sleep', 'at my limit'],
  angry_when_disagreed: ['angry', 'gets mad', 'get mad', 'got mad', 'getting mad', 'upset', 'furious', 'temper', 'snaps at me'],
  repeats_same_topic: ['same thing', 'same story', 'over and over', 'again and again', 'every time', 'keeps talking about'],
  sends_lots_of_info: ['sends me', 'keeps sending', 'video', 'videos', 'link', 'links', 'youtube'],
  relationships_worsening: ['fight', 'fights', 'fighting', 'argue', 'arguing', 'argument', 'arguments', 'stopped talking', 'not speaking', 'break up', 'breakup', 'divorce'],
  money_worries: ['money', 'debt', 'debts', 'savings', 'expensive', 'loan', 'loans', 'spending', 'spent'],
  conversation_breaks_down: ["can't talk to", "can't have a conversation", "doesn't listen", "won't listen", 'talking past each other', "can't get through"],
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
// これがあるときは、窓口に #いのちSOS を足す（日本語の画面では一番上。supportLines.ts）。
export const CRISIS_KEYWORDS = ['死にたい', '消えたい', 'いなくなりたい']

// 英語の「死にたい」系（CRISIS_KEYWORDS と同じ扱い）。"die" だけ・"disappear" だけでは拾わない
// （"diet" や "the posts disappear" に反応しないよう、気持ちを表す言い回しで持つ）
export const CRISIS_KEYWORDS_EN = [
  'want to die',
  'wanna die',
  'wish i was dead',
  'wish i were dead',
  'better off dead',
  'kill myself',
  'end my life',
  'take my own life',
  'suicidal',
  "don't want to live",
  "don't want to be alive",
  'want to disappear',
  'wish i could disappear',
  'just disappear',
]

// 英語の危険のキーワード（暴力・脅し・家に帰れない）。CRISIS_KEYWORDS_EN も危険として扱う
export const DANGER_KEYWORDS_EN = [
  'hit me',
  'hits me',
  'hitting me',
  'hurt me',
  'hurts me',
  'hurting me',
  'beat me',
  'beats me',
  'violence',
  'violent',
  'abuse',
  'abuses me',
  'abusive',
  'threaten',
  'threatens',
  'threatened',
  'threatening',
  'yell at me',
  'yells at me',
  'yelled at me',
  'yelling at me',
  'scream at me',
  'screams at me',
  'screamed at me',
  'screaming at me',
  "can't go home",
  'cannot go home',
  "can't go back home",
  "don't want to go home",
  'afraid to go home',
  'scared to go home',
  ...CRISIS_KEYWORDS_EN,
]

// 全角・半角などの表記ゆれをそろえる
const normalize = (text: unknown): string => (typeof text === 'string' ? text.normalize('NFKC') : '')

const includesAny = (text: string, keywords: string[]) => keywords.some((k) => text.includes(normalize(k)))

// 英語の照らし合わせ用にそろえる: 小文字にし、カーリーのアポストロフィ（’ ‘ ＇）を ' にする
const normalizeEn = (text: string): string => text.toLowerCase().replace(/[’‘`]/g, "'")

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// 英語のキーワード → 語の区切りで照らし合わせる正規表現。
// 前後が英字・数字でないこと（"die" が "diet" に反応しない）、空白は1つ以上、アポストロフィは省略してもよい
export const englishPattern = (keyword: string): RegExp =>
  new RegExp(
    `(?<![a-z0-9])${escapeRegExp(normalizeEn(keyword)).replace(/ /g, '\\s+').replace(/'/g, "'?")}(?![a-z0-9])`,
  )

const englishMatchers = new Map<string, RegExp>()
const matchesAnyEn = (text: string, keywords: string[]) =>
  keywords.some((k) => {
    if (!englishMatchers.has(k)) englishMatchers.set(k, englishPattern(k))
    return englishMatchers.get(k)!.test(text)
  })

// 自由記述 → { concerns: 読み取った困りごと, danger: 危険を示す言葉があるか,
//               crisis: 「死にたい」と感じるほどつらい気持ちを示す言葉があるか }。
// concerns は CONCERN_KEYWORDS の並び順で、重複なし。
// 日本語と英語の両方のキーワードで読み取る（画面の言語は見ない）。
export function readFreeText(text: unknown): FreeTextReading {
  const normalized = normalize(text)
  if (normalized.trim() === '') return { concerns: [], danger: false, crisis: false }
  const en = normalizeEn(normalized)
  return {
    concerns: Object.entries(CONCERN_KEYWORDS)
      .filter(
        ([concern, keywords]) =>
          includesAny(normalized, keywords) || matchesAnyEn(en, CONCERN_KEYWORDS_EN[concern] ?? []),
      )
      .map(([concern]) => concern),
    danger: includesAny(normalized, DANGER_KEYWORDS) || matchesAnyEn(en, DANGER_KEYWORDS_EN),
    crisis: includesAny(normalized, CRISIS_KEYWORDS) || matchesAnyEn(en, CRISIS_KEYWORDS_EN),
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
