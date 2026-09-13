import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

// 画面（pathname）が切り替わったら、描画前にページ最上部へスクロールを戻す。
// BrowserRouter では React Router の <ScrollRestoration> が使えないため自前で行う。
// 同じ画面内の state だけの遷移（例: 相談フォームの入力保持）では戻さない。
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
