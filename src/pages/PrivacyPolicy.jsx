import { Fragment } from 'react'
import { useI18n } from '../i18n/useI18n'
import InfoPage, { InfoList, InfoSection } from './InfoPage'

// プライバシーポリシー（#175）。書いてあることと実装を必ず一致させる。
// - 相談の入力内容は保存も送信もしない（ブラウザの履歴の state に、タブを開いている間だけ残る）
// - アクセス解析は #176 で Google Analytics を入れる予定。入れるまでは USES_ANALYTICS を false のままにし、
//   「使っていない」と書く。入れたら true にして、外部送信の表も出す
// 文言は src/i18n/ja.ts・en.ts の privacy.*（#221）。英語は日本語と同じことを約束する（足さない・強めない）
// 公開前にチームか運営の方に確認してもらう
const USES_ANALYTICS = false

export default function PrivacyPolicy() {
  const { t } = useI18n()
  return (
    <InfoPage title={t('privacy.title')} lead={t('privacy.lead')} updated={t('privacy.updated')}>
      <InfoSection title={t('privacy.inputTitle')}>
        <p>{t('privacy.inputBody1')}</p>
        <p>{t('privacy.inputBody2')}</p>
      </InfoSection>

      <InfoSection title={t('privacy.analyticsTitle')}>
        {USES_ANALYTICS ? (
          <>
            <p>{t('privacy.analyticsBody1')}</p>
            <InfoList items={t('privacy.analyticsItems')} />
            <p>{t('privacy.analyticsBody2')}</p>
            <p>{t('privacy.analyticsBody3')}</p>
          </>
        ) : (
          <p>{t('privacy.noAnalytics')}</p>
        )}
      </InfoSection>

      {USES_ANALYTICS && (
        <InfoSection title={t('privacy.externalSendTitle')}>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
            {t('privacy.externalSendRows').map(({ label, value }) => (
              <Fragment key={label}>
                <dt className="font-bold text-ink">{label}</dt>
                <dd>{value}</dd>
              </Fragment>
            ))}
          </dl>
        </InfoSection>
      )}

      <InfoSection title={t('privacy.serverTitle')}>
        <p>{t('privacy.serverBody')}</p>
      </InfoSection>

      <InfoSection title={t('privacy.externalTitle')}>
        <p>{t('privacy.externalBody')}</p>
      </InfoSection>

      <InfoSection title={t('privacy.changesTitle')}>
        <p>{t('privacy.changesBody')}</p>
      </InfoSection>

      <InfoSection title={t('infoPage.contactTitle')}>
        <p>{t('infoPage.contactBody')}</p>
      </InfoSection>
    </InfoPage>
  )
}
