import { ShieldCheck, Send, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { getAdvice } from '../data/mockAdvice'

const chips = [
  '家族',
  '友人',
  '恋人',
  '職場',
  '否定すると怒る',
  '会話が成り立たない',
  '自分が疲れている',
]

const placeholder = `父が最近『政府は真実を隠している』と繰り返し話すようになりました。
否定すると怒ってしまうので、どう話せばいいか分かりません。
私自身も少し疲れています。`

export default function Consultation() {
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(false)

  const toggleChip = (c) =>
    setSelected((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]))

  const submit = async () => {
    setLoading(true)
    // ここが将来のLLM API呼び出しポイント
    await getAdvice({ text, chips: selected })
    navigate('/consult/result')
  }

  return (
    <div>
      <Header title="AIに相談する" back />

      <div className="px-5 pb-10 pt-4">
        <h2 className="text-lg font-bold leading-snug text-ink">
          いま困っていることを
          <br />
          教えてください
        </h2>

        {/* プライバシー注意 */}
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-calm-200 bg-calm-50 p-3">
          <ShieldCheck size={17} className="mt-0.5 shrink-0 text-calm-700" />
          <p className="text-xs leading-relaxed text-calm-700">
            個人が特定できる情報（実名・住所・勤務先など）は入力しないでください。
          </p>
        </div>

        {/* textarea */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          rows={7}
          className="mt-4 w-full resize-none rounded-2xl border border-line bg-surface p-4 text-sm leading-relaxed text-ink shadow-inner outline-none transition placeholder:text-ink-faint/70 focus:border-sage-400 focus:ring-2 focus:ring-sage-100"
        />

        {/* 状況チップ */}
        <p className="mt-5 mb-2 text-sm font-semibold text-ink">
          状況を選ぶ（任意）
        </p>
        <div className="flex flex-wrap gap-2">
          {chips.map((c) => {
            const on = selected.includes(c)
            return (
              <button
                key={c}
                onClick={() => toggleChip(c)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition active:scale-95 ${
                  on
                    ? 'border-sage-500 bg-sage-500 text-white'
                    : 'border-line bg-surface text-ink-soft hover:border-sage-200'
                }`}
              >
                {c}
              </button>
            )
          })}
        </div>

        {/* 相談ボタン */}
        <button
          onClick={submit}
          disabled={loading}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-sage-600 py-3.5 font-bold text-white shadow-[0_8px_20px_rgba(63,125,114,0.3)] transition hover:bg-sage-700 active:scale-[0.98] disabled:opacity-90"
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              あなたの気持ちを整理しています…
            </>
          ) : (
            <>
              <Send size={18} />
              相談する
            </>
          )}
        </button>

        <p className="mt-4 text-center text-xs leading-relaxed text-ink-faint">
          このAIは相手を論破するためのものではありません。<br />
          あなたと、大切な人の関係にそっと寄りそいます。
        </p>
      </div>
    </div>
  )
}
