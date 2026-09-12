import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { APP } from '../config'

// 画面上部のヘッダー。back があれば戻るボタンを表示。
export default function Header({ title, subtitle, back = false }) {
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-cream/85 backdrop-blur-md">
      <div className="flex items-center gap-2 px-4 py-3">
        {back && (
          <button
            onClick={() => navigate(-1)}
            aria-label="戻る"
            className="-ml-1.5 flex size-9 shrink-0 items-center justify-center rounded-full text-ink-soft transition hover:bg-sage-50 active:scale-95"
          >
            <ChevronLeft size={22} />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-base font-bold text-ink">
            {title || APP.name}
          </h1>
          {subtitle && (
            <p className="truncate text-xs text-ink-faint">{subtitle}</p>
          )}
        </div>
      </div>
    </header>
  )
}
