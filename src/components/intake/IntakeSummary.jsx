import { ChevronDown, PencilLine } from 'lucide-react'
import { summarizeRequest } from '../../data/consultationIntake'
import { useI18n } from '../../i18n/useI18n'

// AI相談結果の上部に出す「入力した内容のまとめ」。初期状態は折りたたみ。
export default function IntakeSummary({ request, onEdit }) {
  const { t, lang } = useI18n()
  const rows = summarizeRequest(request, lang)
  if (rows.length === 0) return null

  return (
    <details className="group rounded-xl border border-line bg-surface p-4 lg:p-5">
      <summary className="flex cursor-pointer list-none items-center gap-2.5 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 flex-1">
          <span className="block text-base font-bold leading-snug text-ink [word-break:auto-phrase]">
            {t('intakeSummary.title')}
          </span>
          <span className="block text-xs text-ink-faint">
            {t('intakeSummary.hint')}
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
          className="mt-4 flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-brand bg-surface px-4 py-2.5 text-sm font-bold text-brand-700 transition hover:bg-brand-50 active:scale-[0.98]"
        >
          <PencilLine size={16} />
          {t('intakeSummary.edit')}
        </button>
      )}
    </details>
  )
}
