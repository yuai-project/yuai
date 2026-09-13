import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

// コピーできる「返し方」の一行。押すとクリップボードへ。
export default function CopyableLine({ text }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // クリップボード不可の環境でも演出だけは出す
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }

  return (
    <button
      onClick={copy}
      className="group flex w-full items-start gap-2.5 rounded-xl border border-brand-100 bg-surface/70 p-3 text-left transition hover:border-brand active:scale-[0.99]"
    >
      <span className="mt-0.5 flex-1 text-sm leading-relaxed text-ink">
        「{text}」
      </span>
      <span
        className={`flex shrink-0 items-center gap-1 text-xs font-semibold transition ${
          copied ? 'text-success-700' : 'text-brand-600'
        }`}
      >
        {copied ? <Check size={15} /> : <Copy size={15} />}
        {copied ? 'コピー' : ''}
      </span>
    </button>
  )
}
