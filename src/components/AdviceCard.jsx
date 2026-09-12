// AI相談結果の各セクションを包むカード。
// tone で色味を切り替え、汎用チャットではない「構造化された回答」を演出する。
const tones = {
  you: {
    wrap: 'bg-sage-50 border-sage-100',
    icon: 'bg-sage-500 text-white',
    title: 'text-sage-700',
  },
  neutral: {
    wrap: 'bg-surface border-line',
    icon: 'bg-calm-50 text-calm-700',
    title: 'text-ink',
  },
  avoid: {
    wrap: 'bg-notice-50 border-notice-200',
    icon: 'bg-notice-200 text-notice-700',
    title: 'text-notice-700',
  },
  try: {
    wrap: 'bg-warm-50 border-warm-100',
    icon: 'bg-warm-400 text-white',
    title: 'text-warm-600',
  },
  safety: {
    wrap: 'bg-calm-50 border-calm-200',
    icon: 'bg-calm-700 text-white',
    title: 'text-calm-700',
  },
}

export default function AdviceCard({
  icon: Icon,
  step,
  title,
  tone = 'neutral',
  children,
}) {
  const t = tones[tone] || tones.neutral
  return (
    <section
      className={`rounded-2xl border p-4 shadow-[0_1px_2px_rgba(60,50,40,0.03)] ${t.wrap}`}
    >
      <div className="mb-3 flex items-center gap-2.5">
        {Icon && (
          <span
            className={`flex size-8 shrink-0 items-center justify-center rounded-full ${t.icon}`}
          >
            <Icon size={17} strokeWidth={2.1} />
          </span>
        )}
        <div className="min-w-0">
          {step && (
            <span className="block text-[10px] font-bold uppercase tracking-wider text-ink-faint">
              {step}
            </span>
          )}
          <h2 className={`font-bold leading-tight ${t.title}`}>{title}</h2>
        </div>
      </div>
      <div className="text-sm leading-relaxed text-ink-soft">{children}</div>
    </section>
  )
}
