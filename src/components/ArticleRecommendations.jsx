import { BookOpen, ExternalLink, LifeBuoy } from 'lucide-react'
import { BOOK_SOURCE_TYPE } from '../data/articleTags'
import { REASONS } from '../data/recommendArticles'
import Tag from './Tag'

// 結果画面の「あなたの状況に合いそうな情報」。recommendArticles() の戻り値をそのまま受け取る。
// 0件なら何も表示しない。点数（score）と減点（penalties）は画面に出さない。
export default function ArticleRecommendations({ result }) {
  const items = result?.articles ?? []
  if (items.length === 0) return null

  return (
    <section className="rounded-2xl border border-line bg-surface p-4 shadow-[0_1px_2px_rgba(60,50,40,0.03)]">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          <BookOpen size={17} strokeWidth={2.1} />
        </span>
        <h2 className="font-bold leading-tight text-ink">
          あなたの状況に合いそうな情報
        </h2>
      </div>

      {result.isFallback && (
        <p className="mb-3 text-xs leading-relaxed text-ink-faint">
          まずはこちらから。気になるものがあれば、読めそうなときに開いてみてください。
        </p>
      )}

      <ul className="space-y-2">
        {items.map(({ article, reasons }) => (
          <li key={article.id}>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-xl border border-line bg-cream px-3 py-2.5 transition hover:border-brand-200"
            >
              {reasons.includes(REASONS.safetySlot) && (
                <Tag tone="calm" className="mb-1.5 gap-1">
                  <LifeBuoy size={12} strokeWidth={2.2} aria-hidden="true" />
                  相談できる先
                </Tag>
              )}
              {article.sourceType === BOOK_SOURCE_TYPE && (
                <Tag className="mb-1.5">書籍</Tag>
              )}
              <span className="flex items-start gap-1.5 text-sm font-bold leading-snug text-ink transition group-hover:text-brand-700">
                <span className="min-w-0 break-words">{article.title}</span>
                <ExternalLink
                  size={14}
                  strokeWidth={2.2}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-ink-faint"
                />
                <span className="sr-only">（外部サイトが新しいタブで開きます）</span>
              </span>
              <span className="mt-0.5 block break-words text-xs text-ink-faint">
                {article.sourceType === BOOK_SOURCE_TYPE
                  ? `${article.author}／${article.publisher}`
                  : article.publisher}
              </span>
              <span className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink-soft">
                {article.summary}
              </span>
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-[11px] leading-relaxed text-ink-faint">
        外部のサイトが開きます。
      </p>
    </section>
  )
}
