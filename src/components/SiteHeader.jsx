import { Link } from 'react-router-dom'
import { APP } from '../config'
import Logo from './Logo'

// PC幅（lg: 1024px〜）で表示する上部ヘッダー。ロゴを押すとホームに戻る。
// ナビは置かない（#172）。スマホ・タブレットでは各画面の Header が上に来るため非表示。
export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 hidden border-b border-line bg-surface/90 backdrop-blur-md lg:block">
      <div className="mx-auto flex h-16 max-w-page items-center px-8">
        <Link to="/" aria-label={`${APP.name} ホーム`} className="rounded-md">
          <Logo size="md" />
        </Link>
      </div>
    </header>
  )
}
