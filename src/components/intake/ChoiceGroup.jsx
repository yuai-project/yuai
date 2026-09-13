import { Check } from 'lucide-react'

const layouts = {
  chip: 'flex flex-wrap gap-2', // 折り返すピル型（短い選択肢）
  grid: 'grid grid-cols-2 gap-2', // 2列タイル（短い選択肢を並べる）
  card: 'grid grid-cols-1 gap-2 lg:grid-cols-2', // 1行ずつのカード（文章が長い選択肢。PCは2列）
}

const shapes = {
  chip: 'min-h-11 rounded-full px-4 py-2 active:scale-95',
  grid: 'min-h-12 justify-center rounded-xl px-2 py-2.5 text-center leading-tight active:scale-95',
  card: 'min-h-12 w-full gap-3 rounded-2xl px-4 py-3 text-left leading-relaxed active:scale-[0.99]',
}

// 選択中はブランド色 #ffb37c の塗り＋濃いブラウン文字（白文字は使わない）＋チェック。
const filled = (on) =>
  on
    ? 'border-brand bg-brand font-semibold text-brand-ink'
    : 'border-line bg-surface font-medium text-ink-soft hover:border-brand hover:bg-brand-50'

const soft = (on) =>
  on
    ? 'border-brand bg-brand-50 font-medium text-ink'
    : 'border-line bg-surface font-medium text-ink hover:border-brand-200 hover:bg-brand-50/60'

// タップしやすい選択肢グループ。
// - multiple=false は単一選択（role=radio・もう一度タップで解除）、true は複数選択（role=checkbox）。
// - exclusiveValue（例: 「わからない」）は他の選択肢と同時に選べない。
// - subtleValues に入れた選択肢は、メインの選択肢の下に控えめな見た目で置く
//   （選択時は他と同じ強さで表示し、タップ領域も44px以上を保つ）。
export default function ChoiceGroup({
  options,
  value,
  onChange,
  multiple = false,
  variant = 'chip',
  exclusiveValue,
  subtleValues = [],
  labelledBy,
}) {
  const isOn = (v) => (multiple ? value.includes(v) : value === v)

  const toggle = (v) => {
    if (!multiple) return onChange(value === v ? null : v)
    if (value.includes(v)) return onChange(value.filter((x) => x !== v))
    if (v === exclusiveValue) return onChange([v])
    onChange([...value.filter((x) => x !== exclusiveValue), v])
  }

  const a11y = (on) =>
    multiple
      ? { role: 'checkbox', 'aria-checked': on }
      : { role: 'radio', 'aria-checked': on }

  const main = options.filter((o) => !subtleValues.includes(o.value))
  const subtle = options.filter((o) => subtleValues.includes(o.value))

  return (
    <div
      role={multiple ? 'group' : 'radiogroup'}
      aria-labelledby={labelledBy}
      className={subtle.length ? 'flex flex-col gap-2' : ''}
    >
      <div className={layouts[variant]}>
        {main.map(({ value: v, label }) => {
          const on = isOn(v)
          return (
            <button
              key={v}
              type="button"
              onClick={() => toggle(v)}
              {...a11y(on)}
              className={`flex items-center border text-sm transition ${shapes[variant]} ${
                variant === 'card' ? soft(on) : filled(on)
              }`}
            >
              {variant === 'card' && <Indicator on={on} multiple={multiple} />}
              {variant !== 'card' && on && (
                <Check size={15} strokeWidth={2.6} aria-hidden="true" className="-ml-1 mr-1 shrink-0" />
              )}
              <span className="min-w-0">{label}</span>
            </button>
          )
        })}
      </div>

      {subtle.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {subtle.map(({ value: v, label }) => {
            const on = isOn(v)
            return (
              <button
                key={v}
                type="button"
                onClick={() => toggle(v)}
                {...a11y(on)}
                className={`flex min-h-11 min-w-32 items-center justify-center rounded-full border px-6 py-2 text-sm transition active:scale-95 ${
                  on
                    ? 'border-brand bg-brand font-semibold text-brand-ink'
                    : 'border-line bg-cream font-medium text-ink-soft hover:border-brand hover:bg-brand-50'
                }`}
              >
                {on && <Check size={15} strokeWidth={2.6} aria-hidden="true" className="-ml-1 mr-1 shrink-0" />}
                {label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Indicator({ on, multiple }) {
  return (
    <span
      aria-hidden="true"
      className={`flex size-5 shrink-0 items-center justify-center border-2 transition ${
        multiple ? 'rounded-md' : 'rounded-full'
      } ${on ? 'border-brand-600 bg-brand text-brand-ink' : 'border-ink-faint/60 bg-surface'}`}
    >
      {on &&
        (multiple ? (
          <Check size={13} strokeWidth={3} />
        ) : (
          <span className="size-2 rounded-full bg-brand-ink" />
        ))}
    </span>
  )
}
