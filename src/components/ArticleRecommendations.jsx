import { ExternalLink } from 'lucide-react'
import { useId } from 'react'
import { BOOK_SOURCE_TYPE } from '../data/articleTags'
import { DESIRED_SUPPORT, labelsOf } from '../data/consultationIntake'
import { REASONS, SUPPORT_TYPE_BY_DESIRED } from '../data/recommendArticles'
import { useI18n } from '../i18n/useI18n'

// 結果画面の「近い状況の記事や本」。recommendArticles() の戻り値をそのまま受け取る。
// 0件なら何も表示しない。点数（score）と減点（penalties）は画面に出さない。
// 記事は罫線で区切った一覧にする（カードを重ねない）。
// desiredSupport はフォームで選んだ「求めるサポート」。記事選びに効くものだけ、説明の一言に名前を出す（#225）
// 結果画面では幅によって2か所に出すことがあるので、見出しの id は useId で作る
export default function ArticleRecommendations({ result, desiredSupport = [], className = '' }) {
  const { t, lang } = useI18n()
  const titleId = useId()
  const items = result?.articles ?? []
  if (items.length === 0) return null
  const matched = labelsOf(
    DESIRED_SUPPORT,
    desiredSupport.filter((v) => SUPPORT_TYPE_BY_DESIRED[v]),
    lang,
  )
    .map((label) => `${t('common.quoteOpen')}${label}${t('common.quoteClose')}`)
    .join(t('articles.labelSep'))
  const note = result.isFallback
    ? t('articles.fallbackNote')
    : matched
      ? t('articles.matchedNote', { labels: matched })
      : t('articles.externalNote')

  return (
    <section
      aria-labelledby={titleId}
      className={`rounded-xl border border-line bg-surface p-4 lg:p-5 ${className}`}
    >
      <h2
        id={titleId}
        className="text-base font-bold leading-snug text-ink [word-break:auto-phrase]"
      >
        {t('articles.title')}
      </h2>
      <p className="mt-0.5 text-xs leading-relaxed text-ink-faint">
        {note}
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
                {reasons.includes(REASONS.safetySlot) && <Kind>{t('articles.kindSupport')}</Kind>}
                {article.sourceType === BOOK_SOURCE_TYPE && <Kind>{t('articles.kindBook')}</Kind>}
                {/* タイトルは原文のまま。英語の画面では、日本語の記事だと分かるようにする（#217） */}
                {lang !== 'ja' && <Kind>{t('articles.inJapanese')}</Kind>}
                <span
                  lang={lang !== 'ja' ? 'ja' : undefined}
                  className="break-words underline decoration-line underline-offset-4 group-hover:decoration-brand-600"
                >
                  {article.title}
                </span>
                <ExternalLink
                  size={13}
                  strokeWidth={2.2}
                  aria-hidden="true"
                  className="ml-1 inline-block align-[-1px] text-ink-faint"
                />
                <span className="sr-only">{t('common.opensInNewTab')}</span>
              </span>
              <span
                lang={lang !== 'ja' ? 'ja' : undefined}
                className="mt-0.5 block break-words text-xs text-ink-faint"
              >
                {article.sourceType === BOOK_SOURCE_TYPE
                  ? `${article.author}／${article.publisher}`
                  : article.publisher}
              </span>
              {/* 要約は英語版（summaryEn）があればそれを出す。無ければ日本語の要約 */}
              <span
                lang={lang === 'en' && !article.summaryEn ? 'ja' : undefined}
                className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-soft"
              >
                {lang === 'en' ? (article.summaryEn ?? article.summary) : article.summary}
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
