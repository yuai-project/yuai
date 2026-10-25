// 表示する言語を決める（#215）。React に依存しない部分だけをここに置き、tests/ から Node で読み込めるようにする。
//
// 決める順番:
//   1. URL の ?lang=en / ?lang=ja（共有されたリンクなど）
//   2. 前回選んだ言語（localStorage。読めない環境では飛ばす）
//   3. ブラウザの言語（navigator.languages。英語が日本語より先にあれば en）
//   4. どれも無ければ日本語

export const LANGS = ['ja', 'en'] as const
export type Lang = (typeof LANGS)[number]
export const DEFAULT_LANG: Lang = 'ja'

// localStorage のキー
export const STORAGE_KEY = 'yorido.lang'

export const isLang = (value: unknown): value is Lang =>
  typeof value === 'string' && (LANGS as readonly string[]).includes(value)

// ブラウザの言語の一覧（例: ['en-US', 'ja']）から、最初に当てはまる言語
export function langFromNavigator(languages: readonly string[] = []): Lang | null {
  for (const tag of languages) {
    const base = tag.toLowerCase().split('-')[0]
    if (isLang(base)) return base
  }
  return null
}

// ?lang= の値（無い・知らない言語なら null）
export function langFromSearch(search = ''): Lang | null {
  const value = new URLSearchParams(search).get('lang')
  return isLang(value) ? value : null
}

export function detectLanguage({
  search = '',
  stored = null,
  navigatorLanguages = [],
}: {
  search?: string
  stored?: string | null
  navigatorLanguages?: readonly string[]
} = {}): Lang {
  return (
    langFromSearch(search) ??
    (isLang(stored) ? stored : null) ??
    langFromNavigator(navigatorLanguages) ??
    DEFAULT_LANG
  )
}

// localStorage は、プライベートブラウズやサイトデータのブロックで読み書きできないことがある。
// そのときは覚えないだけで、画面は普通に出す
export function readStoredLang(storage: Pick<Storage, 'getItem'> | undefined): string | null {
  try {
    return storage?.getItem(STORAGE_KEY) ?? null
  } catch {
    return null
  }
}

export function writeStoredLang(storage: Pick<Storage, 'setItem'> | undefined, lang: Lang): void {
  try {
    storage?.setItem(STORAGE_KEY, lang)
  } catch {
    // 覚えられなくても、今の画面の言語はそのまま
  }
}

// 「{name}」のような差し込みを埋める。知らない名前はそのまま残す
export function fill(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (all, key: string) =>
    key in vars ? String(vars[key]) : all,
  )
}

// 改行してよい位置で区切った文節（Phrases）を1つの文にする。日本語は詰め、英語は空白でつなぐ
export const joinPhrases = (lang: Lang, phrases: readonly string[]): string =>
  phrases.join(lang === 'en' ? ' ' : '')
