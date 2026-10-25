import { useEffect } from 'react'
import { matchPath, useLocation } from 'react-router-dom'
import { APP } from '../config'
import { useI18n } from '../i18n/useI18n'
import { joinPhrases } from '../i18n/language'
import { INFO_PAGES } from '../pages/infoPages'

// 画面ごとのブラウザタブのタイトル（例: 「ヒントをみる | Yorido」）
export default function DocumentTitle() {
  const { pathname } = useLocation()
  const { t, lang } = useI18n()

  useEffect(() => {
    const titles = [
      ['/consult/result', t('pageTitle.result')],
      ['/consult', t('pageTitle.consult')],
      ...INFO_PAGES.map(({ path, key }) => [path, joinPhrases(lang, t(key))]),
    ]
    const hit = titles.find(([pattern]) => matchPath(pattern, pathname))
    document.title = hit ? `${hit[1]} | ${APP.name}` : t('app.title')
  }, [pathname, t, lang])

  return null
}
