import { ExternalLink } from 'lucide-react'
import { BOOK_SOURCE_TYPE } from '../data/articleTags'
import { REASONS } from '../data/recommendArticles'

// 結果画面の「近い状況の記事や本」。recommendArticles() の戻り値をそのまま受け取る。
// 0件なら何も表示しない。点数（score）と減点（penalties）は画面に出さない。
// 記事は罫線で区切った一覧にする（カードを重ねない）。
export default function ArticleRecommendations({ result }) {
  const items = result?.articles ?? []
  if (items.length === 0) return null

  return (
    <section
      aria-labelledby="article-recommendations-title"
      className="rounded-xl border border-line bg-surface p-4 lg:p-5"
    >
      <h2
        id="article-recommendations-title"
        className="text-base font-bold leading-snug text-ink [word-break:auto-phrase]"
      >
        近い状況の記事や本
      </h2>
      <p className="mt-0.5 text-xs leading-relaxed text-ink-faint">
        {result.isFallback
          ? 'まずはこちらから。気になるものがあれば、読めそうなときに開いてみてください。外部のサイトが開きます。'
          : '外部のサイトが開きます。'}
      </p>

      <ul className="mt-2">
        {items.map(({ article, reasons }) => (
          <li key={article.id} className="border-b border-line last:border-b-0">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block py-3"
            >
              <span className="block text-sm font-bold leading-relaxed text-ink transition group-hover:text-brand-700">
                {reasons.includes(REASONS.safetySlot) && <Kind>相談できる先</Kind>}
                {article.sourceType === BOOK_SOURCE_TYPE && <Kind>書籍</Kind>}
                <span className="break-words underline decoration-line underline-offset-4 group-hover:decoration-brand-600">
                  {article.title}
                </span>
                <ExternalLink
                  size={13}
                  strokeWidth={2.2}
                  aria-hidden="true"
                  className="ml-1 inline-block align-[-1px] text-ink-faint"
                />
                <span className="sr-only">（外部サイトが新しいタブで開きます）</span>
              </span>
              <span className="mt-0.5 block break-words text-xs text-ink-faint">
                {article.sourceType === BOOK_SOURCE_TYPE
                  ? `${article.author}／${article.publisher}`
                  : article.publisher}
              </span>
              <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-soft">
                {article.summary}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

// 記事の種類を示す小さなラベル（色は付けない）
function Kind({ children }) {
  return (
    <span className="mr-1.5 inline-block whitespace-nowrap rounded-md border border-control px-1.5 align-[1px] text-[11px] font-bold leading-relaxed text-ink-soft">
      {children}
    </span>
  )
}
