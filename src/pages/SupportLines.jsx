import Header from '../components/Header'
import Phrases from '../components/Phrases'
import { useI18n } from '../i18n/useI18n'
import SupportLineList from '../components/SupportLineList'
import { getSupportLines } from '../data/supportLines'

// 電話で相談できる窓口（#175）。フッターから、どの画面からでも開ける。
// 結果画面では状況に合わせて窓口を足すが、ここでは「死にたいほどつらいとき」と「お金のトラブル」も含めて全部出す
// 文言は src/i18n/ja.ts・en.ts の supportPage.*（#221）
export default function SupportLines() {
  // 英語の画面では、英語で相談できる TELL Lifeline も出す（#217）
  const { t, lang } = useI18n()
  const lines = getSupportLines({ crisis: true, money: true, lang })

  return (
    <div>
      <Header title={t('supportPage.title')} back />
      <div className="px-5 pb-12 pt-4 lg:mx-auto lg:max-w-page lg:px-8 lg:pb-16">
        <div className="max-w-2xl">
          <p className="text-sm leading-relaxed text-ink-soft">
            <Phrases phrases={t('supportPage.introPhrases')} spaced={lang === 'en'} />
          </p>

          <div className="mt-4 rounded-xl bg-brand-50 px-4 py-3">
            <p className="text-sm font-bold text-brand-700 [word-break:auto-phrase]">{t('supportPage.emergencyTitle')}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              {t('supportPage.emergencyBefore')}
              <a href="tel:110" className="whitespace-nowrap font-bold text-ink underline decoration-control underline-offset-4">
                110
              </a>
              {t('supportPage.emergencyAfter')}
            </p>
          </div>

          <div className="mt-4">
            <SupportLineList lines={lines} />
          </div>
        </div>
      </div>
    </div>
  )
}
