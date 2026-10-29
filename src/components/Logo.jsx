import { APP } from '../config'
import { WORDMARK_PATH } from './logoPaths'

// 高さで大きさを決める（幅は比率どおりに決まる）
const sizes = {
  sm: 'h-5',
  md: 'h-7',
  lg: 'h-9',
  // トップページのヒーロー用。スマホではメインコピーより控えめに
  hero: 'h-6 lg:h-8',
}

// 色は文字色（currentColor）を使う。白い面では緑、緑の面では白抜きにする
const tones = {
  brand: 'text-brand',
  inverse: 'text-brand-ink',
}

// Yorido のロゴ（ワードマーク）。o を2つともアーチ窓にした形で、名前の「よりどころ」＝戻ってこられる場所を表す。
// 画像として読み上げ、名前は APP.name から出す
export default function Logo({ size = 'md', tone = 'brand', className = '' }) {
  return (
    <svg
      viewBox="0 0 862 226"
      role="img"
      aria-label={APP.name}
      className={`w-auto shrink-0 ${sizes[size]} ${tones[tone]} ${className}`}
    >
      <path fill="currentColor" fillRule="evenodd" d={WORDMARK_PATH} />
    </svg>
  )
}

// 窓の線画。帯やフッターの端に、薄く添える飾り（読み上げない）
export function WindowLine({ className = '' }) {
  return (
    <svg
      viewBox="0 0 120 150"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`pointer-events-none shrink-0 ${className}`}
    >
      <path d="M12 146 V60 A48 48 0 0 1 108 60 V146 Z" />
      <path d="M60 12 V146 M12 78 H108" />
      <path d="M2 146 H118" />
    </svg>
  )
}
