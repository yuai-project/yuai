import { Heart, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Tag from './Tag'

// 体験談カード。一覧・AI結果の「似た体験談」で共用。
export default function StoryCard({ story }) {
  const navigate = useNavigate()
  const [liked, setLiked] = useState(false)

  return (
    <article
      onClick={() => navigate(`/stories/${story.id}`)}
      className="cursor-pointer rounded-2xl border border-line bg-surface p-4 shadow-[0_1px_2px_rgba(60,50,40,0.04)] transition hover:border-sage-200 hover:shadow-[0_6px_18px_rgba(60,50,40,0.06)] active:scale-[0.99]"
    >
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <Tag tone="sage">{story.relation}</Tag>
        {story.tags.slice(0, 2).map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
      </div>

      <h3 className="mb-1 font-bold leading-snug text-ink">{story.title}</h3>
      <p className="line-clamp-2 text-sm leading-relaxed text-ink-soft">
        {story.excerpt}
      </p>

      <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
        <span className="text-xs text-ink-faint">{story.author} さん</span>
        <div className="flex items-center gap-3 text-ink-faint">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setLiked((v) => !v)
            }}
            className={`flex items-center gap-1 text-xs transition active:scale-90 ${
              liked ? 'text-warm-500' : 'hover:text-warm-500'
            }`}
            aria-label="共感する"
          >
            <Heart size={15} fill={liked ? 'currentColor' : 'none'} />
            {story.likes + (liked ? 1 : 0)}
          </button>
          <span className="flex items-center gap-1 text-xs">
            <MessageCircle size={15} />
            {story.comments}
          </span>
        </div>
      </div>

      <span className="mt-2 inline-block text-xs font-semibold text-sage-600">
        続きを読む →
      </span>
    </article>
  )
}
