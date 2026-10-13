import { SUPPORT_LINES_NOTICE, telHref } from '../data/supportLines'

// 電話で相談できる窓口の一覧。番号はタップで電話をかけられる。
// マイページの「つらいときの相談窓口」と、結果画面の安全のカードで共用。
export default function SupportLineList({ lines }) {
  return (
    <>
      <ul className="mt-3 space-y-2">
        {lines.map((line) => (
          <li key={line.id} className="rounded-xl bg-surface/70 px-3 py-2.5">
            <p className="text-sm font-bold text-ink">{line.name}</p>
            <p className="flex flex-wrap items-baseline gap-x-2">
              <a
                href={telHref(line.tel)}
                aria-label={`${line.name}に電話をかける ${line.tel}`}
                className="inline-block py-2 text-base font-bold text-calm-700 underline underline-offset-2"
              >
                {line.tel}
              </a>
              {line.note && <span className="text-xs text-ink-soft">（{line.note}）</span>}
            </p>
            <p className="text-xs leading-relaxed text-ink-soft">{line.description}</p>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] leading-relaxed text-ink-faint">{SUPPORT_LINES_NOTICE}</p>
    </>
  )
}
