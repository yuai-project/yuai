import { Heart } from 'lucide-react'
import { APP } from '../config'

const sizes = {
  sm: { mark: 'size-7', icon: 13, text: 'text-base' },
  md: { mark: 'size-9', icon: 16, text: 'text-xl' },
  lg: { mark: 'size-11', icon: 20, text: 'text-2xl' },
  // トップページのヒーロー用。スマホではメインコピーより小さく、PCでは少し大きく
  hero: { mark: 'size-9 lg:size-11', icon: 18, text: 'text-lg lg:text-2xl' },
}

// Yorido のロゴ（マーク＋ワードマーク）。マークは装飾なので読み上げない。
export default function Logo({ size = 'md', className = '' }) {
  const s = sizes[size]
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        aria-hidden="true"
        className={`flex ${s.mark} shrink-0 items-center justify-center rounded-[35%] bg-brand text-white shadow-[0_2px_8px_rgba(242,138,69,0.25)]`}
      >
        <Heart size={s.icon} fill="currentColor" strokeWidth={0} />
      </span>
      <span className={`${s.text} font-bold tracking-tight text-ink`}>
        {APP.name}
      </span>
    </span>
  )
}
