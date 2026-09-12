import {
  Heart,
  Lightbulb,
  Ban,
  MessageSquareQuote,
  HelpCircle,
  LifeBuoy,
  ArrowRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import AdviceCard from '../components/AdviceCard'
import CopyableLine from '../components/CopyableLine'
import Header from '../components/Header'
import StoryCard from '../components/StoryCard'
import Tag from '../components/Tag'
import { mockAdvice } from '../data/mockAdvice'
import { getStoriesByIds } from '../data/mockStories'

export default function AdviceResult() {
  const a = mockAdvice
  const related = getStoriesByIds(a.relatedStoryIds)

  return (
    <div>
      <Header title="あなたへのヒント" subtitle="AIが整理した対応のヒント" back />

      <div className="space-y-4 px-5 pb-12 pt-4">
        {/* イントロ */}
        <div className="rounded-2xl bg-gradient-to-b from-sage-50 to-cream p-4 text-center">
          <p className="text-sm leading-relaxed text-ink-soft">
            お話を受け止めました。すぐに全部を解決しようとしなくて大丈夫です。
            <br />
            できそうなものから、ひとつずつ。
          </p>
        </div>

        {/* 1. まず、あなた自身へ */}
        <AdviceCard
          icon={Heart}
          step="STEP 1"
          title={a.forYou.title}
          tone="you"
        >
          <p>{a.forYou.body}</p>
        </AdviceCard>

        {/* 2. 今起きていること（仮説） */}
        <AdviceCard
          icon={Lightbulb}
          step="STEP 2"
          title={a.whatMayBeHappening.title}
          tone="neutral"
        >
          <ul className="space-y-2">
            {a.whatMayBeHappening.hypotheses.map((h, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-calm-700/60" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 rounded-lg bg-cream px-3 py-2 text-xs text-ink-faint">
            ※ {a.whatMayBeHappening.note}
          </p>
        </AdviceCard>

        {/* 3. 避けたい対応 */}
        <AdviceCard
          icon={Ban}
          step="STEP 3"
          title={a.avoid.title}
          tone="avoid"
        >
          <ul className="space-y-2">
            {a.avoid.items.map((t, i) => (
              <li
                key={i}
                className="rounded-lg border border-notice-200 bg-surface/60 px-3 py-2 text-sm text-ink line-through decoration-notice-700/40"
              >
                「{t}」
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-relaxed text-notice-700">
            {a.avoid.reason}
          </p>
        </AdviceCard>

        {/* 4. こんな返し方（コピー可能） */}
        <AdviceCard
          icon={MessageSquareQuote}
          step="STEP 4"
          title={a.tryReplies.title}
          tone="try"
        >
          <p className="mb-3 text-xs text-ink-faint">
            タップするとコピーできます。使えそうな言葉を選んでみてください。
          </p>
          <div className="space-y-2">
            {a.tryReplies.items.map((t, i) => (
              <CopyableLine key={i} text={t} />
            ))}
          </div>
        </AdviceCard>

        {/* 5. 次に聞いてみる質問 */}
        <AdviceCard
          icon={HelpCircle}
          step="STEP 5"
          title={a.askNext.title}
          tone="neutral"
        >
          <ol className="space-y-2">
            {a.askNext.items.map((q, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-sage-100 text-xs font-bold text-sage-700">
                  {i + 1}
                </span>
                <span>{q}</span>
              </li>
            ))}
          </ol>
        </AdviceCard>

        {/* 6. 無理に話さなくていい */}
        <AdviceCard
          icon={LifeBuoy}
          step="SAFETY"
          title={a.safety.title}
          tone="safety"
        >
          <ul className="mb-3 grid grid-cols-1 gap-2">
            {a.safety.signs.map((s, i) => (
              <li
                key={i}
                className="flex items-center gap-2 rounded-lg bg-surface/70 px-3 py-2 text-sm text-ink"
              >
                <span className="size-1.5 rounded-full bg-calm-700" />
                {s}
              </li>
            ))}
          </ul>
          <p className="leading-relaxed text-calm-700">{a.safety.body}</p>
        </AdviceCard>

        {/* 7. 似た体験談 */}
        <section className="pt-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-ink">似た体験談</h2>
            <Link
              to="/stories"
              className="flex items-center gap-1 text-xs font-semibold text-sage-600"
            >
              もっと見る <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {related.map((s) => (
              <StoryCard key={s.id} story={s} />
            ))}
          </div>
        </section>

        {/* フッター注記 */}
        <p className="pt-2 text-center text-[11px] leading-relaxed text-ink-faint">
          このヒントは一般的な情報提供であり、医療・法律・緊急支援を提供するものではありません。<br />
          <span className="mt-1 inline-flex flex-wrap justify-center gap-1">
            <Tag>#寄りそう</Tag>
            <Tag>#あなたのケアが第一</Tag>
          </span>
        </p>
      </div>
    </div>
  )
}
