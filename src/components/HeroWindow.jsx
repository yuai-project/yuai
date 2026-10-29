// ホームのヒーローに置く、光の差し込むアーチ窓のイラスト（装飾なので読み上げない）。
// ロゴの窓の「o」と同じ描き方（平らな面・十字の枠）にそろえ、写実的な絵は使わない。
// 窓の光は淡いブランド色、差し込む光と床の明かりは白をごく薄く重ねて表す。外の木の葉を少しだけ透かす
export default function HeroWindow({ className = '' }) {
  return (
    <svg viewBox="0 0 480 320" aria-hidden="true" className={`pointer-events-none ${className}`}>
      {/* 差し込む光と、床に落ちる窓の明かり */}
      <path d="M290 150 L290 292 L150 320 L20 320 Z" className="fill-brand-ink/[0.06]" />
      <path d="M220 306 L380 306 L350 320 L180 320 Z" className="fill-brand-ink/[0.08]" />
      {/* 窓枠 */}
      <path d="M290 292 V130 A70 70 0 0 1 430 130 V292 Z" className="fill-brand-200" />
      {/* ガラスと、外の木の葉 */}
      <path d="M304 282 V130 A56 56 0 0 1 416 130 V282 Z" className="fill-brand-50" />
      <g className="fill-brand-100">
        <path d="M416 150 C396 170 392 200 400 230 C404 250 402 268 396 282 L416 282 Z" />
        <ellipse cx="398" cy="176" rx="14" ry="8" transform="rotate(-35 398 176)" />
        <ellipse cx="386" cy="214" rx="15" ry="8" transform="rotate(25 386 214)" />
        <ellipse cx="392" cy="250" rx="13" ry="7" transform="rotate(-30 392 250)" />
      </g>
      {/* 十字の桟 */}
      <path d="M354 74 H366 V282 H354 Z M304 168 H416 V180 H304 Z" className="fill-brand-200" />
      {/* 窓台 */}
      <rect x="280" y="288" width="160" height="10" rx="5" className="fill-brand-200" />
    </svg>
  )
}
