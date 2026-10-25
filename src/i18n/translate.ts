// 辞書を引いて文言を返す（#215）。React に依存しないので、tests/ から Node でも読み込める。
import { APP } from '../config.js'
import { en } from './en.ts'
import { ja } from './ja.ts'
import type { MessageKey, Messages } from './ja.ts'
import { fill } from './language.ts'
import type { Lang } from './language.ts'

export const DICTIONARIES: Record<Lang, Messages> = { ja, en }

export type Vars = Record<string, string | number>
export type Translate = <K extends MessageKey>(key: K, vars?: Vars) => Messages[K]

// 文字列なら差し込み（{name} などを）埋める。{name} にはサービス名が入る。
// 配列（文節・項目の一覧）はそのまま返す
export function translate<K extends MessageKey>(lang: Lang, key: K, vars?: Vars): Messages[K] {
  const value = DICTIONARIES[lang][key] ?? ja[key]
  if (typeof value !== 'string') return value
  return fill(value, { name: APP.name, ...vars }) as Messages[K]
}
