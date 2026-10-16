import { ExternalLink } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import AdviceCard from '../components/AdviceCard'
import ArticleRecommendations from '../components/ArticleRecommendations'
import CopyableLine from '../components/CopyableLine'
import Header from '../components/Header'
import DesiredSupportCard from '../components/intake/DesiredSupportCard'
import IntakeSummary from '../components/intake/IntakeSummary'
import SupportLineList from '../components/SupportLineList'
import { buildAdvice } from '../data/mockAdvice'
import { recommendArticles } from '../data/recommendArticles'
import { getSupportLines } from '../data/supportLines'

// 番号を振る枠（表示順）。安全の案内には番号を振らない。
const STEP_SECTIONS = ['forYou', 'whatMayBeHappening', 'avoid', 'tryReplies', 'askNext']

// 上の帯（ブランド色）にイントロ。その下は、
// スマホ: （安全の案内）→ サポート/記事/まとめ → アドバイス の1カラム。
// PC: 左2/3にアドバイス、右1/3に サポート/記事/まとめ の追従サイドバー。
// 直接開いた場合（フォームの回答が無い）は、サイドバーに出すものが無いので1カラム。
// アドバイスはカードを積まず、罫線で区切った読み物にする。面の色はグレー（避けたい）と淡いブランド色（安全）だけ。
export default function AdviceResult() {
  const navigate = useNavigate()
  // 相談フォームから来た場合は入力内容と回答を受け取る。直接開いた場合は、どの回答にも寄せないアドバイスを表示。
  const { intake, request, advice } = useLocation().state ?? {}
  const a = advice ?? buildAdvice(request)
  // 見出しの番号は、出す枠（null でない枠）に合わせて振る
  const stepOf = Object.fromEntries(
    STEP_SECTIONS.filter((key) => a[key]).map((key, i) => [key, i + 1]),
  )
  const supportLines = a.supportLines ?? getSupportLines()
  // フォームの回答に合う記事。直接開いた場合は出さない。
  const recommended = request ? recommendArticles(request) : null

  return (
    <div>
      <Header title="あなたへのヒント" back tone="brand" />

      {/* イントロ（ブランド色の帯） */}
      <div className="bg-brand px-5 pb-6 pt-1 text-brand-ink lg:pb-9 lg:pt-0">
        <p className="max-w-[40em] text-sm leading-relaxed [word-break:auto-phrase] lg:mx-auto lg:max-w-page lg:px-8 lg:pl-[5.25rem] lg:text-base">
          お話を受け止めました。すぐに全部を解決しようとしなくて大丈夫です。できそうなものから、ひとつずつ。
        </p>
      </div>

      <div className="px-5 pb-12 pt-6 lg:mx-auto lg:max-w-page lg:px-8 lg:pb-16 lg:pt-10">
        <div
          className={`flex flex-col gap-6 ${
            request
              ? 'lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:grid-rows-[auto_1fr] lg:gap-x-12 lg:gap-y-6'
              : 'lg:mx-auto lg:max-w-3xl'
          }`}
        >
          {/* 詳しい内容に危険を示す言葉があったときは、無理に話さなくていい案内を
              イントロのすぐ下（スマホでも記事・相談内容のまとめより上）に出す */}
          {a.safetyFirst && (
            <div className="space-y-3 lg:col-start-1 lg:row-start-1">
              {a.safetyNote && (
                <p className="text-sm leading-relaxed text-ink-soft">{a.safetyNote}</p>
              )}
              <SafetyCard safety={a.safety} lines={supportLines} />
            </div>
          )}

          {/* サイドバー（PCでは右列・追従）。フォームから来たときだけ出す */}
          {request && (
            <aside className="space-y-4 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:-mx-1 lg:max-h-[calc(100dvh-7rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain lg:px-1 lg:pb-1">
              <DesiredSupportCard values={request.desiredSupport} />
              <ArticleRecommendations result={recommended} />
              <IntakeSummary
                request={request}
                onEdit={
                  intake
                    ? () => navigate('/consult', { state: { intake, step: 0 } })
                    : undefined
                }
              />
            </aside>
          )}

          <div
            className={`[&>section:first-child]:pt-0 ${
              a.safetyFirst
                ? 'lg:col-start-1 lg:row-start-2'
                : 'lg:col-start-1 lg:row-span-2 lg:row-start-1'
            }`}
          >
            {/* どの回答に合わせたか */}
            {a.matchedLabel && (
              <p className="text-sm font-bold text-brand-700">{a.matchedLabel}</p>
            )}

            {/* 詳しい内容（自由記述）から読み取った困りごと */}
            {a.freeTextNotes?.map((note) => (
              <p key={note} className="mt-1 text-sm leading-relaxed text-ink-soft">
                {note}
              </p>
            ))}

            {/* 1. まず、あなた自身へ */}
            <AdviceCard number={stepOf.forYou} title={a.forYou.title}>
              <p>{a.forYou.body}</p>
            </AdviceCard>

            {/* 2. 今起きていること（仮説）。今は常に null で、出さない */}
            {a.whatMayBeHappening && (
              <AdviceCard
                number={stepOf.whatMayBeHappening}
                title={a.whatMayBeHappening.title}
              >
                <ul className="list-disc space-y-2 pl-5 marker:text-brand-700">
                  {a.whatMayBeHappening.hypotheses.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
                <p className="mt-3 rounded-xl bg-cream px-3.5 py-2.5 text-xs text-ink-faint">
                  ※ {a.whatMayBeHappening.note}
                </p>
              </AdviceCard>
            )}

            {/* 3. 避けたい対応。面はグレー、注意の色は「避けたい」のラベルにだけ使う（取り消し線は使わない） */}
            <AdviceCard number={stepOf.avoid} title={a.avoid.title}>
              <ul className="space-y-2 rounded-xl bg-cream px-3.5 py-3">
                {a.avoid.items.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-ink">
                    <span className="mt-0.5 shrink-0 whitespace-nowrap rounded-md border border-notice-700 px-1.5 text-[11px] font-bold leading-relaxed text-notice-700">
                      避けたい
                    </span>
                    <span className="min-w-0">「{t}」</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3">{a.avoid.reason}</p>
            </AdviceCard>

            {/* 4. こんな返し方（コピー可能） */}
            <AdviceCard number={stepOf.tryReplies} title={a.tryReplies.title}>
              <p className="mb-3 text-xs text-ink-faint">
                タップするとコピーできます。使えそうな言葉を選んでみてください。
              </p>
              <div className="space-y-2">
                {a.tryReplies.items.map((t, i) => (
                  <CopyableLine key={i} text={t} />
                ))}
              </div>
            </AdviceCard>

            {/* 5. 次に聞いてみる質問。持たないカードでは出さない */}
            {a.askNext && (
              <AdviceCard number={stepOf.askNext} title={a.askNext.title}>
                <ol className="list-decimal space-y-2 pl-5 marker:font-bold marker:text-brand-700">
                  {a.askNext.items.map((q, i) => (
                    <li key={i} className="pl-1">{q}</li>
                  ))}
                </ol>
              </AdviceCard>
            )}

            {/* このヒントの参考にした情報。最後の枠のすぐ後ろ、安全の案内の前。空のときは何も出さない */}
            <AdviceSources sources={a.sources ?? []} />

            {/* 6. 無理に話さなくていい（safetyFirst のときはイントロのすぐ下に出している） */}
            {!a.safetyFirst && (
              <div className="mt-6">
                <SafetyCard safety={a.safety} lines={supportLines} />
              </div>
            )}

            {/* フッター注記 */}
            <p className="mt-6 text-[11px] leading-relaxed text-ink-faint">
              このヒントは一般的な情報提供であり、医療・法律・緊急支援を提供するものではありません。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// 無理に話さなくていいサイン。ふだんはアドバイスの最後、safetyFirst のときはイントロのすぐ下に出す。
// 結果画面で面を囲むのはここだけ（淡いブランド色）。
// lines は電話で相談できる窓口。危険を示す言葉がないときも、ここには常に出す
function SafetyCard({ safety, lines }) {
  return (
    <section aria-labelledby="safety-title" className="rounded-xl bg-brand-50 p-4 lg:p-6">
      <h2
        id="safety-title"
        className="text-base font-bold leading-snug text-brand-700 [word-break:auto-phrase] lg:text-lg"
      >
        {safety.title}
      </h2>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-ink marker:text-brand-700">
        {safety.signs.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{safety.body}</p>
      <h3 className="mt-5 text-sm font-bold text-brand-700">電話で相談できる窓口</h3>
      <SupportLineList lines={lines} />
    </section>
  )
}

// 最後のカードのすぐ後ろに小さく出す「このヒントの参考にした情報」。記事タイトル（外部リンク）とドメイン。
function AdviceSources({ sources }) {
  if (sources.length === 0) return null
  return (
    <section className="pt-5" aria-labelledby="advice-sources-title">
      <h2 id="advice-sources-title" className="text-xs font-bold text-ink-soft">
        このヒントの参考にした情報
      </h2>
      <ul className="mt-1.5 space-y-1.5">
        {sources.map((s) => (
          <li key={s.id} className="text-xs leading-relaxed">
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline text-ink-soft underline decoration-line underline-offset-2 transition hover:text-brand-700"
            >
              {s.title}
              <ExternalLink
                size={12}
                strokeWidth={2.2}
                aria-hidden="true"
                className="ml-1 inline-block align-[-1px] text-ink-faint"
              />
              <span className="sr-only">（外部サイトが新しいタブで開きます）</span>
            </a>
            <span className="ml-1.5 inline-block whitespace-nowrap text-ink-faint">{s.domain}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
