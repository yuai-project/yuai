import { Home, MessageCircleHeart, BookOpen, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', label: 'ホーム', icon: Home, end: true },
  { to: '/consult', label: 'AI相談', icon: MessageCircleHeart },
  { to: '/stories', label: '体験談', icon: BookOpen },
  { to: '/mypage', label: 'マイpage', icon: User },
]

// 下部タブナビ。モバイルシェル幅に固定。
export default function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-20 border-t border-line bg-surface/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-4">
        {items.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition ${
                  isActive ? 'text-sage-600' : 'text-ink-faint'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.4 : 1.9}
                    className="transition"
                  />
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
