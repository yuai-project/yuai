import { Link } from 'react-router-dom'
import { INFO_PAGES } from '../pages/infoPages'
import Phrases from './Phrases'

// どの幅でも出すフッター。ログインやマイページの代わりに、大事な情報への入口をまとめる（#172）。
// 文字が大きくなってもはみ出さないよう、リンクは横に並べて折り返す
export default function SiteFooter() {
  return (
    <footer className="border-t border-line bg-cream pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-page px-5 py-6 lg:flex lg:items-start lg:justify-between lg:gap-10 lg:px-8 lg:py-8">
        <nav aria-label="このサイトについて">
          <ul className="flex flex-wrap gap-x-5 text-sm text-ink-soft">
            {INFO_PAGES.map(({ path, phrases }) => (
              <li key={path}>
                <Link
                  to={path}
                  className="inline-block py-2 underline decoration-control underline-offset-4 transition hover:text-ink"
                >
                  <Phrases phrases={phrases} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="mt-3 text-xs leading-relaxed text-ink-faint [word-break:auto-phrase] lg:mt-2 lg:max-w-md lg:text-right">
          このサービスは一般的な情報提供を目的としたプロトタイプです。医療・法律・緊急支援を提供するものではありません。
        </p>
      </div>
    </footer>
  )
}
