import { Check } from 'lucide-react'
import { useI18n } from '../../i18n/useI18n'

// ステップ形式フォームの進捗表示（例: 2 / 3）。
// onBrand のときはブランド色の帯の上に白で出す（スマホ）。そうでなければ白い面の上に出す（PCのパネル）。
export default function StepProgress({ current, steps, onBrand = false }) {
  const { t } = useI18n()
  const total = steps.length
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2
          className={`min-w-0 text-lg font-bold leading-snug [word-break:auto-phrase] lg:text-xl ${
            onBrand ? 'text-brand-ink' : 'text-ink'
          }`}
        >
          {steps[current - 1]}
        </h2>
        <p
          className={`shrink-0 whitespace-nowrap text-sm font-bold ${
            onBrand ? 'text-brand-ink' : 'text-brand-700'
          }`}
        >
          <span className="sr-only">{t('steps.srPrefix', { total })}</span>
          {current}
          <span className={`font-normal ${onBrand ? '' : 'text-ink-faint'}`}> / {total}</span>
        </p>
      </div>
      {onBrand && (
        <div className="mt-3 flex gap-1.5" aria-hidden="true">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                i < current ? 'bg-brand-ink' : 'bg-brand-ink/30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// PC幅で左列に出す、全ステップの一覧（見るだけ。進む順序はスマホと同じ）。
export function StepList({ current, steps }) {
  return (
    <ol className="space-y-1" aria-hidden="true">
      {steps.map((title, i) => {
        const n = i + 1
        const done = n < current
        const active = n === current
        return (
          <li
            key={title}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
              active ? 'bg-brand-50 font-bold text-ink' : 'text-ink-soft'
            }`}
          >
            <span
              className={`flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                done || active
                  ? 'border-brand bg-brand text-brand-ink'
                  : 'border-control bg-surface text-ink-soft'
              }`}
            >
              {done ? <Check size={14} strokeWidth={3} /> : n}
            </span>
            <span className="min-w-0 [word-break:auto-phrase]">{title}</span>
          </li>
        )
      })}
    </ol>
  )
}
