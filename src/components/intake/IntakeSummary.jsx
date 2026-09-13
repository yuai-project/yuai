import { ChevronDown, ClipboardList, PencilLine } from 'lucide-react'
import { summarizeRequest } from '../../data/consultationIntake'

// AI相談結果の上部に出す「相談内容のまとめ」。初期状態は折りたたみ。
export default function IntakeSummary({ request, onEdit }) {
  const rows = summarizeRequest(request)
  if (rows.length === 0) return null

  return (
    <details className="group rounded-2xl border border-line bg-surface p-4 shadow-[0_1px_2px_rgba(60,50,40,0.03)]">
      <summary className="flex cursor-pointer list-none items-center gap-2.5 [&::-webkit-details-marker]:hidden">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          <ClipboardList size={17} strokeWidth={2.1} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold leading-tight text-ink">
            相談内容のまとめ
          </span>
          <span className="block text-xs text-ink-faint">
            タップすると入力した内容を確認できます
          </span>
        </span>
        <ChevronDown
          size={18}
          className="shrink-0 text-ink-faint transition group-open:rotate-180"
        />
      </summary>

      <dl className="mt-4 space-y-3 border-t border-line pt-4">
        {rows.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-[11px] font-semibold text-ink-faint">{label}</dt>
            <dd className="mt-0.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-ink">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-brand-200 bg-surface py-2.5 text-sm font-bold text-brand-700 transition hover:bg-brand-50 active:scale-[0.98]"
        >
          <PencilLine size={16} />
          内容を修正する
        </button>
      )}
    </details>
  )
}
