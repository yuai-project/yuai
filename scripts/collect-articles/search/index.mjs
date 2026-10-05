// 検索プロバイダの切り替え口（#107）。
//
// どのプロバイダも search(query, { numResults, excludeDomains }) を返し、
// 戻り値は { results: [{ url, title, publishedAt }], costDollars }。
// Exa の許可が取れずに Tavily へ切り替えるときは、tavily.mjs を足してここに登録する。

import { createExaSearch } from './exa.mjs'

const PROVIDERS = {
  exa: createExaSearch,
}

export function createSearch(name = process.env.SEARCH_PROVIDER || 'exa') {
  const create = PROVIDERS[name]
  if (!create) {
    throw new Error(`未対応の検索プロバイダ "${name}"（対応: ${Object.keys(PROVIDERS).join(', ')}）`)
  }
  return { name, search: create() }
}
