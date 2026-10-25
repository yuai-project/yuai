import { ChevronDown, ExternalLink } from 'lucide-react'
import { sourceSummary } from '../data/adviceSources'

// 結果画面の各項目の本文のすぐ下に出す、小さな出典のリンク（#213）。
// 1件ならドメインをそのままリンクにする。2件以上なら「bbc.com ＋1」を押すと、記事の一覧が開く。
// 色は増やさず、「このヒントの参考にした情報」と同じ控えめな見た目にする。sources が空なら何も出さない。
export default function ItemSources({ sources }) {
  const summary = sourceSummary(sources)
  if (!summary) return null
  const { first, rest } = summary

  if (rest === 0) {
    return (
      <p className="mt-3 text-xs leading-relaxed text-ink-faint">
        参考：
        <SourceLink source={first} withTitle>
          {first.domain}
        </SourceLink>
      </p>
    )
  }

  return (
    <details className="group mt-3 text-xs leading-relaxed">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1 py-0.5 text-ink-faint transition hover:text-brand-700 [&::-webkit-details-marker]:hidden">
        参考：
        <span className="text-ink-soft underline decoration-line underline-offset-2">
          {first.domain}
        </span>
        <span className="text-ink-soft">＋{rest}</span>
        <ChevronDown
          size={12}
          strokeWidth={2.2}
          aria-hidden="true"
          className="transition group-open:rotate-180"
        />
      </summary>
      <ul className="mt-1 space-y-1">
        {sources.map((s) => (
          <li key={s.id}>
            <SourceLink source={s}>{s.title}</SourceLink>
            <span className="ml-1.5 inline-block whitespace-nowrap text-ink-faint">{s.domain}</span>
          </li>
        ))}
      </ul>
    </details>
  )
}

// 外部の記事へのリンク。新しいタブで開く。
// withTitle: 見た目はドメインだけのとき、読み上げでは記事のタイトルも伝える
function SourceLink({ source, withTitle = false, children }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      title={source.title}
      className="inline text-ink-soft underline decoration-line underline-offset-2 transition hover:text-brand-700"
    >
      {children}
      <ExternalLink
        size={12}
        strokeWidth={2.2}
        aria-hidden="true"
        className="ml-1 inline-block align-[-1px] text-ink-faint"
      />
      <span className="sr-only">
        （{withTitle && `${source.title}。`}外部サイトが新しいタブで開きます）
      </span>
    </a>
  )
}
