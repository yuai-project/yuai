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

// 差し込み（{name} などを）埋める。{name} にはサービス名が入る。
// 配列（文節・項目の一覧）や、よくある質問のような { q, a } の一覧の中の文字列も埋める
export function translate<K extends MessageKey>(lang: Lang, key: K, vars?: Vars): Messages[K] {
  const value = DICTIONARIES[lang][key] ?? ja[key]
  return fillDeep(value, { name: APP.name, ...vars }) as Messages[K]
}

function fillDeep(value: unknown, vars: Vars): unknown {
  if (typeof value === 'string') return fill(value, vars)
  if (Array.isArray(value)) return value.map((v) => fillDeep(v, vars))
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, fillDeep(v, vars)]))
  }
  return value
}
