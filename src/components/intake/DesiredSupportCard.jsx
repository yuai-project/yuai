import { Check } from 'lucide-react'
import {
  DESIRED_SUPPORT,
  DESIRED_SUPPORT_UNSURE,
  labelsOf,
} from '../../data/consultationIntake'

// 結果画面の「あなたが求めているサポート」。相談フォームで選んだ内容を振り返れるようにする。
// 未選択なら何も表示しない。
export default function DesiredSupportCard({ values = [] }) {
  if (values.length === 0) return null
  const onlyUnsure = values.length === 1 && values[0] === DESIRED_SUPPORT_UNSURE

  return (
    <section className="rounded-xl border border-line bg-surface p-4 lg:p-5">
      <h2 className="mb-2 text-base font-bold leading-snug text-ink [word-break:auto-phrase]">
        あなたが求めているサポート
      </h2>

      <ul className="space-y-1.5">
        {labelsOf(DESIRED_SUPPORT, values).map((label) => (
          <li
            key={label}
            className="flex items-start gap-2 text-sm leading-relaxed text-ink"
          >
            <Check
              size={16}
              strokeWidth={2.6}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-brand-700"
            />
            <span>{label}</span>
          </li>
        ))}
      </ul>

      {onlyUnsure && (
        <p className="mt-3 text-xs leading-relaxed text-ink-faint">
          まだはっきりしなくても大丈夫です。下のヒントから、気になるものをひとつ見てみてください。
        </p>
      )}
    </section>
  )
}
