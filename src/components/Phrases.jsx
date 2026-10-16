import { Fragment } from 'react'

// 文節ごとに inline-block で包み、文節の間だけで改行させる（「プライバシーポリ／シー」を防ぐ）
export default function Phrases({ phrases }) {
  return phrases.map((phrase, i) => (
    <Fragment key={i}>
      <span className="inline-block">{phrase}</span>
      {i < phrases.length - 1 && <wbr />}
    </Fragment>
  ))
}
