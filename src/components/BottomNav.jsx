import { Home, MessageCircleHeart, BookOpen, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', label: 'ホーム', icon: Home, end: true },
  { to: '/consult', label: 'AI相談', icon: MessageCircleHeart },
  { to: '/stories', label: '体験談', icon: BookOpen },
  { to: '/mypage', label: 'マイpage', icon: User },
]

// 下部タブナビ。スマホ・タブレット用（PC幅では SiteHeader の上部ナビを使う）。
// 現在地はアイコン背後の淡いオレンジのピル＋太字で示す（色だけに頼らない）。
export default function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-20 border-t border-line bg-surface/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] lg:hidden">
      <ul className="grid grid-cols-4">
        {items.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 pb-2 pt-1.5 text-[11px] transition ${
                  isActive ? 'font-bold text-brand-700' : 'font-medium text-ink-faint hover:text-ink-soft'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-7 w-12 items-center justify-center rounded-full transition ${
                      isActive ? 'bg-brand-100' : ''
                    }`}
                  >
                    <Icon size={21} strokeWidth={isActive ? 2.4 : 1.9} />
                  </span>
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
