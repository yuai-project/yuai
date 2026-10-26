import { ChevronDown, ExternalLink } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import AdviceCard from '../components/AdviceCard'
import ArticleRecommendations from '../components/ArticleRecommendations'
import CopyableLine from '../components/CopyableLine'
import Header from '../components/Header'
import IntakeSummary from '../components/intake/IntakeSummary'
import ItemSources, { SourceLangNote } from '../components/ItemSources'
import SupportLineList from '../components/SupportLineList'
import { buildAdvice } from '../data/mockAdvice'
import { recommendArticles } from '../data/recommendArticles'
import { EMERGENCY_NUMBERS, getSupportLines, needsLateNightNote, telHref } from '../data/supportLines'
import { useI18n } from '../i18n/useI18n'

// 番号を振る枠（表示順）。安全の案内には番号を振らない。
const STEP_SECTIONS = ['forYou', 'whatMayBeHappening', 'tryReplies', 'avoid', 'askNext']

// 左列（PC）に縦に積むもの（要点・上に出す安全の案内・アドバイス）の数 → PC のグリッドでの置き場所。
// サイドバーは左列の行をすべてまたぐ
const LG_LAYOUT = {
  1: { grid: 'lg:grid-rows-[auto_1fr]', rows: ['lg:row-span-2 lg:row-start-1'], aside: 'lg:row-span-2' },
  2: { grid: 'lg:grid-rows-[auto_1fr]', rows: ['lg:row-start-1', 'lg:row-start-2'], aside: 'lg:row-span-2' },
  3: {
    grid: 'lg:grid-rows-[auto_auto_1fr]',
    rows: ['lg:row-start-1', 'lg:row-start-2', 'lg:row-start-3'],
    aside: 'lg:row-span-3',
  },
}

// 「まずは、この3つだけ」の各項目から移動する先（#226）
const KEY_POINT_TARGETS = { forYou: 'for-you', reply: 'try-replies', supportLine: 'phone-lines' }

