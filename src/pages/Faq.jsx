import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/useI18n'
import InfoPage from './InfoPage'

// よくある質問（#175）。相談する側が不安に思いそうなことに先に答える。
// 文言は src/i18n/ja.ts・en.ts の faq.*（#221）。
// 入力内容の扱いは実装（保存も送信もしない）と一致させること。変えたら privacy.* も直す
export default function Faq() {
  const { t } = useI18n()
  return (
    <InfoPage title={t('faq.title')}>
      <dl>
        {t('faq.items').map(({ q, a }) => (
          <div key={q} className="border-t border-line pt-4 pb-1 first:border-t-0 first:pt-2">
            <dt className="font-bold text-ink [word-break:auto-phrase]">{q}</dt>
            <dd className="mt-1">{a}</dd>
          </div>
        ))}
        <div className="border-t border-line pt-4 pb-1">
          <dt className="font-bold text-ink [word-break:auto-phrase]">{t('faq.dangerQuestion')}</dt>
          <dd className="mt-1">
            {t('faq.dangerBefore')}
            <Link to="/support" className="font-bold text-brand-700 underline underline-offset-2">
              {t('faq.dangerLink')}
            </Link>
            {t('faq.dangerAfter')}
          </dd>
        </div>
      </dl>
    </InfoPage>
  )
}
