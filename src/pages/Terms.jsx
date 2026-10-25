import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/useI18n'
import InfoPage, { InfoList, InfoSection } from './InfoPage'

// ご利用にあたって（#175）。できること・できないこと、安全、外部サイト、情報の正確さ。
// 文言は src/i18n/ja.ts・en.ts の terms.*（#221）。英語は日本語と同じことを約束する（足さない・強めない）
// 免責の書き方は法的な確認が済んでいない。公開前にチームか運営の方に見てもらう
export default function Terms() {
  const { t } = useI18n()
  return (
    <InfoPage title={t('terms.title')} lead={t('terms.lead')} updated={t('terms.updated')}>
      <InfoSection title={t('terms.canDoTitle')}>
        <p>{t('terms.canDoBody')}</p>
        <InfoList items={t('terms.canDoItems')} />
      </InfoSection>

      <InfoSection title={t('terms.cannotDoTitle')}>
        <InfoList items={t('terms.cannotDoItems')} />
      </InfoSection>

      <InfoSection title={t('terms.safetyTitle')}>
        <p>{t('terms.safetyBody')}</p>
        <p>
          {t('terms.safetyBefore')}
          <Link to="/support" className="font-bold text-brand-700 underline underline-offset-2">
            {t('terms.safetyLink')}
          </Link>
          {t('terms.safetyAfter')}
        </p>
      </InfoSection>

      <InfoSection title={t('terms.externalTitle')}>
        <p>{t('terms.externalBody')}</p>
      </InfoSection>

      <InfoSection title={t('terms.accuracyTitle')}>
        <p>{t('terms.accuracyBody1')}</p>
        <p>{t('terms.accuracyBody2')}</p>
      </InfoSection>

      <InfoSection title={t('terms.changesTitle')}>
        <p>{t('terms.changesBody')}</p>
      </InfoSection>
    </InfoPage>
  )
}
