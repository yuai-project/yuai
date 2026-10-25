// マイページの「つらいときの相談窓口」と、結果画面の安全のカードに載せる電話窓口。
// 番号や受付時間は変わることがあるので、載せる前・見直すときは出典で確かめる。
//
// 出典（確認日: 2026-10-13）
// - #いのちSOS / よりそいホットライン / こころの健康相談統一ダイヤル:
//   厚生労働省「まもろうよ こころ」電話相談 https://www.mhlw.go.jp/mamorouyokokoro/soudan/tel（articles.json の c01）
// - 消費者ホットライン:
//   政府広報オンライン https://www.gov-online.go.jp/kurashinosodan/list/fu_caa.html（articles.json の c02）
//
// - TELL Lifeline（英語の画面だけに出す。#217）:
//   TELL「TELL Hours: Lifeline Phone and Chat」https://telljp.com/tell-hours/（確認日: 2026-10-25）
//   フリーダイヤル 0800-300-8355（03-5774-0992 も載っている）。電話の受付時間は曜日によって違い、
//   途中で空く時間帯もあるので、時間は書かずに公式サイトでの確認をすすめる
//
// tel は表示用の番号。電話をかけるリンクは telHref() で作る。
// sourceId は出典のページの articles.json の ID。結果画面の安全の案内に、出典として出す（#213）。
// 記事として載せていないページが出典のときは source に書く（TELL）。
//
// 英語の画面では en の文言を出す（#217）。languages は相談できる言語で、日本の窓口は日本語だけ。
// 英語の画面では、en を含まない窓口に「Japanese-language service」と添える。

import type { DataLang, SupportLine } from './types.ts'

export const SUPPORT_LINES_CHECKED_AT = '2026-10-13'

export const SUPPORT_LINES: SupportLine[] = [
  {
    id: 'yorisoi',
    name: 'よりそいホットライン',
    tel: '0120-279-338',
    note: '無料・24時間',
    description: 'どんな悩みでも相談できます。',
    en: {
      name: 'Yorisoi Hotline',
      note: 'Free, 24 hours',
      description: 'You can talk about any kind of worry.',
    },
    languages: ['ja'],
    sourceId: 'c01',
  },
  {
    id: 'kokoro',
    name: 'こころの健康相談統一ダイヤル',
    tel: '0570-064-556',
    note: '通話料がかかります',
    description:
      'お住まいの地域の公的な相談機関につながります。受付時間は地域によって異なります。',
    en: {
      name: 'Mental Health Consultation Dial (Kokoro no Kenko Sodan Toitsu Dial)',
      note: 'Call charges apply',
      description:
        'Connects you to a public consultation service in your area. Hours vary by area.',
    },
    languages: ['ja'],
    sourceId: 'c01',
  },
]

// 物の売買やサービスの契約のトラブルを相談する窓口。
// いつもは出さず（マイページにも出さない）、「お金の使い方が心配」を選んだか、
// 詳しい内容（自由記述）から読み取ったときだけ、安全のカードの一覧の最後に足す。
export const CONSUMER_SUPPORT_LINE: SupportLine = {
  id: 'consumer',
  name: '消費者ホットライン',
  tel: '188',
  note: '',
  description:
    'お金やサービスのトラブルが心配なときに。身近な消費生活相談窓口につながります。',
  en: {
    name: 'Consumer Hotline',
    note: '',
    description:
      'For when you are worried about trouble with money or services. Connects you to a local consumer affairs office.',
  },
  languages: ['ja'],
  sourceId: 'c02',
}

// 「死にたい」と感じるほどつらいときの窓口。
// いつもは出さず、詳しい内容（自由記述）にそうした言葉があったときだけ、一覧の一番上に足す。
export const CRISIS_SUPPORT_LINE: SupportLine = {
  id: 'inochi-sos',
  name: '#いのちSOS',
  tel: '0120-061-338',
  note: '無料・24時間',
  description: '「死にたい」と感じるほどつらいときに相談できます。',
  en: {
    name: '#Inochi SOS',
    note: 'Free, 24 hours',
    description: 'You can call when things feel so hard that you want to die.',
  },
  languages: ['ja'],
  sourceId: 'c01',
}

// 英語で相談できる窓口。英語の画面だけに出す（日本語の画面には出さない）
export const ENGLISH_SUPPORT_LINE: SupportLine = {
  id: 'tell',
  name: 'TELL Lifeline',
  tel: '0800-300-8355',
  note: '無料・時間は曜日によって異なります',
  description: '英語で相談できるライフラインです。匿名で、秘密は守られます。受付時間は公式サイトで確認してください。',
  en: {
    name: 'TELL Lifeline',
    note: 'Free, hours vary by day',
    description:
      'An English-language lifeline offering anonymous, confidential support. Please check the official website for current hours.',
  },
  languages: ['en'],
  source: { title: 'TELL Hours: Lifeline Phone and Chat', url: 'https://telljp.com/tell-hours/' },
}

// 窓口の一覧に添える注記
export const SUPPORT_LINES_NOTICE =
  '番号や受付時間は変わることがあります。最新の情報は各窓口の公式サイトでご確認ください。'
export const SUPPORT_LINES_NOTICE_EN =
  "Numbers and hours may change. Please check each service's official website for the latest information."

// 窓口の文言を、画面の言語に合わせて選ぶ
export const supportLineText = (line: SupportLine, lang: DataLang = 'ja') =>
  lang === 'en' ? line.en : { name: line.name, note: line.note, description: line.description }

// その言語で相談できない窓口か（英語の画面で「Japanese-language service」と添える）
export const isOtherLanguageOnly = (line: SupportLine, lang: DataLang = 'ja'): boolean =>
  !line.languages.includes(lang)

// 表示用の番号 → tel: リンク（ハイフンを除く）
export const telHref = (tel: string): string => `tel:${tel.replace(/[^\d+]/g, '')}`

// 差し替え時はここだけ書き換える。
// crisis: true のときは #いのちSOS を一番上に、money: true のときは消費者ホットラインを最後に足す。
// どちらも無ければ、いつもの一覧（マイページと同じ）。
// lang: 'en' のときは、英語で相談できる TELL Lifeline を、#いのちSOS（crisis のとき）のすぐ後ろに足す。
// 「死にたい」ほどつらいときに #いのちSOS を一番上に出す動きは、言語にかかわらず同じ
export function getSupportLines({
  crisis = false,
  money = false,
  lang = 'ja',
}: { crisis?: boolean; money?: boolean; lang?: DataLang } = {}): SupportLine[] {
  if (!crisis && !money && lang === 'ja') return SUPPORT_LINES
  return [
    ...(crisis ? [CRISIS_SUPPORT_LINE] : []),
    ...(lang === 'en' ? [ENGLISH_SUPPORT_LINE] : []),
    ...SUPPORT_LINES,
    ...(money ? [CONSUMER_SUPPORT_LINE] : []),
  ]
}
