import { useEffect } from 'react'
import { matchPath, useLocation } from 'react-router-dom'
import { APP } from '../config'

// 画面ごとのブラウザタブのタイトル（例: 「AIに相談する | Yorido」）
const titles = [
  ['/consult/result', 'あなたへのヒント'],
  ['/consult', 'AIに相談する'],
  ['/stories/new', '体験を投稿する'],
  ['/stories/:id', '体験談'],
  ['/stories', 'みんなの体験談'],
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
