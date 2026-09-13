import { ThumbsUp, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Header from '../components/Header'
import StoryCard from '../components/StoryCard'
import Tag from '../components/Tag'
import { getStoryById, mockStories } from '../data/mockStories'

const sectionMeta = [
  { key: 'happened', label: '起きたこと', tone: 'text-ink' },
  { key: 'hard', label: 'つらかったこと', tone: 'text-notice-700' },
  { key: 'tried', label: 'やってみたこと', tone: 'text-brand-700' },
  { key: 'worked', label: 'うまくいったこと', tone: 'text-brand-700' },
  { key: 'reflection', label: '今振り返って思うこと', tone: 'text-calm-700' },
]

export default function StoryDetail() {
  const { id } = useParams()
  const story = getStoryById(id)
  const [helped, setHelped] = useState(false)

  if (!story) {
    return (
      <div>
        <Header title="体験談" back />
        <p className="p-8 text-center text-sm text-ink-soft">
          体験談が見つかりませんでした。
        </p>
      </div>
    )
  }

  const related = mockStories
    .filter((s) => s.id !== story.id && s.relation === story.relation)
    .slice(0, 2)

  return (
    <div>
      <Header title="体験談" back />

      {/* PCは 左: 本文カード / 右: 似た体験談 */}
      <div className="px-5 pb-12 pt-4 lg:mx-auto lg:grid lg:max-w-page lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start lg:gap-10 lg:px-8 lg:pb-16 lg:pt-6">
        <article className="lg:rounded-3xl lg:border lg:border-line lg:bg-surface lg:p-10 lg:shadow-[0_1px_3px_rgba(60,50,40,0.04)]">
          {/* タグ */}
          <div className="mb-3 flex flex-wrap gap-1.5">
            <Tag tone="brand">{story.relation}</Tag>
            {story.tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>

          <h1 className="text-xl font-bold leading-snug text-ink lg:text-2xl">
            {story.title}
          </h1>
          <p className="mt-1.5 text-xs text-ink-faint">{story.author} さん</p>

          {/* 本文セクション */}
          <div className="mt-6 space-y-5 lg:mt-8 lg:space-y-7">
            {sectionMeta.map(({ key, label, tone }) => (
              <section key={key}>
                <h2 className={`mb-1.5 text-sm font-bold ${tone} lg:text-base`}>
                  <span className="mr-2 inline-block h-3 w-1 translate-y-0.5 rounded-full bg-current opacity-60" />
                  {label}
                </h2>
                <p className="text-sm leading-relaxed text-ink-soft lg:text-[15px] lg:leading-loose">
                  {story.sections[key]}
                </p>
              </section>
            ))}
          </div>

          {/* 役に立ったボタン */}
          <button
            onClick={() => setHelped((v) => !v)}
            className={`mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border py-3.5 font-bold transition active:scale-[0.98] lg:mt-10 ${
              helped
                ? 'border-brand bg-brand text-brand-ink'
                : 'border-brand-200 bg-surface text-brand-700 hover:bg-brand-50'
            }`}
          >
            <ThumbsUp size={18} fill={helped ? 'currentColor' : 'none'} />
            {helped ? 'ありがとうございます！' : 'この体験談が役に立った'}
          </button>
        </article>

        <aside className="lg:sticky lg:top-24">
          {/* 似た体験談 */}
          {related.length > 0 && (
            <section className="mt-9 lg:mt-0">
              <h2 className="mb-3 flex items-center gap-1.5 font-bold text-ink">
                <Sparkles size={16} className="text-brand-600" />
                似た体験談を見る
              </h2>
              <div className="space-y-3">
                {related.map((s) => (
                  <StoryCard key={s.id} story={s} />
                ))}
              </div>
            </section>
          )}

          <div className="mt-8 text-center lg:mt-6">
            <Link
              to="/stories"
              className="text-sm font-semibold text-brand-700"
            >
              ← 体験談一覧にもどる
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
