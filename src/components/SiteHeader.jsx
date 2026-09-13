import { BookOpen, Home, MessageCircleHeart, User } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { APP } from '../config'
import Logo from './Logo'

const items = [
  { to: '/', label: 'ホーム', icon: Home, end: true },
  { to: '/consult', label: 'AI相談', icon: MessageCircleHeart },
  { to: '/stories', label: '体験談', icon: BookOpen },
  { to: '/mypage', label: 'マイページ', icon: User },
]

// PC幅（lg: 1024px〜）で表示する上部ナビゲーション。
// スマホ・タブレットでは BottomNav を使うため非表示。
export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 hidden border-b border-line bg-surface/90 backdrop-blur-md lg:block">
      <div className="mx-auto flex h-16 max-w-page items-center justify-between gap-8 px-8">
        <Link to="/" aria-label={`${APP.name} ホーム`} className="rounded-full">
          <Logo size="md" />
        </Link>

        <nav aria-label="メインメニュー">
          <ul className="flex items-center gap-1">
            {items.map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                      isActive
                        ? 'bg-brand-100 font-bold text-brand-700'
                        : 'font-medium text-ink-soft hover:bg-brand-50 hover:text-ink'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={17} strokeWidth={isActive ? 2.4 : 2} />
                      {label}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
