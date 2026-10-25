// 言語を決めて Context に入れる（#215）。ライブラリは使わない。文言を使う側は useI18n() の t() を使う。
//
// 言語の決め方は language.ts の detectLanguage()。選んだ言語は localStorage に覚え、<html lang> も切り替える。

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { detectLanguage, langFromSearch, readStoredLang, writeStoredLang } from './language.ts'
import type { Lang } from './language.ts'
import { translate } from './translate.ts'
import { I18nContext } from './useI18n.ts'
import type { I18nValue } from './useI18n.ts'

const storage = (): Storage | undefined => {
  try {
    return window.localStorage
  } catch {
    return undefined
  }
}

function initialLang(): Lang {
  const lang = detectLanguage({
    search: window.location.search,
    stored: readStoredLang(storage()),
    navigatorLanguages: window.navigator.languages ?? [window.navigator.language],
  })
  // ?lang= で開いたときも「選んだ言語」として覚える（同じ端末で次に開いたときも同じ言語にする）
  if (langFromSearch(window.location.search)) writeStoredLang(storage(), lang)
  return lang
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    writeStoredLang(storage(), next)
    // URL に ?lang= が残っていると、再読み込みで元の言語に戻ってしまうので書き換える
    const url = new URL(window.location.href)
    if (url.searchParams.has('lang')) {
      url.searchParams.set('lang', next)
      window.history.replaceState(window.history.state, '', url)
    }
  }, [])

  const value = useMemo<I18nValue>(
    () => ({ lang, setLang, t: (key, vars) => translate(lang, key, vars) }),
    [lang, setLang],
  )
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
