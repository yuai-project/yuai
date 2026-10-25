import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { useI18n } from '../i18n/useI18n'

// コピーできる「返し方」の一行。押すとクリップボードへ。
export default function CopyableLine({ text }) {
  const { t } = useI18n()
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
      className="group flex w-full items-start gap-2.5 rounded-xl border border-control bg-surface px-3.5 py-3 text-left transition hover:bg-brand-50 active:scale-[0.99]"
    >
      <span className="min-w-0 flex-1 text-sm leading-relaxed text-ink lg:text-base">
        {t('common.quoteOpen')}{text}{t('common.quoteClose')}
      </span>
      <span
        className={`mt-0.5 flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-bold transition ${
          copied ? 'text-success-700' : 'text-brand-700'
        }`}
      >
        {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
        {copied ? t('common.copied') : t('common.copy')}
      </span>
    </button>
  )
}
