import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import ShareSiteButton from '../components/ShareSiteButton'
import { APP } from '../config'

const finds = ['関わり方のヒント', '近い状況の記事や本', '電話で相談できる窓口']

const worries = [
  '否定すると怒ってしまう',
  '何を言えばいいか分からない',
  '自分まで疲れてしまった',
]

// 文節ごとに inline-block で包み、文節の途中では改行しない（<wbr> の位置でだけ折り返す）
function Phrases({ phrases }) {
  return phrases.map((phrase, i) => (
    <Fragment key={i}>
      <span className="inline-block">{phrase}</span>
      {i < phrases.length - 1 && <wbr />}
    </Fragment>
  ))
}

export default function Home() {
  return (
    <div className="pb-10 lg:pb-16">
      {/* ヒーロー：スマホは写真 → アクセント色の面。PCは左にコピーとボタン、右に写真 */}
      <section className="lg:bg-brand">
        <div className="lg:mx-auto lg:grid lg:max-w-page lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center lg:gap-14 lg:px-8 lg:py-16">
          {/* 装飾の写真なので alt は空 */}
          <img
            src="/home-mugs-800.webp"
            srcSet="/home-mugs-800.webp 800w, /home-mugs-1536.webp 1536w"
            sizes="(min-width: 1024px) 50vw, 100vw"
            width="1536"
            height="1024"
            alt=""
            className="block aspect-video w-full object-cover object-[35%_60%] lg:order-2 lg:aspect-[4/3] lg:rounded-xl"
          />

          <div className="bg-brand px-5 pb-9 pt-7 text-brand-ink lg:order-1 lg:p-0">
            <h1 className="text-[clamp(1.25rem,6.2vw,1.5rem)] font-bold leading-[1.6] [word-break:auto-phrase] lg:text-[clamp(1.75rem,2.6vw,2.25rem)] lg:leading-[1.5]">
              {APP.catchcopy.map((line, i) => (
                <span key={i} className="block">
                  <Phrases phrases={line} />
                </span>
              ))}
            </h1>
            <p className="mt-3 text-base leading-relaxed [word-break:auto-phrase] lg:mt-5 lg:text-lg">
              <Phrases phrases={APP.taglinePhrases} />
            </p>

            <div className="mt-6 rounded-xl bg-surface p-4 text-ink lg:mt-8 lg:max-w-md lg:p-5">
              <p className="text-xs font-bold text-brand-700">
                あなたの状況に合わせて見つかるもの
              </p>
              <ul className="mt-2 divide-y divide-line">
                {finds.map((text) => (
                  <li key={text} className="py-2 text-[0.9375rem] font-bold last:pb-0">
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            <Link
              to="/consult"
              className="mt-6 block w-full rounded-xl bg-surface px-4 py-3.5 text-center font-bold text-brand-700 transition hover:bg-brand-50 active:scale-[0.98] lg:inline-block lg:w-auto lg:px-10"
            >
              状況を入れてヒントをみる
            </Link>
            <p className="mt-3 text-xs leading-relaxed">
              これは診断ではありません。答えたくない項目は、とばして大丈夫です。
            </p>
          </div>
        </div>
      </section>

      <div className="px-5 lg:mx-auto lg:max-w-page lg:px-8">
        {/* コンセプト */}
        <p className="mt-8 border-y border-line py-5 text-base font-bold leading-relaxed text-brand-700 lg:mt-14 lg:py-8 lg:text-[1.375rem]">
          「{APP.concept}」
        </p>

        {/* こんな悩みは */}
        <section className="pt-7 lg:pt-12">
          <h2 className="mb-2 text-base font-bold text-ink lg:mb-3 lg:text-xl">
            こんな悩みはありませんか？
          </h2>
          <ul className="border-t border-line lg:grid lg:grid-cols-3 lg:gap-8 lg:border-t-0">
            {worries.map((text) => (
              <li
                key={text}
                className="border-b border-line py-3 text-sm font-medium text-ink lg:py-4 lg:text-base lg:font-bold"
              >
                {text}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft lg:mt-5">
            どれかひとつでも当てはまったら、まずは気持ちを整理するところから始めましょう。
          </p>
        </section>

        {/* 控えめな共有 */}
        <section className="mt-8 border-t border-line pt-5 lg:mt-12 lg:flex lg:items-center lg:gap-6">
          <p className="mb-3 text-sm leading-relaxed text-ink-soft lg:mb-0">
            同じように悩んでいる人がいたら、このサイトを伝えることもできます。
          </p>
          <ShareSiteButton />
        </section>
      </div>
    </div>
  )
}
