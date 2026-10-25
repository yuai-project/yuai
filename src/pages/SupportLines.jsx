import Header from '../components/Header'
import JapaneseOnlyNotice from '../components/JapaneseOnlyNotice'
import Phrases from '../components/Phrases'
import { useI18n } from '../i18n/useI18n'
import SupportLineList from '../components/SupportLineList'
import { getSupportLines } from '../data/supportLines'

// 電話で相談できる窓口（#175）。フッターから、どの画面からでも開ける。
// 結果画面では状況に合わせて窓口を足すが、ここでは「死にたいほどつらいとき」と「お金のトラブル」も含めて全部出す
export default function SupportLines() {
  // 英語の画面では、英語で相談できる TELL Lifeline も出す（#217）
  const { lang } = useI18n()
  const lines = getSupportLines({ crisis: true, money: true, lang })

  return (
    <div lang="ja">
      <Header title="電話で相談できる窓口" back />
      <div className="px-5 pb-12 pt-4 lg:mx-auto lg:max-w-page lg:px-8 lg:pb-16">
        <div className="max-w-2xl">
          <JapaneseOnlyNotice />
          <p className="text-sm leading-relaxed text-ink-soft">
            <Phrases
              phrases={[
                'ひとりで', '抱えきれない', 'ときは、', '公的な', '相談窓口に', '頼ることも', 'できます。',
                'あなたの', '安全と', '心の健康が、', 'なによりも', '大切です。',
              ]}
            />
          </p>

          <div className="mt-4 rounded-xl bg-brand-50 px-4 py-3">
            <p className="text-sm font-bold text-brand-700 [word-break:auto-phrase]">今すぐ身の危険を感じるとき</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              ためらわずに警察（
              <a href="tel:110" className="whitespace-nowrap font-bold text-ink underline decoration-control underline-offset-4">
                110
              </a>
              ）に連絡してください。
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
