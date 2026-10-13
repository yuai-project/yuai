import { useEffect } from 'react'
import { matchPath, useLocation } from 'react-router-dom'
import { APP } from '../config'

// 画面ごとのブラウザタブのタイトル（例: 「AIに相談する | Yorido」）
const titles = [
  ['/consult/result', 'あなたへのヒント'],
  ['/consult', '相談する'],
  ['/mypage', 'マイページ'],
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
