import { CheckCircle2, Send, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'

const relations = ['家族', '友人', '恋人', '職場', 'その他']

const fields = [
  {
    key: 'happened',
    label: 'どんなことで困りましたか？',
    placeholder: '例）父が「本当のことは隠されている」という話を繰り返すようになり…',
  },
  {
    key: 'tried',
    label: 'どう対応しましたか？',
    placeholder: '例）否定せず、まず「どこで知ったの？」と聞くようにしました。',
  },
  {
    key: 'result',
    label: 'その後どうなりましたか？',
    placeholder: '例）すぐには変わらないけれど、会話は続くようになりました。',
  },
  {
    key: 'message',
    label: '今、同じ悩みの人に伝えたいこと',
    placeholder: '例）ひとりで抱え込まないでほしいです。',
  },
]

export default function NewStory() {
  const navigate = useNavigate()
  const [relation, setRelation] = useState('家族')
  const [done, setDone] = useState(false)

  if (done) {
    return (
      <div>
        <Header title="投稿完了" />
        <div className="flex flex-col items-center px-6 pt-20 text-center">
          <span className="flex size-20 items-center justify-center rounded-full bg-sage-100 text-sage-600">
            <CheckCircle2 size={44} />
          </span>
          <h2 className="mt-6 text-xl font-bold text-ink">
            投稿ありがとうございます
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            あなたの体験は、同じように悩む誰かの支えになります。<br />
            勇気を出して共有してくださって、ありがとうございました。
          </p>
          <button
            onClick={() => navigate('/stories')}
            className="mt-8 w-full rounded-2xl bg-sage-600 py-3.5 font-bold text-white transition hover:bg-sage-700 active:scale-[0.98]"
          >
            体験談一覧を見る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header title="体験を投稿する" back />

      <div className="px-5 pb-12 pt-4">
        <p className="text-sm leading-relaxed text-ink-soft">
          あなたの経験を、匿名で共有できます。<br />
          無理のない範囲で、書けるところだけで大丈夫です。
        </p>

        <div className="mt-3 flex items-start gap-2 rounded-xl border border-calm-200 bg-calm-50 p-3">
          <ShieldCheck size={17} className="mt-0.5 shrink-0 text-calm-700" />
          <p className="text-xs leading-relaxed text-calm-700">
            匿名で投稿されます。個人が特定できる情報や、特定の個人・団体を攻撃する内容は書かないでください。
          </p>
        </div>

        {/* 関係性 */}
        <p className="mt-6 mb-2 text-sm font-semibold text-ink">相手との関係</p>
        <div className="flex flex-wrap gap-2">
          {relations.map((r) => (
            <button
              key={r}
              onClick={() => setRelation(r)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition active:scale-95 ${
                relation === r
                  ? 'border-sage-500 bg-sage-500 text-white'
                  : 'border-line bg-surface text-ink-soft hover:border-sage-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* テキスト項目 */}
        <div className="mt-6 space-y-5">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="mb-1.5 block text-sm font-semibold text-ink">
                {f.label}
              </label>
              <textarea
                rows={3}
                placeholder={f.placeholder}
                className="w-full resize-none rounded-2xl border border-line bg-surface p-3.5 text-sm leading-relaxed text-ink outline-none transition placeholder:text-ink-faint/70 focus:border-sage-400 focus:ring-2 focus:ring-sage-100"
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => setDone(true)}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-sage-600 py-3.5 font-bold text-white shadow-[0_8px_20px_rgba(63,125,114,0.3)] transition hover:bg-sage-700 active:scale-[0.98]"
        >
          <Send size={18} />
          投稿する
        </button>
      </div>
    </div>
  )
}
