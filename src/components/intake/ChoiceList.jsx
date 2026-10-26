import { useI18n } from '../../i18n/useI18n'

// 選択肢の縦のリスト。1つ選ぶ質問はラジオボタン、複数選べる質問（multiple）はチェックボックス。
// - 選んだ行は淡いブランド色の背景に、緑の太字。行の区切りは line 色の線
// - separateValue（例: 「わからない」）はほかの選択肢と同時に選べない。リストから離して「または」の下に置く
// - 選んでも自動では次に進まない（「次へ」は画面の下）
export default function ChoiceList({
  name,
  options,
  value,
  onChange,
  multiple = false,
  separateValue,
  labelledBy,
  describedBy,
  invalid = false,
}) {
  const { t } = useI18n()
  const isOn = (v) => (multiple ? value.includes(v) : value === v)

  const toggle = (v) => {
    if (!multiple) return onChange(v)
    if (value.includes(v)) return onChange(value.filter((x) => x !== v))
    if (v === separateValue) return onChange([v])
    onChange([...value.filter((x) => x !== separateValue), v])
  }

  const main = options.filter((o) => o.value !== separateValue)
  const separate = options.filter((o) => o.value === separateValue)

  const rows = (list) => (
    <div className="border-t border-line">
      {list.map(({ value: v, label }) => {
        const on = isOn(v)
        return (
          <label
            key={v}
            className={`flex min-h-13 cursor-pointer items-center gap-3.5 border-b border-line px-2.5 py-3 text-base leading-snug transition ${
              on ? 'bg-brand-50 font-bold text-brand-700' : 'text-ink hover:bg-cream'
            }`}
          >
            <input
              type={multiple ? 'checkbox' : 'radio'}
              name={name}
              value={v}
              checked={on}
              onChange={() => toggle(v)}
              className="size-5 shrink-0 accent-brand"
            />
            <span className="min-w-0 break-words [word-break:auto-phrase]">{label}</span>
          </label>
        )
      })}
    </div>
  )

  return (
    <div
      role={multiple ? 'group' : 'radiogroup'}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
    >
      {rows(main)}
      {separate.length > 0 && (
        <>
          <p className="my-4 flex items-center gap-3 text-sm text-ink-faint">
            <span aria-hidden="true" className="h-px flex-1 bg-line" />
            {t('consult.or')}
            <span aria-hidden="true" className="h-px flex-1 bg-line" />
          </p>
          {rows(separate)}
        </>
      )}
    </div>
  )
}
