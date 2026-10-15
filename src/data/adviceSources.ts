// アドバイスのカード（adviceCards.ts）の sources を、画面に出す形に組み立てる（#156）。
//
// - sources に入れてよいのは、articles.json で status が approved の記事だけ。
// - 書籍（sourceType: book）は本文を読んで照らし合わせられないので入れない。
// - 1枚のカードにつき 0〜3件。カードの内容を本文で裏づけている記事だけを入れる（テーマが近いだけの記事は入れない）。
// - 画面に出すときは、推薦と同じ入口の絞り込み（関係・話題が合わない記事、健康の情報の発信元のルール）をかけ、
//   その人に合わない記事は外す。全部外れたら空（画面には欄ごと出さない）。

import { BOOK_SOURCE_TYPE } from './articleTags.ts'
import { mockArticles } from './articles.ts'
import { isCandidateArticle, toRecommendationProfile } from './recommendArticles.ts'
import type { AdviceSource, Article, RequestInput } from './types.ts'

export type InvalidSource = { id: string; reason: 'missing' | 'not_approved' | 'book' }

export const MAX_SOURCES_PER_CARD = 3

// sources の ID のうち、引用してはいけないもの。[{ id, reason }]（問題が無ければ []）。
// reason: 'missing'（存在しない）/ 'not_approved'（approved でない）/ 'book'（書籍）
export function invalidSourceIds(ids: string[] = [], articles: Article[] = mockArticles): InvalidSource[] {
  return ids.flatMap((id): InvalidSource[] => {
    const article = articles.find((a) => a.id === id)
    if (!article) return [{ id, reason: 'missing' }]
    if (article.status !== 'approved') return [{ id, reason: 'not_approved' }]
    if (article.sourceType === BOOK_SOURCE_TYPE) return [{ id, reason: 'book' }]
    return []
  })
}

const domainOf = (url: string) => new URL(url).hostname.replace(/^www\./, '')

// sources の ID → 画面に出す [{ id, title, url, domain }]。
// - request（buildAdviceRequest() の戻り値）を渡すと、推薦と同じ入口の絞り込み（isCandidateArticle）で、
//   その人に合わない記事を外す。request が無い（結果画面を直接開いた）ときは絞らない
// - 引用してはいけない記事は、データの誤りがあっても画面に出さないよう、ここでも外す
export function resolveSources(
  ids: string[] = [],
  { request, articles = mockArticles }: { request?: RequestInput; articles?: Article[] } = {},
): AdviceSource[] {
  const invalid = new Set(invalidSourceIds(ids, articles).map((x) => x.id))
  const profile = toRecommendationProfile(request ?? {})
  return ids
    .filter((id) => !invalid.has(id))
    .map((id) => articles.find((a) => a.id === id))
    .filter((article) => article !== undefined)
    .filter((article) => isCandidateArticle(article, profile))
    .map(({ id, title, url }) => ({ id, title, url, domain: domainOf(url) }))
}
