// AI相談結果の1セクション。カードで囲まず、罫線で区切った読み物として並べる。
// 見出しは「1」「2」のような番号＋日本語。色はブランド色の番号だけで、面の色は付けない。
// 注意の色（notice）は「避けたい」のラベルにだけ、安全の案内は AdviceResult の SafetyCard で淡いブランド色の面にする。
export default function AdviceCard({ number, title, children }) {
  return (
    <section className="border-b border-line py-6 lg:py-7">
      <h2 className="mb-3 flex items-baseline gap-2.5 text-base font-bold leading-snug text-ink lg:text-lg">
        {number != null && (
          <span className="shrink-0 text-sm font-bold tabular-nums text-brand-700">{number}</span>
        )}
        <span className="min-w-0 [word-break:auto-phrase]">{title}</span>
      </h2>
      <div className="text-sm leading-relaxed text-ink-soft lg:text-base lg:leading-relaxed">
        {children}
      </div>
    </section>
  )
}
