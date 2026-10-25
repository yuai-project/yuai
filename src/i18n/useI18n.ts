// 言語を持つ Context と、t() を返すフック（#215）。Context に値を入れるのは I18nProvider。
//
//   const { t, lang, setLang } = useI18n()
//   t('home.start')                              → '状況を入れてヒントをみる'
//   t('app.title')                               → 'Yorido | ひとりで…'（{name} にはサービス名が自動で入る）
//   t('supportLines.callLabel', { line, tel })   → 差し込みを埋める
import { createContext, useContext } from 'react'
import type { Lang } from './language.ts'
import { translate } from './translate.ts'
import type { Translate } from './translate.ts'

export type I18nValue = { lang: Lang; setLang: (lang: Lang) => void; t: Translate }

export const I18nContext = createContext<I18nValue>({
  lang: 'ja',
  setLang: () => {},
  t: (key, vars) => translate('ja', key, vars),
})

export const useI18n = (): I18nValue => useContext(I18nContext)
