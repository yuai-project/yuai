import { Check } from 'lucide-react'
import { useI18n } from '../../i18n/useI18n'

// 何問目かの表示（例: 3 / 7）。ヘッダーの右端に置く。数字だけ緑の太字
export function QuestionCount({ current, total }) {
  const { t } = useI18n()
  return (
    <p className="shrink-0 whitespace-nowrap text-sm text-ink-soft lg:text-base">
      <span className="sr-only">{t('steps.srPrefix', { total })}</span>
      <strong className="font-bold text-brand-700">{current}</strong> / {total}
    </p>
  )
}

// 進み具合の細いバー。ヘッダーのすぐ下に置く（読み上げは QuestionCount が担う）
export function QuestionBar({ current, total }) {
  return (
    <div className="h-1 bg-brand-100 lg:rounded-full" aria-hidden="true">
      <div
        className="h-1 rounded-r-full bg-brand transition-[width] duration-300 lg:rounded-full"
        style={{ width: `${(current / total) * 100}%` }}
      />
    </div>
  )
}

// PC幅で左列に出す、全問の一覧（見るだけ。進む順序はスマホと同じ）。
export function QuestionList({ current, names }) {
  return (
    <ol className="space-y-1" aria-hidden="true">
      {names.map((name, i) => {
        const n = i + 1
        const done = n < current
        const active = n === current
        return (
          <li
            key={name}
            className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
              active ? 'bg-brand-50 font-bold text-brand-700' : 'text-ink-soft'
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
            <span className="min-w-0 [word-break:auto-phrase]">{name}</span>
          </li>
        )
      })}
    </ol>
  )
}
