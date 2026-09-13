import { Check } from 'lucide-react'

// ステップ形式フォームの進捗表示（例: 1 / 3）。
// PC幅では、全ステップの一覧も表示する（見るだけ。進む順序はスマホと同じ）。
export default function StepProgress({ current, steps }) {
  const total = steps.length
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-bold leading-snug text-ink">
          {steps[current - 1]}
        </h2>
        <p className="shrink-0 text-sm font-bold text-brand-700">
          <span className="sr-only">全{total}ステップ中 </span>
          {current}
          <span className="font-medium text-ink-faint"> / {total}</span>
        </p>
      </div>
      <div className="mt-2.5 flex gap-1.5" aria-hidden="true">
        {steps.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              i < current ? 'bg-brand' : 'bg-line'
            }`}
          />
        ))}
      </div>

      <ol className="mt-6 hidden space-y-1 lg:block" aria-hidden="true">
        {steps.map((title, i) => {
          const n = i + 1
          const done = n < current
          const active = n === current
          return (
            <li
              key={title}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                active ? 'bg-brand-50 font-bold text-brand-700' : 'text-ink-soft'
              }`}
            >
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  done || active ? 'bg-brand text-brand-ink' : 'bg-cream text-ink-soft ring-1 ring-line'
                }`}
              >
                {done ? <Check size={14} strokeWidth={3} /> : n}
              </span>
              {title}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
