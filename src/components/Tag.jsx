// 関係性・テーマなどのタグ。tone で色味を切り替え。
const tones = {
  sage: 'bg-sage-50 text-sage-700 border-sage-100',
  warm: 'bg-warm-50 text-warm-600 border-warm-100',
  calm: 'bg-calm-50 text-calm-700 border-calm-200',
  plain: 'bg-cream text-ink-soft border-line',
}

export default function Tag({ children, tone = 'plain', className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
