import { PenLine } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import StoryCard from '../components/StoryCard'
import { mockStories } from '../data/mockStories'

const filters = ['すべて', '家族', '友人', '恋人', '職場']

export default function Stories() {
  const navigate = useNavigate()

  return (
    <div>
      <Header title="みんなの体験談" />

      <div className="px-5 pb-28 pt-4">
        <p className="text-sm leading-relaxed text-ink-soft">
          同じように悩んだ人の経験を読むことができます。<br />
          「自分だけじゃない」と思えることが、次の一歩になります。
        </p>

        {/* フィルタ（見た目のみ・プロト） */}
        <div className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1">
          {filters.map((f, i) => (
            <button
              key={f}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                i === 0
                  ? 'border-sage-500 bg-sage-500 text-white'
                  : 'border-line bg-surface text-ink-soft'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* 一覧 */}
        <div className="mt-4 space-y-3">
          {mockStories.map((s) => (
            <StoryCard key={s.id} story={s} />
          ))}
        </div>
      </div>

      {/* 投稿FAB */}
      <button
        onClick={() => navigate('/stories/new')}
        className="fixed bottom-20 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-warm-500 px-5 py-3 font-bold text-white shadow-[0_10px_24px_rgba(181,116,74,0.4)] transition hover:bg-warm-600 active:scale-95"
      >
        <PenLine size={18} />
        体験を投稿する
      </button>
    </div>
  )
}
