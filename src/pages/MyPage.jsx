import {
  Bookmark,
  MessageCircleHeart,
  Phone,
  ChevronRight,
  Heart,
  Settings,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import { APP } from '../config'

const menu = [
  { icon: MessageCircleHeart, label: '過去の相談履歴', note: 'プロト版では未保存' },
  { icon: Bookmark, label: '保存した体験談', note: '3件' },
  { icon: Heart, label: '共感した体験談', note: '5件' },
  { icon: Settings, label: '設定', note: '' },
]

export default function MyPage() {
  return (
    <div>
      <Header title="マイページ" />

      <div className="px-5 pb-28 pt-4">
        {/* プロフィール（ダミー） */}
        <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4">
          <span className="flex size-14 items-center justify-center rounded-full bg-sage-100 text-sage-600">
            <Heart size={26} fill="currentColor" />
          </span>
          <div>
            <p className="font-bold text-ink">ゲストさん</p>
            <p className="text-xs text-ink-faint">
              いつでも、ここはあなたの味方です。
            </p>
          </div>
        </div>

        {/* セルフケアの一言 */}
        <div className="mt-4 rounded-2xl bg-gradient-to-b from-sage-50 to-cream p-4">
          <p className="text-sm leading-relaxed text-sage-700">
            今日も、大切な人のことを考えているあなたへ。<br />
            <span className="font-semibold">
              まず、あなた自身を大切にできていますか？
            </span>
          </p>
        </div>

        {/* メニュー */}
        <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {menu.map(({ icon: Icon, label, note }) => (
            <li key={label}>
              <button className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-sage-50">
                <Icon size={19} className="shrink-0 text-sage-600" />
                <span className="flex-1 text-sm font-medium text-ink">
                  {label}
                </span>
                {note && <span className="text-xs text-ink-faint">{note}</span>}
                <ChevronRight size={16} className="text-ink-faint" />
              </button>
            </li>
          ))}
        </ul>

        {/* 相談窓口 */}
        <div className="mt-6 rounded-2xl border border-calm-200 bg-calm-50 p-4">
          <h2 className="flex items-center gap-2 text-sm font-bold text-calm-700">
            <Phone size={16} />
            つらいときの相談窓口
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-calm-700">
            ひとりで抱えきれないときは、公的な相談窓口に頼ることもできます。
            あなたの安全と心の健康が、なによりも大切です。
          </p>
          <p className="mt-2 text-[11px] text-ink-faint">
            ※ プロトタイプのため、実際の窓口情報は本番実装時に掲載します。
          </p>
        </div>

        {/* CTA */}
        <Link
          to="/consult"
          className="mt-6 flex items-center justify-between rounded-2xl bg-sage-600 px-5 py-4 text-white transition hover:bg-sage-700 active:scale-[0.98]"
        >
          <span className="font-bold">いまの気持ちを相談する</span>
          <ChevronRight size={20} />
        </Link>

        <p className="mt-6 text-center text-[11px] text-ink-faint">
          {APP.name}（{APP.subtitle}）— {APP.tagline}
        </p>
      </div>
    </div>
  )
}
