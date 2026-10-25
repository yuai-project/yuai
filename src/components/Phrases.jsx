import { Fragment } from 'react'

// 文節ごとに inline-block で包み、文節の間だけで改行させる（「プライバシーポリ／シー」を防ぐ）。
// 日本語は文節の間に <wbr> を入れて詰める。英語（spaced）は文節の間を空白でつなぐ
export default function Phrases({ phrases, spaced = false }) {
  return phrases.map((phrase, i) => (
    <Fragment key={i}>
      <span className="inline-block">{phrase}</span>
      {i < phrases.length - 1 && (spaced ? ' ' : <wbr />)}
    </Fragment>
  ))
}
