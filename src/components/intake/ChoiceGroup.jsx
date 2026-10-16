import { Check } from 'lucide-react'

// 文字が大きいときや画面が狭いときは、入りきらない列から1列に落ちる
const layouts = {
  chip: 'flex flex-wrap gap-2', // 折り返して並ぶ（短い選択肢）
  grid: 'grid grid-cols-[repeat(auto-fit,minmax(min(100%,7rem),1fr))] gap-2', // 横に並べるタイル（短い選択肢）
  card: 'grid grid-cols-1 gap-2 lg:grid-cols-2', // 1行ずつのカード（文章が長い選択肢。PCは2列）
}

// 高さは中身に合わせる（長い選択肢は折り返して伸びる）
const shapes = {
  chip: 'min-h-11 max-w-full gap-1.5 rounded-xl px-3.5 py-2 text-left leading-snug',
  grid: 'min-h-12 justify-center gap-1.5 rounded-xl px-3 py-2.5 text-center leading-snug',
  card: 'min-h-12 w-full gap-3 rounded-xl px-3.5 py-3 text-left leading-relaxed',
}

// 選んだ項目は、太い枠（枠＋内側の線で2px。外寸は変えない）・淡いブランド色・チェックで示す。
// 選んでいない枠は部品用の control 色（白で3:1以上）。
const state = (on) =>
  on
    ? 'border-brand bg-brand-50 font-bold text-ink ring-1 ring-inset ring-brand'
    : 'border-control bg-surface font-medium text-ink hover:bg-brand-50'

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
              className={`flex min-w-0 items-center border text-sm transition ${shapes[variant]} ${state(on)}`}
            >
              {variant === 'card' ? (
                <Indicator on={on} multiple={multiple} />
              ) : (
                on && <SelectedMark />
              )}
              <span className="min-w-0 break-words [word-break:auto-phrase]">{label}</span>
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
                className={`flex min-h-11 min-w-32 max-w-full items-center justify-center gap-1.5 rounded-xl border px-5 py-2 text-sm leading-snug transition ${
                  on ? state(true) : 'border-control bg-cream font-medium text-ink-soft hover:bg-brand-50'
                }`}
              >
                {on && <SelectedMark />}
                <span className="min-w-0 break-words [word-break:auto-phrase]">{label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SelectedMark() {
  return <Check size={15} strokeWidth={2.8} aria-hidden="true" className="shrink-0 text-brand-700" />
}

function Indicator({ on, multiple }) {
  return (
    <span
      aria-hidden="true"
      className={`flex size-5 shrink-0 items-center justify-center border-2 transition ${
        multiple ? 'rounded-md' : 'rounded-full'
      } ${on ? 'border-brand bg-brand text-brand-ink' : 'border-control bg-surface'}`}
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
