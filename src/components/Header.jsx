import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { APP } from '../config'

// 画面上部のヘッダー。back があれば戻るボタンを表示。
// onBack を渡すと戻る動作を差し替えられる（ステップ形式フォームなど）。
// スマホでは上部に固定、PC（lg〜）では上部ナビの下に置くページタイトルになる。
export default function Header({ title, subtitle, back = false, onBack }) {
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/90 backdrop-blur-md lg:static lg:border-b-0 lg:bg-transparent lg:backdrop-blur-none">
      <div className="flex items-center gap-2 px-4 py-3 lg:mx-auto lg:max-w-page lg:gap-3 lg:px-8 lg:pb-2 lg:pt-10">
        {back && (
          <button
            onClick={onBack ?? (() => navigate(-1))}
            aria-label="戻る"
            className="-ml-1.5 flex size-9 shrink-0 items-center justify-center rounded-full text-ink-soft transition hover:bg-brand-50 active:scale-95 lg:ml-0 lg:size-10 lg:border lg:border-line lg:bg-surface"
          >
            <ChevronLeft size={22} />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-base font-bold text-ink lg:whitespace-normal lg:text-2xl">
            {title || APP.name}
          </h1>
          {subtitle && (
            <p className="truncate text-xs text-ink-faint lg:mt-0.5 lg:text-sm">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </header>
  )
}
