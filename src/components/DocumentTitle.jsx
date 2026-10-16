import { useEffect } from 'react'
import { matchPath, useLocation } from 'react-router-dom'
import { APP } from '../config'
import { INFO_PAGES } from '../pages/infoPages'

// 画面ごとのブラウザタブのタイトル（例: 「ヒントをみる | Yorido」）
const titles = [
  ['/consult/result', 'あなたへのヒント'],
  ['/consult', 'ヒントをみる'],
  ...INFO_PAGES.map(({ path, label }) => [path, label]),
]

export default function DocumentTitle() {
  const { pathname } = useLocation()

  useEffect(() => {
    const hit = titles.find(([pattern]) => matchPath(pattern, pathname))
    document.title = hit
      ? `${hit[1]} | ${APP.name}`
      : `${APP.name} | ${APP.tagline.replace(/。$/, '')}`
  }, [pathname])

  return null
}
