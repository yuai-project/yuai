import { useState } from 'react'
import { APP } from '../config'
import { useI18n } from '../i18n/useI18n'
import { joinPhrases } from '../i18n/language'

// 控えめな「このサイトを伝える」ボタン。SNS のボタン部品は使わず、どのサービスとも直接つながない。
// スマホ（指で操作する端末）では OS の共有画面を開き、それ以外や共有できない環境では URL をコピーする。
export default function ShareSiteButton() {
  const { t, lang } = useI18n()
  const [status, setStatus] = useState('') // '' | 'copied' | 'failed'
  const url = `${window.location.origin}/`

  const share = async () => {
    const canShare =
      typeof navigator.share === 'function' &&
      window.matchMedia('(pointer: coarse)').matches
    if (canShare) {
      try {
        await navigator.share({ title: APP.name, text: joinPhrases(lang, t('app.catchcopy').flat()), url })
        return
      } catch (e) {
        // 共有画面を閉じただけのときは何もしない
        if (e instanceof DOMException && e.name === 'AbortError') return
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setStatus('copied')
    } catch {
      setStatus('failed')
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <button
        type="button"
        onClick={share}
        className="rounded-xl border border-control bg-surface px-3.5 py-2 text-sm font-bold text-brand-700 transition hover:bg-brand-50"
      >
        {t('share.button')}
      </button>
      <p role="status" className="text-xs text-ink-faint">
        {status === 'copied' && t('share.copied')}
        {status === 'failed' && (
          <>
            {t('share.failed')}<span className="break-all">{url}</span>
          </>
        )}
      </p>
    </div>
  )
}
