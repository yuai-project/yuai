import {
  MessageCircleHeart,
  BookOpen,
  Flame,
  HelpCircle,
  BatteryLow,
} from 'lucide-react'
import { Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { APP } from '../config'

const worries = [
  {
    icon: Flame,
    text: '否定すると怒ってしまう',
  },
  {
    icon: HelpCircle,
    text: '何を言えばいいか分からない',
  },
  {
    icon: BatteryLow,
    text: '自分まで疲れてしまった',
  },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="pb-8 lg:pb-16">
      {/* ヒーロー：ブランド名とメインコピーを主役に（PCは左にコピー・右にCTAカード） */}
      <section className="rounded-b-[2rem] bg-gradient-to-b from-brand-50 to-surface px-5 pb-9 pt-9 lg:rounded-none lg:px-8 lg:pb-20 lg:pt-20">
        <div className="lg:mx-auto lg:grid lg:max-w-page lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
          <div>
            <Logo size="hero" />

            {/* メインコピー：句ごとに inline-block にして、句の途中で改行しない */}
            <h1 className="mt-6 text-[1.375rem] font-bold leading-[1.6] text-ink lg:mt-8 lg:text-[2.125rem] lg:leading-[1.5]">
              {APP.catchcopy.map((line, i) => (
                <span key={i} className="block">
                  {line.map((phrase, j) => (
                    <Fragment key={j}>
                      <span className="inline-block">{phrase}</span>
                      {j < line.length - 1 && <wbr />}
                    </Fragment>
                  ))}
                </span>
              ))}
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft lg:mt-6 lg:text-lg">
              {APP.tagline}
            </p>
          </div>

          {/* CTA */}
          <div className="mt-7 space-y-3 lg:mt-0 lg:rounded-3xl lg:border lg:border-line lg:bg-surface lg:p-8 lg:shadow-[0_12px_40px_rgba(60,50,40,0.06)]">
            <p className="hidden text-sm leading-relaxed text-ink-soft lg:mb-5 lg:block">
              いくつかの質問に答えるだけで、あなたの状況に合わせた対応のヒントをお届けします。
            </p>
            <button
              onClick={() => navigate('/consult')}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3.5 font-bold text-brand-ink shadow-[0_8px_20px_rgba(242,138,69,0.28)] transition hover:bg-brand-400 active:scale-[0.98]"
            >
              <MessageCircleHeart size={20} />
              相談してみる
            </button>
            <button
              onClick={() => navigate('/stories')}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-brand bg-surface py-3.5 font-bold text-brand-700 transition hover:bg-brand-50 active:scale-[0.98]"
            >
              <BookOpen size={20} />
              みんなの体験談を見る
            </button>
          </div>
        </div>
      </section>

      {/* コンセプト */}
      <section className="px-5 pt-7 lg:mx-auto lg:max-w-page lg:px-8 lg:pt-12">
        <blockquote className="rounded-2xl border border-line bg-cream p-4 text-center lg:p-6">
          <p className="text-sm font-semibold leading-relaxed text-brand-700 lg:text-base">
            「{APP.concept}」
          </p>
        </blockquote>
      </section>

      {/* こんな悩みは */}
      <section className="px-5 pt-7 lg:mx-auto lg:max-w-page lg:px-8 lg:pt-12">
        <h2 className="mb-3 text-base font-bold text-ink lg:mb-4 lg:text-xl">
          こんな悩みはありませんか？
        </h2>
        <div className="space-y-3 lg:grid lg:grid-cols-3 lg:gap-4 lg:space-y-0">
          {worries.map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 lg:p-5"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <Icon size={20} />
              </span>
              <span className="text-sm font-medium text-ink">{text}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs leading-relaxed text-ink-faint lg:mt-6 lg:text-sm">
          どれかひとつでも当てはまったら、<br />
          まずは気持ちを整理するところから始めましょう。
        </p>
      </section>
    </div>
  )
}
