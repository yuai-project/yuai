// アドバイスのカード（adviceCards.js）の sources を、画面に出す形に組み立てる（#156）。
//
// - sources に入れてよいのは、articles.json で status が approved の記事だけ。
// - 書籍（sourceType: book）は本文を読んで照らし合わせられないので入れない。
// - 1枚のカードにつき 0〜3件。カードの内容を本文で裏づけている記事だけを入れる（テーマが近いだけの記事は入れない）。

import { BOOK_SOURCE_TYPE } from './articleTags.js'
import { mockArticles } from './articles.js'

export const MAX_SOURCES_PER_CARD = 3

// sources の ID のうち、引用してはいけないもの。[{ id, reason }]（問題が無ければ []）。
// reason: 'missing'（存在しない）/ 'not_approved'（approved でない）/ 'book'（書籍）
export function invalidSourceIds(ids = [], articles = mockArticles) {
  return ids.flatMap((id) => {
    const article = articles.find((a) => a.id === id)
    if (!article) return [{ id, reason: 'missing' }]
    if (article.status !== 'approved') return [{ id, reason: 'not_approved' }]
    if (article.sourceType === BOOK_SOURCE_TYPE) return [{ id, reason: 'book' }]
    return []
  })
}

const domainOf = (url) => new URL(url).hostname.replace(/^www\./, '')

// sources の ID → 画面に出す [{ id, title, url, domain }]。
// 引用してはいけない記事は、データの誤りがあっても画面に出さないよう、ここでも外す。
export function resolveSources(ids = [], articles = mockArticles) {
  const invalid = new Set(invalidSourceIds(ids, articles).map((x) => x.id))
  return ids
    .filter((id) => !invalid.has(id))
    .map((id) => articles.find((a) => a.id === id))
    .map(({ id, title, url }) => ({ id, title, url, domain: domainOf(url) }))
}
