import { useId, useState } from 'react'
import { ChevronDown, ExternalLink } from 'lucide-react'
import { sourceSummary } from '../data/adviceSources'
import { useI18n } from '../i18n/useI18n'

// 結果画面の各項目の本文のすぐ下に出す、小さな出典のリンク（#213）。
// 先頭の1件のドメインは、押すとそのまま記事が開くリンク。2件以上のときは、横の「＋1」が
// 残りの記事の一覧を開くボタンになる。sources が空なら何も出さない。
// 色は増やさず、「このヒントの参考にした情報」と同じ控えめな見た目にする。
// 文字は小さいが、押せる部分は高さ 32px 以上にする（min-h-8）。
export default function ItemSources({ sources }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const listId = useId()
  const summary = sourceSummary(sources)
  if (!summary) return null
  const { first, rest } = summary

  return (
    <div className="mt-2 text-xs leading-relaxed text-ink-faint">
      <p className="flex flex-wrap items-center gap-x-1">
        {t('sources.label')}
        <SourceLink source={first} withTitle className="inline-flex min-h-8 items-center">
          {first.domain}
        </SourceLink>
        <SourceLangNote source={first} />
        {rest > 0 && (
          <button
            type="button"
            aria-expanded={open}
            aria-controls={listId}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex min-h-8 min-w-8 items-center justify-center gap-0.5 rounded-md px-1.5 text-ink-soft transition hover:text-brand-700"
          >
            <span aria-hidden="true">＋{rest}</span>
            <span className="sr-only">
              {t(open ? 'sources.hideMore' : 'sources.showMore', { count: rest })}
            </span>
            <ChevronDown
              size={12}
              strokeWidth={2.2}
              aria-hidden="true"
              className={`transition ${open ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </p>
      {rest > 0 && (
        <ul id={listId} hidden={!open} className="mb-1">
          {sources.slice(1).map((s) => (
            <li key={s.id} className="py-1.5">
              <SourceLink source={s}>{s.title}</SourceLink>
              <span className="ml-1.5 inline-block whitespace-nowrap">{s.domain}</span>
              <SourceLangNote source={s} className="ml-1.5" />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// 外部の記事へのリンク。新しいタブで開く。
// withTitle: 見た目はドメインだけのとき、読み上げでは記事のタイトルも伝える
function SourceLink({ source, withTitle = false, className = 'inline', children }) {
  const { t, lang } = useI18n()
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      title={source.title}
      className={`${className} text-ink-soft underline decoration-line underline-offset-2 transition hover:text-brand-700`}
    >
      {/* 見た目が記事のタイトルのときは、そのページの言語で読み上げる */}
      {withTitle || source.lang === lang ? children : <span lang={source.lang}>{children}</span>}
      <ExternalLink
        size={12}
        strokeWidth={2.2}
        aria-hidden="true"
        className="ml-1 inline-block align-[-1px] text-ink-faint"
      />
      <span className="sr-only">
        {withTitle
          ? t('sources.linkWithTitle', { title: source.title })
          : t('common.opensInNewTab')}
      </span>
    </a>
  )
}

// 英語の画面で、日本語のページへのリンクに「Japanese」と添える（#217）。日本語の画面では何も出さない
export function SourceLangNote({ source, className = '' }) {
  const { t, lang } = useI18n()
  if (lang !== 'en' || source.lang !== 'ja') return null
  return <span className={`inline-block whitespace-nowrap text-ink-faint ${className}`}>({t('articles.inJapanese')})</span>
}
