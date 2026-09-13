import { APP } from '../config'
import Logo from './Logo'

// PC幅（lg〜）のみ表示するフッター。スマホでは下部ナビがあるため出さない。
export default function SiteFooter() {
  return (
    <footer className="hidden border-t border-line bg-cream lg:block">
      <div className="mx-auto flex max-w-page items-start justify-between gap-10 px-8 py-8 text-xs leading-relaxed text-ink-faint">
        <div>
          <Logo size="sm" />
          <p className="mt-2">{APP.tagline}</p>
        </div>
        <p className="max-w-md text-right">
          このサービスは一般的な情報提供を目的としたプロトタイプです。医療・法律・緊急支援を提供するものではありません。
        </p>
      </div>
    </footer>
  )
}
