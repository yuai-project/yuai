import Tag from '../Tag'

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
  const labelClass = 'text-sm font-semibold leading-relaxed text-ink'
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
        <Tag tone={required ? 'brand' : 'plain'} className="mt-0.5 shrink-0">
          {required ? '必須' : '任意'}
        </Tag>
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
