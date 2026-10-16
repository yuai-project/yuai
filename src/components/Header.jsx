import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { APP } from '../config'

const tones = {
  plain: {
    wrap: 'border-b border-line bg-surface/90 backdrop-blur-md lg:border-b-0 lg:bg-transparent lg:backdrop-blur-none',
    back: 'text-ink-soft hover:bg-brand-50 lg:border lg:border-line lg:bg-surface',
    title: 'text-ink',
    subtitle: 'text-ink-faint',
  },
  // 相談フォーム・結果画面：すぐ下のブランド色の帯とひと続きに見せる
  brand: {
    wrap: 'bg-brand text-brand-ink',
    back: 'text-brand-ink hover:bg-brand-400 lg:border lg:border-brand-ink/60',
    title: 'text-brand-ink',
    subtitle: 'text-brand-ink',
  },
}

// 画面上部のヘッダー。back があれば戻るボタンを表示。
// onBack を渡すと戻る動作を差し替えられる（ステップ形式フォームなど）。
// スマホでは上部に固定、PC（lg〜）では上部ナビの下に置くページタイトルになる。
// 文字を大きくしても切れないよう、タイトルは省略せずに文節で折り返す。
export default function Header({ title, subtitle, back = false, onBack, tone = 'plain' }) {
  const navigate = useNavigate()
  const t = tones[tone] || tones.plain
  return (
    <header className={`sticky top-0 z-20 lg:static ${t.wrap}`}>
      <div className="flex items-center gap-2 px-4 py-3 lg:mx-auto lg:max-w-page lg:gap-3 lg:px-8 lg:pb-2 lg:pt-10">
        {back && (
          <button
            onClick={onBack ?? (() => navigate(-1))}
            aria-label="戻る"
            className={`-ml-1.5 flex size-9 shrink-0 items-center justify-center rounded-full transition active:scale-95 lg:ml-0 lg:size-10 ${t.back}`}
          >
            <ChevronLeft size={22} />
          </button>
        )}
        <div className="min-w-0">
          <h1 className={`text-base font-bold leading-snug [word-break:auto-phrase] lg:text-2xl ${t.title}`}>
            {title || APP.name}
          </h1>
          {subtitle && (
            <p className={`text-xs [word-break:auto-phrase] lg:mt-0.5 lg:text-sm ${t.subtitle}`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </header>
  )
}
