import { IMMERSION_MAX, IMMERSION_MIN } from '../../data/consultationIntake'

// 「その話をどのくらい強く信じているように見えるか」スライダー（1〜10・任意）。
// 相談者本人の感じ方を聞くもので、医学的な評価ではない。
// 未回答（null）を区別するため、触るまでは値を表示しない。
export default function ImmersionSlider({ value, onChange, labelledBy }) {
  const answered = value != null
  const position = answered ? value : Math.floor((IMMERSION_MIN + IMMERSION_MAX) / 2)
  const fill = answered
    ? ((value - IMMERSION_MIN) / (IMMERSION_MAX - IMMERSION_MIN)) * 100
    : 0
  const set = (e) => onChange(Number(e.target.value))

  return (
    <div className="rounded-2xl border border-line bg-surface px-4 pb-3 pt-3.5">
      <div className="flex min-h-8 items-center justify-between gap-3">
        <p className="text-2xl font-bold leading-none" aria-hidden="true">
          <span className={answered ? 'text-brand-700' : 'text-ink-faint'}>
            {answered ? value : '—'}
          </span>
          <span className="text-sm font-medium text-ink-faint"> / {IMMERSION_MAX}</span>
        </p>
        {answered ? (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="rounded-full px-2 py-1 text-xs text-ink-faint underline underline-offset-2 transition hover:text-ink-soft"
          >
            未回答にもどす
          </button>
        ) : (
          <span className="text-xs text-ink-faint">つまみを動かして選べます</span>
        )}
      </div>

      <input
        type="range"
        min={IMMERSION_MIN}
        max={IMMERSION_MAX}
        step={1}
        value={position}
        onChange={set}
        onPointerUp={set}
        aria-labelledby={labelledBy}
        aria-valuetext={answered ? `${value}（${IMMERSION_MAX}段階中）` : '未回答'}
        data-unset={!answered}
        style={{ '--fill': `${fill}%` }}
        className="yorido-range mt-1"
      />

      {/* 両端の説明。句ごとに inline-block にして、句の途中で改行しない */}
      <div className="flex justify-between gap-4 text-[11px] leading-snug text-ink-faint">
        <span className="basis-1/2">
          <span className="font-bold text-ink-soft">1</span>：
          <span className="inline-block">少しだけ信じている</span>
          <span className="inline-block">ように見える</span>
        </span>
        <span className="basis-1/2 text-right">
          <span className="font-bold text-ink-soft">10</span>：
          <span className="inline-block">とても強く信じている</span>
          <span className="inline-block">ように見える</span>
        </span>
      </div>
    </div>
  )
}
