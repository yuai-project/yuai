import { Check, HandHeart } from 'lucide-react'
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
    <section className="rounded-2xl border border-brand-100 bg-surface p-4 shadow-[0_1px_2px_rgba(60,50,40,0.03)]">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          <HandHeart size={17} strokeWidth={2.1} />
        </span>
        <h2 className="font-bold leading-tight text-ink">
          あなたが求めているサポート
        </h2>
      </div>

      <ul className="space-y-2">
        {labelsOf(DESIRED_SUPPORT, values).map((label) => (
          <li
            key={label}
            className="flex items-start gap-2.5 rounded-xl bg-brand-50/70 px-3 py-2.5 text-sm leading-relaxed text-ink"
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
