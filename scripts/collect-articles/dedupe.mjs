// 候補の絞り込み：除外ドメインと、既に知っている URL との重複を除く（#107）。
//
// 「既に知っている URL」は今は articles.json だけ。
// スプレッドシートの候補・却下済み URL は、追記の段で同じ形（URL の配列）で足す。

import { EXCLUDED_DOMAINS } from '../../src/data/articleTags.js'

// 収集で検索 API に渡す除外ドメイン。アプリ側のリストに、収集でだけ除くものを足す場所。
export const COLLECT_EXCLUDED_DOMAINS = [
  ...EXCLUDED_DOMAINS,

  // 探偵社・興信所の集客ページ（調査の依頼につなげる内容で、支える側向けの記事ではない）
  'fam-tantei.co.jp',
  'fam-west-tantei.co.jp',
  'fam-w-trouble.com',
  'fam-security.com',
  'yokkaichi-tantei.com',
  'yosuga-gr.com',
  'senno-kaiketsu.com',

  // まとめサイト・匿名の書き込み
  'nandemomatomedan.com',
  'dtsoku.com',
  'nwknews.jp',
  '774neet.com',
  'anond.hatelabo.jp',
]

export const isExcludedHost = (host, domains = COLLECT_EXCLUDED_DOMAINS) =>
  domains.some((d) => host === d || host.endsWith(`.${d}`))

// 追跡用のクエリパラメータ。同じ記事が別 URL として入らないよう落とす
const TRACKING_PARAMS = /^(utm_|fbclid$|gclid$|yclid$|mc_cid$|mc_eid$)/

// 重複判定用に URL を正規化する。解釈できなければ null。
// 保存する URL は元のままにして、比較にだけ使う。
export function normalizeUrl(raw) {
  let url
  try {
    url = new URL(raw)
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null

  const host = url.hostname.toLowerCase().replace(/^www\./, '')
  const params = [...url.searchParams]
    .filter(([k]) => !TRACKING_PARAMS.test(k))
    .sort(([a], [b]) => a.localeCompare(b))
  const query = params.length ? `?${new URLSearchParams(params)}` : ''
  const path = url.pathname.replace(/\/+$/, '') || '/'

  // http と https は同じ記事として扱う
  return `${host}${path}${query}`
}

// 1回の実行を通して「見たことのある URL」を持つ。
// クエリをまたいで同じ URL が出ても、最初に採用したものだけが残る。
export function createDeduper(knownUrls) {
  const seen = new Set(knownUrls.map(normalizeUrl).filter(Boolean))

  return {
    // 除く理由（'invalid_url' / 'excluded_domain' / 'duplicate'）か、新規なら null
    check(rawUrl) {
      const key = normalizeUrl(rawUrl)
      if (!key) return 'invalid_url'
      if (isExcludedHost(new URL(rawUrl).hostname.toLowerCase())) return 'excluded_domain'
      if (seen.has(key)) return 'duplicate'
      return null
    },
    // 採用した URL だけを覚える。上限で採用しなかった新規 URL は、次の回にまた候補になる
    add(rawUrl) {
      seen.add(normalizeUrl(rawUrl))
    },
  }
}

// 1クエリ分の結果（検索順位の順）から、新規の URL を上から最大 limit 件採用する。
// stats.fresh は上限で切る前の新規件数。飽和の目安にする（0 が続くならその軸はほぼ集め切った）。
export function pickFresh(results, deduper, limit) {
  const kept = []
  const stats = { fetched: results.length, fresh: 0, duplicate: 0, excluded_domain: 0, invalid_url: 0 }

  for (const r of results) {
    const reason = deduper.check(r.url)
    if (reason) {
      stats[reason]++
      continue
    }
    stats.fresh++
    if (kept.length < limit) {
      kept.push(r)
      deduper.add(r.url)
    }
  }
  return { kept, stats }
}
