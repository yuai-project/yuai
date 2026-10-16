// フォーム1項目分のラベル・必須/任意バッジ・補足・エラー表示。
// htmlFor があれば <label>、なければ id 付きの見出し（ChoiceGroup の aria-labelledby 用）。
export default function FormField({
  id,
  htmlFor,
  label,
  required = false,
  hint,
  error,
  children,
}) {
  const labelClass = 'min-w-0 text-sm font-bold leading-relaxed text-ink [word-break:auto-phrase]'
  return (
    <section>
      <div className="flex items-start justify-between gap-3">
        {htmlFor ? (
          <label id={id} htmlFor={htmlFor} className={labelClass}>
            {label}
          </label>
        ) : (
          <p id={id} className={labelClass}>
            {label}
          </p>
        )}
        <span
          className={`mt-0.5 shrink-0 whitespace-nowrap rounded-md border px-1.5 text-[11px] font-bold leading-relaxed ${
            required ? 'border-brand text-brand-700' : 'border-control text-ink-soft'
          }`}
        >
          {required ? '必須' : '任意'}
        </span>
      </div>
      {hint && (
        <p className="mt-0.5 text-xs leading-relaxed text-ink-faint">{hint}</p>
      )}
      <div className="mt-2.5">{children}</div>
      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-notice-700">
          {error}
        </p>
      )}
    </section>
  )
}
