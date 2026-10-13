// マイページの「つらいときの相談窓口」に載せる電話窓口。
// 番号や受付時間は変わることがあるので、載せる前・見直すときは出典で確かめる。
//
// 出典（確認日: 2026-10-13）
// - よりそいホットライン / こころの健康相談統一ダイヤル:
//   厚生労働省「まもろうよ こころ」電話相談 https://www.mhlw.go.jp/mamorouyokokoro/soudan/tel
// - 消費者ホットライン:
//   政府広報オンライン https://www.gov-online.go.jp/kurashinosodan/list/fu_caa.html
//
// tel は表示用の番号。電話をかけるリンクは telHref() で作る。

export const SUPPORT_LINES_CHECKED_AT = '2026-10-13'

export const SUPPORT_LINES = [
  {
    id: 'yorisoi',
    name: 'よりそいホットライン',
    tel: '0120-279-338',
    note: '無料・24時間',
    description: 'どんな悩みでも相談できます。',
  },
  {
    id: 'kokoro',
    name: 'こころの健康相談統一ダイヤル',
    tel: '0570-064-556',
    note: '通話料がかかります',
    description:
      'お住まいの地域の公的な相談機関につながります。受付時間は地域によって異なります。',
  },
  {
    id: 'consumer',
    name: '消費者ホットライン',
    tel: '188',
    note: '',
    description:
      'お金やサービスのトラブルが心配なときに。身近な消費生活相談窓口につながります。',
  },
]

// 窓口の一覧に添える注記
export const SUPPORT_LINES_NOTICE =
  '番号や受付時間は変わることがあります。最新の情報は各窓口の公式サイトでご確認ください。'

// 表示用の番号 → tel: リンク（ハイフンを除く）
export const telHref = (tel) => `tel:${tel.replace(/[^\d+]/g, '')}`

// 差し替え時はここだけ書き換える。
export function getSupportLines() {
  return SUPPORT_LINES
}
