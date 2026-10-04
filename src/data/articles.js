// 推薦に使う記事のモックデータ（#95）。
// 中身は articles.json。タグのスキーマは articleTags.js、検証は `npm run validate:articles`。
// 後で API や収集結果に差し替える際は、取得関数の中身を置き換えるだけ。

import articles from './articles.json' with { type: 'json' }

export const mockArticles = articles

// 一致する記事がないときに出す、人が選んだ固定の記事。
// approved かつ burden: light のものに限る（検証スクリプトで確かめる）。
export const FALLBACK_ARTICLE_IDS = ['a2', 'a3']

// 差し替え時はここだけ書き換える。
export async function getArticles() {
  return mockArticles
}

export function getArticleById(id) {
  return mockArticles.find((a) => a.id === id) || null
}
