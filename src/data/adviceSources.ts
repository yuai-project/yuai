// アドバイスのカード（adviceCards.ts）の項目ごとの sources を、画面に出す形に組み立てる（#156・#213）。
//
// - sources に入れてよいのは、articles.json で status が approved の記事だけ。
// - 書籍（sourceType: book）は本文を読んで照らし合わせられないので入れない。
// - 1つの項目につき 0〜3件、1枚のカード全体でも重複を除いて 3件まで。
//   項目の本文を裏づけている記事だけを入れる（テーマが近いだけの記事は入れない）。
// - 画面に出すときは、推薦と同じ入口の絞り込み（関係・話題が合わない記事、健康の情報の発信元のルール）をかけ、
//   その人に合わない記事は外す。全部外れたら空（画面には欄ごと出さない）。

import { BOOK_SOURCE_TYPE } from './articleTags.ts'
import { mockArticles } from './articles.ts'
import { isCandidateArticle, toRecommendationProfile } from './recommendArticles.ts'
import type { AdviceCard, AdviceSource, Article, RequestInput, SupportLine } from './types.ts'

export type InvalidSource = { id: string; reason: 'missing' | 'not_approved' | 'book' }

export const MAX_SOURCES_PER_CARD = 3
export const MAX_SOURCES_PER_SECTION = 3

// sources を持つ項目（表示順）
export const SOURCE_SECTIONS = ['avoid', 'tryReplies', 'askNext'] as const

// カードの項目ごとの sources を、重複を除いて表示順に並べたもの
export function cardSourceIds(card: AdviceCard): string[] {
  return [...new Set(SOURCE_SECTIONS.flatMap((key) => card[key]?.sources ?? []))]
}

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
    // 記事はどれも日本語のページ
    .map(({ id, title, url }) => ({ id, title, url, domain: domainOf(url), lang: 'ja' as const }))
}

// 項目ごとに解決した sources を、重複を除いて出てきた順にまとめる（「このヒントの参考にした情報」用）
export function mergeSources(lists: AdviceSource[][]): AdviceSource[] {
  const seen = new Set<string>()
  return lists.flat().filter((s) => !seen.has(s.id) && seen.add(s.id))
}

// 安全の案内の出典: 一緒に出す電話窓口の番号を確かめたページ。
// 番号の確かめ先なので、関係・話題での絞り込みはかけない（誰に出す窓口でも同じページで確かめている）。
// articles.json の記事（sourceId）と、記事として載せていないページ（source。TELL）を、出てきた順に並べる
export function supportLineSources(lines: SupportLine[] = []): AdviceSource[] {
  return mergeSources(
    lines.map((line) => {
      if (line.sourceId) return resolveSources([line.sourceId])
      if (line.source) {
        const { title, url } = line.source
        // 記事として載せていないページは、その窓口が対応する言語のページ
        return [{ id: `line:${line.id}`, title, url, domain: domainOf(url), lang: line.languages[0] }]
      }
      return []
    }),
  )
}

// 項目のすぐ下に出す小さなリンクの中身。空なら null（リンクを出さない）。
// 先頭の1件のドメインを出し、2件以上なら残りの件数を「＋1」のように添える
export function sourceSummary(
  sources: AdviceSource[] = [],
): { first: AdviceSource; rest: number } | null {
  if (sources.length === 0) return null
  return { first: sources[0], rest: sources.length - 1 }
}
