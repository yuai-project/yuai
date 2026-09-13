import {
  Heart,
  Lightbulb,
  Ban,
  MessageSquareQuote,
  HelpCircle,
  LifeBuoy,
  ArrowRight,
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AdviceCard from '../components/AdviceCard'
import CopyableLine from '../components/CopyableLine'
import Header from '../components/Header'
import DesiredSupportCard from '../components/intake/DesiredSupportCard'
import IntakeSummary from '../components/intake/IntakeSummary'
import StoryCard from '../components/StoryCard'
import Tag from '../components/Tag'
import { mockAdvice } from '../data/mockAdvice'
import { getStoriesByIds } from '../data/mockStories'

// スマホ: イントロ → サポート/まとめ → アドバイス → 似た体験談 の1カラム。
// PC: 左2/3にイントロとアドバイス、右1/3に サポート/まとめ/似た体験談 の追従サイドバー。
export default function AdviceResult() {
  const navigate = useNavigate()
  // 相談フォームから来た場合は入力内容と回答を受け取る。直接開いた場合はモックのみ表示。
  const { intake, request, advice } = useLocation().state ?? {}
  const a = advice ?? mockAdvice
  const related = getStoriesByIds(a.relatedStoryIds)

  return (
    <div>
      <Header title="あなたへのヒント" subtitle="AIが整理した対応のヒント" back />

      <div className="px-5 pb-12 pt-4 lg:mx-auto lg:max-w-page lg:px-8 lg:pb-16 lg:pt-6">
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:grid-rows-[auto_1fr] lg:gap-x-8 lg:gap-y-4">
          {/* イントロ */}
          <div className="rounded-2xl bg-gradient-to-b from-brand-50 to-cream p-4 text-center lg:col-start-1 lg:row-start-1 lg:py-6">
            <p className="text-sm leading-relaxed text-ink-soft">
              お話を受け止めました。すぐに全部を解決しようとしなくて大丈夫です。
              <br />
              できそうなものから、ひとつずつ。
            </p>
          </div>

          {/* サイドバー（PCでは右列・追従） */}
          <aside
            className={`space-y-4 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:-mx-1 lg:max-h-[calc(100dvh-7rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain lg:px-1 lg:pb-1 ${
              request ? '' : 'hidden lg:block'
            }`}
          >
            {request && (
              <>
                <DesiredSupportCard values={request.desiredSupport} />
                <IntakeSummary
                  request={request}
                  onEdit={
                    intake
                      ? () => navigate('/consult', { state: { intake, step: 0 } })
                      : undefined
                  }
                />
              </>
            )}
            {related.length > 0 && (
              <div className="hidden lg:block">
                <RelatedStoryLinks stories={related} />
              </div>
            )}
          </aside>

          <div className="space-y-4 lg:col-start-1 lg:row-start-2">
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
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-600/70" />
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
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
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

            {/* 7. 似た体験談（スマホ。PCではサイドバーに表示） */}
            <section className="pt-2 lg:hidden">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-bold text-ink">似た体験談</h2>
                <Link
                  to="/stories"
                  className="flex items-center gap-1 text-xs font-semibold text-brand-700"
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
                <Tag>#ひとりで抱え込まない</Tag>
                <Tag>#あなたのケアが第一</Tag>
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// PCサイドバー用のコンパクトな体験談リンク
function RelatedStoryLinks({ stories }) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-4 shadow-[0_1px_2px_rgba(60,50,40,0.03)]">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-bold text-ink">似た体験談</h2>
        <Link
          to="/stories"
          className="flex items-center gap-1 text-xs font-semibold text-brand-700"
        >
          もっと見る <ArrowRight size={14} />
        </Link>
      </div>
      <ul className="divide-y divide-line">
        {stories.map((s) => (
          <li key={s.id} className="py-3 first:pt-0 last:pb-0">
            <Link to={`/stories/${s.id}`} className="group block">
              <span className="flex flex-wrap gap-1">
                <Tag tone="brand">{s.relation}</Tag>
                {s.tags.slice(1, 2).map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </span>
              <span className="mt-1.5 block text-sm font-bold leading-snug text-ink transition group-hover:text-brand-700">
                {s.title}
              </span>
              <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-soft">
                {s.excerpt}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
