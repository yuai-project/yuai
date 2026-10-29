import { Languages } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/useI18n'
import { INFO_PAGES } from '../pages/infoPages'
import { WindowLine } from './Logo'
import Phrases from './Phrases'

// どの幅でも出すフッター。ログインやマイページの代わりに、大事な情報への入口をまとめる（#172）。
// 文字が大きくなってもはみ出さないよう、リンクは横に並べて折り返す。
// 言語の切り替えもここに置く（どの幅でも出る場所で、ホームの入口を増やさないため。#215）
export default function SiteFooter() {
  const { t, lang } = useI18n()
  return (
    <footer className="relative overflow-hidden border-t border-line bg-cream pb-[env(safe-area-inset-bottom)]">
      {/* 右下に窓の線画を薄く添える。ホームのヒーローや結果画面の帯と対にする */}
      <WindowLine className="absolute -bottom-2 right-4 h-16 text-brand-100 lg:right-[max(2rem,calc(50%-36.25rem+2rem))] lg:h-28" />
      <div className="relative mx-auto max-w-page px-5 py-6 lg:flex lg:items-start lg:justify-between lg:gap-10 lg:px-8 lg:py-8">
        <div>
          <nav aria-label={t('footer.navLabel')}>
            <ul className="flex flex-wrap gap-x-5 text-sm text-ink-soft">
              {INFO_PAGES.map(({ path, key }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className="inline-block py-2 underline decoration-control underline-offset-4 transition hover:text-ink"
                  >
                    <Phrases phrases={t(key)} spaced={lang === 'en'} />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <LanguageSwitch />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-ink-faint [word-break:auto-phrase] lg:mt-2 lg:max-w-md lg:text-right">
          {t('footer.disclaimer')}
        </p>
      </div>
    </footer>
  )
}

// 言語の切り替え。今と違う言語の名前を、その言語で出す（日本語の画面では「English」）
function LanguageSwitch() {
  const { t, setLang } = useI18n()
  const next = t('language.switchToLang')
  return (
    <button
      type="button"
      lang={next}
      aria-label={t('language.switchLabel')}
      onClick={() => setLang(next)}
      className="mt-2 inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-control bg-surface px-3 text-sm text-ink-soft transition hover:text-ink"
    >
      <Languages size={16} aria-hidden="true" className="shrink-0" />
      {t('language.switchTo')}
    </button>
  )
}
