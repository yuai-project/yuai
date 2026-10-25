import {
  SUPPORT_LINES_NOTICE,
  SUPPORT_LINES_NOTICE_EN,
  isOtherLanguageOnly,
  supportLineText,
  telHref,
} from '../data/supportLines'
import { useI18n } from '../i18n/useI18n'

// 電話で相談できる窓口の一覧。番号はタップで電話をかけられる。
// 電話で相談できる窓口のページ（/support）と、結果画面の安全の案内で共用。
// 番号は途中で改行しない（whitespace-nowrap）。
// 英語の画面では英語の文言を出し、日本語だけの窓口には「Japanese-language service」と添える（#217）
export default function SupportLineList({ lines }) {
  const { t, lang } = useI18n()
  return (
    <>
      {/* 日本語だけのページ（lang="ja"）の中で使っても、英語の画面では英語で読み上げる */}
      <ul lang={lang === 'en' ? 'en' : undefined} className="mt-2 [word-break:auto-phrase]">
        {lines.map((line) => {
          const { name, note, description } = supportLineText(line, lang)
          return (
            <li key={line.id} className="border-t border-brand-200 py-3">
              <p className="text-sm font-bold text-ink [word-break:auto-phrase]">{name}</p>
              {lang === 'en' && isOtherLanguageOnly(line, lang) && (
                <p className="mt-0.5">
                  <span className="inline-block rounded-md border border-control px-1.5 text-[11px] font-bold leading-relaxed text-ink-soft">
                    {t('supportLines.japaneseOnly')}
                  </span>
                </p>
              )}
              <p className="flex flex-wrap items-baseline gap-x-2">
                <a
                  href={telHref(line.tel)}
                  aria-label={t('supportLines.callLabel', { line: name, tel: line.tel })}
                  className="inline-block whitespace-nowrap py-1.5 text-lg font-bold tabular-nums text-ink underline decoration-control underline-offset-4"
                >
                  {line.tel}
                </a>
                {note && (
                  <span className="text-xs text-ink-soft">
                    {t('common.parenOpen')}{note}{t('common.parenClose')}
                  </span>
                )}
              </p>
              <p className="text-xs leading-relaxed text-ink-soft">{description}</p>
            </li>
          )
        })}
      </ul>
      <p className="text-[11px] leading-relaxed text-ink-faint">
        {lang === 'en' ? SUPPORT_LINES_NOTICE_EN : SUPPORT_LINES_NOTICE}
      </p>
    </>
  )
}
