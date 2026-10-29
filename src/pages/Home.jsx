import { Check, ChevronRight, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import HeroWindow from '../components/HeroWindow'
import Logo from '../components/Logo'
import Phrases from '../components/Phrases'
import ShareSiteButton from '../components/ShareSiteButton'
import { useI18n } from '../i18n/useI18n'

export default function Home() {
  const { t, lang } = useI18n()
  // 英語は文節の間を空白でつなぐ
  const spaced = lang === 'en'
  return (
    <div className="pb-10 lg:pb-16">
      {/* ヒーロー：アクセント色の面に、光の差し込むアーチ窓のイラスト（ロゴの窓と同じ「戻ってこられる場所」）。
          スマホは右下に置き、窓が文字に重ならないよう下に余白を取る。PCはコピーの右に置く */}
      <section className="relative overflow-hidden bg-brand">
        <HeroWindow className="absolute bottom-0 right-0 w-[min(80%,20rem)] lg:right-[max(2rem,calc(50%-36.25rem+2rem))] lg:h-[74%] lg:w-auto" />
        <div className="relative lg:mx-auto lg:max-w-page lg:px-8 lg:py-20">
          <div className="px-5 pb-48 pt-7 text-brand-ink lg:max-w-xl lg:p-0">
            {/* スマホにはロゴの入る上部ヘッダーがないので、緑の面の先頭に白抜きのロゴを置く */}
            <Logo size="hero" tone="inverse" className="mb-5 lg:hidden" />
            <h1 className="text-[clamp(1.25rem,6.2vw,1.5rem)] font-bold leading-[1.6] [word-break:auto-phrase] lg:text-[clamp(1.75rem,2.6vw,2.25rem)] lg:leading-[1.5]">
              {t('app.catchcopy').map((line, i) => (
                <span key={i} className="block">
                  <Phrases phrases={line} spaced={spaced} />
                </span>
              ))}
            </h1>

            {/* 白い面はボタンだけにする。ここも白いカードにすると、どこが押す場所か迷う（#204） */}
            <div className="mt-6 border-t border-brand-ink/30 pt-4 lg:mt-8 lg:max-w-md">
              <p className="text-sm">{t('home.findsTitle')}</p>
              <ul className="mt-2 space-y-1.5">
                {t('home.finds').map((text) => (
                  <li key={text} className="flex items-center gap-2 text-[0.9375rem] font-bold">
                    <Check size={18} strokeWidth={2.5} aria-hidden="true" className="shrink-0" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            <Link
              to="/consult"
              className="mt-7 flex w-full items-center justify-center gap-1.5 rounded-xl bg-surface px-4 py-4 text-lg font-bold text-brand-700 shadow-[0_4px_14px_rgba(0,0,0,0.18)] transition hover:bg-brand-50 active:scale-[0.98] lg:inline-flex lg:w-auto lg:px-10"
            >
              {t('home.start')}
              <ChevronRight size={22} strokeWidth={2.5} aria-hidden="true" />
            </Link>
            <p className="mt-3 text-xs leading-relaxed opacity-90">
              {t('common.notDiagnosisSkip')}
            </p>
          </div>
        </div>
      </section>

      <div className="px-5 lg:mx-auto lg:max-w-page lg:px-8">
        {/* 相談窓口はフォームに答えなくても開けるようにする（#205） */}
        <Link
          to="/support"
          className="mt-6 flex items-center gap-3 rounded-xl border border-control px-4 py-3.5 transition hover:bg-brand-50 active:scale-[0.98] lg:mt-10 lg:max-w-md"
        >
          <Phone size={20} aria-hidden="true" className="shrink-0 text-brand-600" />
          <span className="min-w-0 flex-1">
            <span className="block text-xs text-ink-soft">{t('home.supportLead')}</span>
            <span className="block text-[0.9375rem] font-bold text-ink">{t('home.supportLink')}</span>
          </span>
          <ChevronRight size={20} aria-hidden="true" className="shrink-0 text-ink-faint" />
        </Link>

        {/* コンセプト */}
        <p className="mt-8 border-y border-line py-5 text-base font-bold leading-relaxed text-brand-700 lg:mt-14 lg:py-8 lg:text-[1.375rem]">
          {t('common.quoteOpen')}{t('app.concept')}{t('common.quoteClose')}
        </p>

        {/* こんな悩みは */}
        <section className="pt-7 lg:pt-12">
          <h2 className="mb-2 text-lg font-bold text-ink lg:mb-3 lg:text-xl">
            {t('home.worriesTitle')}
          </h2>
          <ul className="border-t border-line lg:grid lg:grid-cols-3 lg:gap-8 lg:border-t-0">
            {t('home.worries').map((text) => (
              <li
                key={text}
                className="border-b border-line py-3 text-sm font-medium text-ink lg:py-4 lg:text-base lg:font-bold"
              >
                {text}
              </li>
            ))}
          </ul>
        </section>

        {/* 控えめな共有 */}
        <section className="mt-8 border-t border-line pt-5 lg:mt-12 lg:flex lg:items-center lg:gap-6">
          <p className="mb-3 text-sm leading-relaxed text-ink-soft lg:mb-0">
            {t('home.shareLead')}
          </p>
          <ShareSiteButton />
        </section>
      </div>
    </div>
  )
}
