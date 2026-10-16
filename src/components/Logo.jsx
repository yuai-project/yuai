import { APP } from '../config'

const sizes = {
  sm: { mark: 'size-7', text: 'text-base' },
  md: { mark: 'size-9', text: 'text-xl' },
  lg: { mark: 'size-11', text: 'text-2xl' },
  // トップページのヒーロー用。スマホではメインコピーより小さく、PCでは少し大きく
  hero: { mark: 'size-9 lg:size-11', text: 'text-lg lg:text-2xl' },
}

// Yorido のマーク（仮：D案「アーチ窓」）。ブランド色のタイルに、戻ってこられる場所としての窓。
// 仕上げはデザイン担当に確認する（#171）。public/favicon.svg も同じ形。
function Mark({ className }) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" className={`shrink-0 ${className}`}>
      <rect width="120" height="120" rx="26" className="fill-brand" />
      <path d="M36 94 L36 50 A24 24 0 0 1 84 50 L84 94 Z" className="fill-surface" />
      <path d="M60 26 L60 94 M36 62 L84 62" fill="none" strokeWidth="6" className="stroke-brand" />
      <path d="M28 98 L92 98" fill="none" strokeWidth="6" strokeLinecap="round" className="stroke-brand-200" />
    </svg>
  )
}

// Yorido のロゴ（マーク＋ワードマーク）。マークは装飾なので読み上げない。
export default function Logo({ size = 'md', className = '' }) {
  const s = sizes[size]
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Mark className={s.mark} />
      <span className={`${s.text} font-bold tracking-tight text-ink`}>
        {APP.name}
      </span>
    </span>
  )
}
