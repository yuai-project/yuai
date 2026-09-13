import { ChevronDown } from 'lucide-react'

// フォーム用のプルダウン。未選択は value=''（placeholder を表示）。
// iOSでフォーカス時にズームしないよう文字は16px、指で押しやすい高さ48px。
export default function SelectField({
  value,
  onChange,
  options,
  placeholder = '選択してください',
  invalid = false,
  className = '',
  ...rest
}) {
  const current = value ?? ''
  return (
    <div className={`relative ${className}`}>
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid || undefined}
        className={`min-h-12 w-full appearance-none rounded-xl border bg-surface py-2.5 pl-3.5 pr-10 text-base outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100 ${
          invalid ? 'border-notice-700/50' : 'border-line'
        } ${current === '' ? 'text-ink-faint' : 'text-ink'}`}
        {...rest}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value} className="text-ink">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={18}
        aria-hidden="true"
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-faint"
      />
    </div>
  )
}
