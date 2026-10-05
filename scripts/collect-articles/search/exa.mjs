// Exa の検索（#96 / #107）。
//
// 規約 4.2(a) の許可がまだ無いため、受け取るのは URL・タイトル・公開日だけにする。
// 要約文や本文（contents）は取らない。

const ENDPOINT = 'https://api.exa.ai/search'

export function createExaSearch({ apiKey = process.env.EXA_API_KEY } = {}) {
  if (!apiKey) throw new Error('EXA_API_KEY が設定されていません（.env.local か Actions Secrets）')

  return async function search(query, { numResults, excludeDomains }) {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify({
        query,
        type: 'auto',
        numResults,
        excludeDomains,
      }),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`Exa の検索に失敗しました（${res.status}）: ${body.slice(0, 300)}`)
    }
    const data = await res.json()
    return {
      results: (data.results ?? []).map((r) => ({
        url: r.url,
        title: r.title ?? '',
        publishedAt: r.publishedDate ? r.publishedDate.slice(0, 10) : null,
      })),
      costDollars: data.costDollars?.total ?? null,
    }
  }
}
