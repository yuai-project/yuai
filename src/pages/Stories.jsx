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

      <div className="px-5 pb-28 pt-4 lg:mx-auto lg:max-w-page lg:px-8 lg:pb-16 lg:pt-3">
        <div className="lg:flex lg:items-end lg:justify-between lg:gap-8">
          <p className="text-sm leading-relaxed text-ink-soft">
            同じように悩んだ人の経験を読むことができます。<br />
            「自分だけじゃない」と思えることが、次の一歩になります。
          </p>
          {/* 投稿ボタン（PC。スマホは下のFAB） */}
          <button
            onClick={() => navigate('/stories/new')}
            className="hidden shrink-0 items-center gap-2 rounded-full bg-brand px-5 py-2.5 font-bold text-brand-ink shadow-[0_8px_20px_rgba(242,138,69,0.22)] transition hover:bg-brand-400 active:scale-95 lg:flex"
          >
            <PenLine size={18} />
            体験を投稿する
          </button>
        </div>

        {/* フィルタ（見た目のみ・プロト） */}
        <div className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:mt-6 lg:px-0">
          {filters.map((f, i) => (
            <button
              key={f}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                i === 0
                  ? 'border-brand bg-brand text-brand-ink'
                  : 'border-line bg-surface text-ink-soft'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* 一覧（PCは3列） */}
        <div className="mt-4 space-y-3 lg:mt-5 lg:grid lg:grid-cols-3 lg:gap-5 lg:space-y-0">
          {mockStories.map((s) => (
            <StoryCard key={s.id} story={s} />
          ))}
        </div>
      </div>

      {/* 投稿FAB（スマホ・タブレット） */}
      <button
        onClick={() => navigate('/stories/new')}
        className="fixed bottom-20 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-brand px-5 py-3 font-bold text-brand-ink shadow-[0_10px_24px_rgba(242,138,69,0.32)] transition hover:bg-brand-400 active:scale-95 lg:hidden"
      >
        <PenLine size={18} />
        体験を投稿する
      </button>
    </div>
  )
}
