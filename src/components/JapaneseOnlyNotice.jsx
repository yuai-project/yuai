import { Info } from 'lucide-react'
import { useI18n } from '../i18n/useI18n'

// まだ日本語しかないページ（フッターのページ）の冒頭に出す注記（#215）。日本語の画面では何も出さない。
// ページ本体には lang="ja" を付けて、読み上げが日本語で読むようにする（JapaneseOnlyPage）
export default function JapaneseOnlyNotice() {
  const { t, lang } = useI18n()
  if (lang === 'ja') return null
  return (
    <p
      lang={lang}
      className="mb-4 flex items-start gap-2 rounded-xl bg-cream px-4 py-3 text-sm leading-relaxed text-ink-soft"
    >
      <Info size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-brand-700" />
      {t('infoPages.japaneseOnly')}
    </p>
  )
}
