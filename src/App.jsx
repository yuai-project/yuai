import { Outlet, Route, Routes, useLocation } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Consultation from './pages/Consultation'
import AdviceResult from './pages/AdviceResult'
import Stories from './pages/Stories'
import StoryDetail from './pages/StoryDetail'
import NewStory from './pages/NewStory'
import MyPage from './pages/MyPage'

// モバイルシェル: PCでは中央に幅430pxのアプリが浮かぶ。
function Shell() {
  const { pathname } = useLocation()
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-cream shadow-[0_0_60px_rgba(60,50,40,0.12)] sm:my-0">
      <main key={pathname} className="flex-1 animate-fade-up">
        <Outlet />
      </main>
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
