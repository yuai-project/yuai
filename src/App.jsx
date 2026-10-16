import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import DocumentTitle from './components/DocumentTitle'
import ScrollToTop from './components/ScrollToTop'
import SiteFooter from './components/SiteFooter'
import SiteHeader from './components/SiteHeader'
import Home from './pages/Home'
import Consultation from './pages/Consultation'
import AdviceResult from './pages/AdviceResult'
import Faq from './pages/Faq'
import Terms from './pages/Terms'
import SupportLines from './pages/SupportLines'
import PrivacyPolicy from './pages/PrivacyPolicy'
import About from './pages/About'

// アプリシェル。使い方は「ホーム → フォーム → 結果」の一本道なので、ナビは置かない（#172）
// - スマホ（〜767px）: 幅430pxのモバイルUI
// - タブレット（768〜1023px）: 1カラムのまま少し広げる
// - PC（1024px〜）: ロゴだけの上部ヘッダー＋最大1160pxのWebサイト型レイアウト
// どの幅でも、下にフッター（よくある質問・相談窓口など）を置く
function Shell() {
  const { pathname } = useLocation()
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-surface shadow-[0_0_60px_rgba(60,50,40,0.08)] md:max-w-2xl lg:max-w-none lg:shadow-none">
      <ScrollToTop />
      <DocumentTitle />
      <SiteHeader />
      <main key={pathname} className="flex-1 animate-fade-up">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route path="/" element={<Home />} />
        <Route path="/consult" element={<Consultation />} />
        <Route path="/consult/result" element={<AdviceResult />} />
        {/* フッターから開くページ（#175）。パスとタイトルは pages/infoPages.js と揃える */}
        <Route path="/faq" element={<Faq />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/support" element={<SupportLines />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/about" element={<About />} />
        {/* マイページはなくした（#172）。古い URL はトップに戻す */}
        <Route path="/mypage" element={<Navigate to="/" replace />} />
        {/* 体験談のページは外した（#148）。古い URL（/stories、/stories/s1 など）はトップに戻す */}
        <Route path="/stories/*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