// 上の帯（ブランド色）にイントロ。その下は、
// スマホ: 要点（まずは、この3つだけ。#226）→ アドバイス → 安全の案内 → 記事 → 相談内容のまとめ（閉じた状態）の1カラム（#225）。
//   危険を示す言葉があるときは、安全の案内をイントロのすぐ下に出す。
//   相談先を求めたとき（professional_referral）は、安全の案内と記事をアドバイスより上に出す。
// PC: 左2/3にアドバイス、右1/3に 記事/まとめ の追従サイドバー。
// 直接開いた場合（フォームの回答が無い）は、サイドバーに出すものが無いので1カラム。
// 並び（DOM の順）はスマホの順にそろえ、PC ではサイドバーを右列に置く。読み上げ・Tab の順も見た目の順と同じになる。
// 相談先を求めたときの記事は、スマホでは上の枠に、PC ではサイドバーに出す（同じ一覧を幅で出し分ける）。
// アドバイスはカードを積まず、罫線で区切った読み物にする。面の色はグレー（避けたい）と淡いブランド色（安全）だけ。
// 各項目の本文のすぐ下に、その項目の出典を小さなリンクで出す（ItemSources。出典が無い項目には出さない）。
export default function AdviceResult() {
  const navigate = useNavigate()
  const { t, lang } = useI18n()
  // 相談フォームから来た場合は入力内容と回答を受け取る。直接開いた場合は、どの回答にも寄せないアドバイスを表示。
  // 受け取った回答と画面の言語が違う（結果画面で言語を切り替えた）ときは、今の言語で組み立て直す
  const { intake, request, advice, adviceLang = 'ja' } = useLocation().state ?? {}
  const a = advice && adviceLang === lang ? advice : buildAdvice(request, lang)
  // 見出しの番号は、出す枠（null でない枠）に合わせて振る
  const stepOf = Object.fromEntries(
    STEP_SECTIONS.filter((key) => a[key]).map((key, i) => [key, i + 1]),
  )
  const supportLines = a.supportLines ?? getSupportLines({ lang })
  // フォームの回答に合う記事。直接開いた場合は出さない。
  const recommended = request ? recommendArticles(request) : null
  // 相談先を求めたときは、電話窓口と「相談できる先」の記事を、ヒントより先に見せる
  const referralFirst = request?.desiredSupport?.includes('professional_referral') ?? false
  const safetyOnTop = a.safetyFirst || referralFirst
  // 要点は、危険を示す言葉があるときは buildAdvice() が null にしている
  const keyPoints = a.keyPoints ?? null
  const lg = LG_LAYOUT[1 + (keyPoints ? 1 : 0) + (safetyOnTop ? 1 : 0)]
  const lgRows = [...lg.rows]
  const keyPointsRow = keyPoints ? lgRows.shift() : ''
  const safetyRow = safetyOnTop ? lgRows.shift() : ''
  const adviceRow = lgRows.shift()

  return (
    <div>
      <Header title={t('result.title')} back tone="brand" />


      <div className="px-5 pb-12 pt-6 lg:mx-auto lg:max-w-page lg:px-8 lg:pb-16 lg:pt-10">
        <div
          className={`flex flex-col gap-6 ${
            request
              ? `lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] ${lg.grid} lg:gap-x-12 lg:gap-y-6`
              : 'lg:mx-auto lg:max-w-3xl'
          }`}
        >
          {/* まずは、この3つだけ（#226）。全部読まなくても、ここだけ持ち帰れば閉じてよい形にする */}
          {keyPoints && <KeyPointsCard points={keyPoints} className={`lg:col-start-1 ${keyPointsRow}`} />}

          {/* 危険を示す言葉があったとき・相談先を求めたときは、無理に話さなくていい案内を
              イントロのすぐ下（スマホでもアドバイス・記事・相談内容のまとめより上）に出す */}
          {safetyOnTop && (
            <div className={`flex flex-col gap-6 lg:col-start-1 ${safetyRow}`}>
              <div className="space-y-3">
                {a.safetyFirst && a.safetyNote && (
                  <p className="text-sm leading-relaxed text-ink-soft">{a.safetyNote}</p>
                )}
                <SafetyCard safety={a.safety} lines={supportLines} />
              </div>
              {referralFirst && (
                <ArticleRecommendations
                  result={recommended}
                  desiredSupport={request.desiredSupport}
                  className="lg:hidden"
                />
              )}
            </div>
          )}

          <div
            className={`[&>section:first-child]:pt-0 lg:col-start-1 ${adviceRow}`}
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

            {/* 1. あなた自身のこと */}
            <AdviceCard id={KEY_POINT_TARGETS.forYou} number={stepOf.forYou} title={a.forYou.title}>
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

            {/* 3. こんな返し方（コピー可能）。避けたい対応より先に、できることを見せる */}
            <AdviceCard id={KEY_POINT_TARGETS.reply} number={stepOf.tryReplies} title={a.tryReplies.title}>
              <p className="mb-3 text-xs text-ink-faint">
                {t('result.copyHint')}
              </p>
              <div className="space-y-2">
                {a.tryReplies.items.map((text, i) => (
                  <CopyableLine key={i} text={text} />
                ))}
              </div>
              <ItemSources sources={a.tryReplies.sources ?? []} />
            </AdviceCard>

            {/* 4. 避けたい対応。面はグレー、注意の色は「避けたい」のラベルにだけ使う（取り消し線は使わない） */}
            <AdviceCard number={stepOf.avoid} title={a.avoid.title}>
              <ul className="space-y-2 rounded-xl bg-cream px-3.5 py-3">
                {a.avoid.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-ink">
                    <span className="mt-0.5 shrink-0 whitespace-nowrap rounded-md border border-notice-700 px-1.5 text-[11px] font-bold leading-relaxed text-notice-700">
                      {t('result.avoidLabel')}
                    </span>
                    <span className="min-w-0">{t('common.quoteOpen')}{item}{t('common.quoteClose')}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3">{a.avoid.reason}</p>
              <ItemSources sources={a.avoid.sources ?? []} />
            </AdviceCard>

            {/* 5. 次に聞いてみる質問。持たないカードでは出さない */}
            {a.askNext && (
              <AdviceCard number={stepOf.askNext} title={a.askNext.title}>
                <ol className="list-decimal space-y-2 pl-5 marker:font-bold marker:text-brand-700">
                  {a.askNext.items.map((q, i) => (
                    <li key={i} className="pl-1">{q}</li>
                  ))}
                </ol>
                <ItemSources sources={a.askNext.sources ?? []} />
              </AdviceCard>
            )}

            {/* このヒントの参考にした情報。最後の枠のすぐ後ろ、安全の案内の前。空のときは何も出さない */}
            <AdviceSources sources={a.sources ?? []} />

            {/* 6. 無理に話さなくていい（危険を示す言葉があるとき・相談先を求めたときはイントロのすぐ下に出している） */}
            {!safetyOnTop && (
              <div className="mt-6">
                <SafetyCard safety={a.safety} lines={supportLines} />
              </div>
            )}
          </div>

          {/* サイドバー（PCでは右列・追従）。フォームから来たときだけ出す。スマホではアドバイスの後ろに並ぶ */}
          {request && (
            <aside className={`space-y-4 lg:sticky lg:top-24 lg:col-start-2 ${lg.aside} lg:row-start-1 lg:-mx-1 lg:max-h-[calc(100dvh-7rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain lg:px-1 lg:pb-1`}>
              <ArticleRecommendations
                result={recommended}
                desiredSupport={request.desiredSupport}
                className={referralFirst ? 'hidden lg:block' : ''}
              />
              {/* 相談内容のまとめ。最初は閉じていて、開くと中身と「内容を修正する」が出る */}
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
        </div>
      </div>
    </div>
  )
}

// 無理に話さなくていいサイン。ふだんはアドバイスの最後、危険を示す言葉があるとき・相談先を求めたときはイントロのすぐ下に出す。
// 結果画面で面を囲むのはここだけ（淡いブランド色）。
// lines は電話で相談できる窓口。危険を示す言葉がないときも、ここには常に出す。
// safety.sources は、その番号を確かめたページ（buildAdvice() が lines に合わせて入れる）
function SafetyCard({ safety, lines }) {
  const { t, lang } = useI18n()
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
      {/* 「まずは、この3つだけ」の「話せる先」から移動してくる先（#226） */}
      <h3
        id={KEY_POINT_TARGETS.supportLine}
        tabIndex={-1}
        className="mt-5 scroll-mt-16 text-sm font-bold text-brand-700 focus:outline-none lg:scroll-mt-6"
      >
        {t('result.phoneLines')}
      </h3>
      {needsLateNightNote(lines, lang) && <LateNightNote />}
      <SupportLineList lines={lines} />
      {/* 番号を確かめたページ */}
      <ItemSources sources={safety.sources ?? []} />
    </section>
  )
}

// 結果画面の最初に出す「まずは、この3つだけ」（#226）。
// 1. の要の一文・返し方の1つ目・電話窓口の1つ目。押すと、ページ内の詳しい部分へ移動する。
// 面の色は付けず（結果画面で面を塗るのは避けたい・安全の案内だけ）、罫線で囲む。
// 移動は <a href="#…"> ではなくボタンで行う。ハッシュで移動すると履歴の state（フォームの回答）が消えるため
function KeyPointsCard({ points, className = '' }) {
  const { t } = useI18n()
  const jump = (key) => {
    const target = document.getElementById(KEY_POINT_TARGETS[key])
    if (!target) return
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
    // 読み上げ・キーボードの位置も移す
    target.focus({ preventScroll: true })
  }
  const { name, tel, note } = points.supportLine
  const items = [
    { key: 'forYou', body: points.forYou },
    { key: 'reply', body: <>{t('common.quoteOpen')}{points.reply}{t('common.quoteClose')}</> },
    {
      key: 'supportLine',
      body: (
        <>
          {/* 窓口の名前は1行に置き、番号と（無料・24時間）はその下に並べる。狭い幅でも名前の途中で折り返さない */}
          <span className="block">{name}</span>
          <span className="flex flex-wrap items-baseline gap-x-2">
            <span className="whitespace-nowrap font-bold tabular-nums">{tel}</span>
            {note && (
              <span className="text-xs text-ink-soft">
                {t('common.parenOpen')}{note}{t('common.parenClose')}
              </span>
            )}
          </span>
        </>
      ),
    },
  ]
  return (
    <section aria-labelledby="key-points-title" className={`rounded-xl border border-brand-200 px-4 pb-2 pt-4 lg:px-6 lg:pt-5 ${className}`}>
      <h2 id="key-points-title" className="text-base font-bold leading-snug text-brand-700 lg:text-lg">
        {t('result.keyPoints.title')}
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-ink-soft lg:text-sm">{t('result.keyPoints.lead')}</p>
      <ol className="mt-2">
        {items.map(({ key, body }, i) => (
          <li key={key} className="border-t border-line first:border-t-0">
            <button
              type="button"
              onClick={() => jump(key)}
              className="flex w-full items-start gap-3 rounded-lg py-3 text-left transition hover:bg-brand-50"
            >
              <span className="mt-px shrink-0 text-sm font-bold tabular-nums text-brand-700">{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-brand-700">{t(`result.keyPoints.${key}`)}</span>
                <span className="mt-0.5 block text-sm leading-relaxed text-ink [word-break:auto-phrase] lg:text-base">
                  {body}
                </span>
                <span className="sr-only">{t('result.keyPoints.jumpHint')}</span>
              </span>
              <ChevronDown size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-brand-600" />
            </button>
          </li>
        ))}
      </ol>
    </section>
  )
}

// 英語の画面で crisis のときだけ、窓口の一覧の上に出す注記（#220）。
// 英語の窓口は夜遅くはつながらないことがあるので、24時間の #いのちSOS と、命に関わるときの 119・110 を伝える。
// 番号はタップで発信できる（押しやすいよう高さ 32px 以上）
function LateNightNote() {
  const { t } = useI18n()
  const call = (number) => (
    <a
      href={telHref(number)}
      aria-label={t('lateNight.callLabel', { number })}
      className="inline-flex min-h-8 min-w-8 items-center justify-center px-0.5 font-bold tabular-nums text-ink underline decoration-control underline-offset-4"
    >
      {number}
    </a>
  )
  return (
    <div className="mt-2 rounded-lg bg-surface px-3 py-2 text-xs leading-relaxed text-ink-soft">
      <p>{t('lateNight.note')}</p>
      <p className="mt-1">
        {t('lateNight.emergencyLead')}
        {call(EMERGENCY_NUMBERS.ambulance)}
        {t('lateNight.ambulance')}
        {t('lateNight.or')}
        {call(EMERGENCY_NUMBERS.police)}
        {t('lateNight.police')}
        {t('lateNight.emergencyEnd')}
      </p>
    </div>
  )
}

// 最後のカードのすぐ後ろに小さく出す「このヒントの参考にした情報」。記事タイトル（外部リンク）とドメイン。
// 項目ごとの出典（ItemSources）を重複なしでまとめたもの。安全の案内の出典（番号の確かめ先）は入れない。
function AdviceSources({ sources }) {
  const { t, lang } = useI18n()
  if (sources.length === 0) return null
  return (
    <section className="pt-5" aria-labelledby="advice-sources-title">
      <h2 id="advice-sources-title" className="text-xs font-bold text-ink-soft">
        {t('result.sourcesTitle')}
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
              {s.lang === lang ? s.title : <span lang={s.lang}>{s.title}</span>}
              <ExternalLink
                size={12}
                strokeWidth={2.2}
                aria-hidden="true"
                className="ml-1 inline-block align-[-1px] text-ink-faint"
              />
              <span className="sr-only">{t('common.opensInNewTab')}</span>
            </a>
            <span className="ml-1.5 inline-block whitespace-nowrap text-ink-faint">{s.domain}</span>
            <SourceLangNote source={s} className="ml-1.5" />
          </li>
        ))}
      </ul>
    </section>
  )
}
