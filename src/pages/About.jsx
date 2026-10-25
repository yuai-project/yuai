import ShareSiteButton from '../components/ShareSiteButton'
import { useI18n } from '../i18n/useI18n'
import InfoPage, { InfoList, InfoSection } from './InfoPage'

// 運営について（#175）。チーム名などは載せず、Yorido の目的と大切にしていることだけを書く。
// 文言は src/i18n/ja.ts・en.ts の about.*（#221）。サービスの説明とコンセプトはホームと同じ app.*
// 「大切にしていること」は CLAUDE.md の「絶対に守るルール」を利用者向けの言葉にしたもの
export default function About() {
  const { t } = useI18n()
  return (
    <InfoPage title={t('about.title')}>
      <InfoSection title={t('about.aboutTitle')}>
        <p>{t('app.description')}</p>
        <p>
          {t('about.conceptBefore')}
          {t('app.concept')}
          {t('about.conceptAfter')}
        </p>
      </InfoSection>

      <InfoSection title={t('about.valuesTitle')}>
        <InfoList items={t('about.values')} />
      </InfoSection>

      <InfoSection title={t('about.shareTitle')}>
        <p>{t('home.shareLead')}</p>
        <ShareSiteButton />
      </InfoSection>

      <InfoSection title={t('infoPage.contactTitle')}>
        <p>{t('infoPage.contactBody')}</p>
      </InfoSection>
    </InfoPage>
  )
}
