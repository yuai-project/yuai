import {
  MessageCircleHeart,
  BookOpen,
  Flame,
  HelpCircle,
  BatteryLow,
  Heart,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
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
    <div className="pb-8">
      {/* ヒーロー */}
      <section className="rounded-b-[2rem] bg-gradient-to-b from-sage-100 to-cream px-5 pb-8 pt-9">
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-surface/70 px-3 py-1 text-xs font-semibold text-sage-700">
          <Heart size={13} fill="currentColor" />
          {APP.name}
          <span className="font-normal text-ink-faint">{APP.subtitle}</span>
        </div>

        <h1 className="text-2xl font-bold leading-snug text-ink">
          身近な人との関係に
          <br />
          悩んでいませんか？
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          家族や友人が、陰謀論や極端な情報を信じるようになった。どう話せばいいか分からない。
          そんなとき、ひとりで抱え込まないための場所です。
        </p>

        {/* CTA */}
        <div className="mt-6 space-y-3">
          <button
            onClick={() => navigate('/consult')}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sage-600 py-3.5 font-bold text-white shadow-[0_8px_20px_rgba(63,125,114,0.3)] transition hover:bg-sage-700 active:scale-[0.98]"
          >
            <MessageCircleHeart size={20} />
            AIに相談する
          </button>
          <button
            onClick={() => navigate('/stories')}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-sage-200 bg-surface py-3.5 font-bold text-sage-700 transition hover:bg-sage-50 active:scale-[0.98]"
          >
            <BookOpen size={20} />
            みんなの体験談を見る
          </button>
        </div>
      </section>

      {/* コンセプト */}
      <section className="px-5 pt-7">
        <blockquote className="rounded-2xl border border-line bg-surface p-4 text-center">
          <p className="text-sm font-semibold leading-relaxed text-sage-700">
            「{APP.concept}」
          </p>
        </blockquote>
      </section>

      {/* こんな悩みは */}
      <section className="px-5 pt-7">
        <h2 className="mb-3 text-base font-bold text-ink">
          こんな悩みはありませんか？
        </h2>
        <div className="space-y-3">
          {worries.map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-warm-50 text-warm-500">
                <Icon size={20} />
              </span>
              <span className="text-sm font-medium text-ink">{text}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs leading-relaxed text-ink-faint">
          どれかひとつでも当てはまったら、<br />
          まずは気持ちを整理するところから始めましょう。
        </p>
      </section>
    </div>
  )
}
