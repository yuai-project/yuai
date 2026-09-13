import { Outlet, Route, Routes, useLocation } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import DocumentTitle from './components/DocumentTitle'
import ScrollToTop from './components/ScrollToTop'
import SiteFooter from './components/SiteFooter'
import SiteHeader from './components/SiteHeader'
import Home from './pages/Home'
import Consultation from './pages/Consultation'
import AdviceResult from './pages/AdviceResult'
import Stories from './pages/Stories'
import StoryDetail from './pages/StoryDetail'
import NewStory from './pages/NewStory'
import MyPage from './pages/MyPage'

// アプリシェル
// - スマホ（〜767px）: 幅430pxのモバイルUI＋下部ナビ
// - タブレット（768〜1023px）: 1カラムのまま少し広げる＋下部ナビ
// - PC（1024px〜）: 上部ヘッダーナビ＋最大1160pxのWebサイト型レイアウト（下部ナビは非表示）
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
      <BottomNav />
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
        <Route path="/stories" element={<Stories />} />
        <Route path="/stories/new" element={<NewStory />} />
        <Route path="/stories/:id" element={<StoryDetail />} />
        <Route path="/mypage" element={<MyPage />} />
      </Route>
    </Routes>
  )
}
