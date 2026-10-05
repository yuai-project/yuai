#!/usr/bin/env node
// 記事候補を集める（#107）。
//
// 検索 → 除外ドメイン・既知の URL との重複を除く → AI の下読み → 判定用シートへ追記。
// 既知の URL は articles.json と、--write-sheet のときは判定用シートの全行（却下済みも含む）。
//
//   npm run collect:articles                          # 全クエリを検索して下読みまで
//   npm run collect:articles -- --limit 2             # 先頭2クエリだけ（試し打ち用）
//   npm run collect:articles -- --skip-review         # 検索だけ（下読みしない）
//   npm run collect:articles -- --from <file.json>    # 検索せず、--json で保存した候補を使う（--skip-review なら下読みの結果も使う）
//   npm run collect:articles -- --json                # 結果を JSON で出す
//   npm run collect:articles -- --write-sheet         # 判定用シートと突き合わせ、追記する（Actions ではこれ）

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { COLLECT_EXCLUDED_DOMAINS, createDeduper, pickFresh } from './dedupe.mjs'
import { buildQueries } from './queries.mjs'
import { estimateCost, reviewCandidates } from './review.mjs'
import { createSearch } from './search/index.mjs'
import { CANDIDATE_TAB, HEADER, JUDGMENT_COLUMN, JUDGMENT_VALUES, toRow } from './sheetRow.mjs'
import { openSheet } from './sheets.mjs'

// 検索 API はページ送りができず、同じクエリの上位は毎週ほぼ同じになる。
// そこで多めに取り、既知の URL を除いた上位だけを残す（Exa では 50 件で約 $0.047 / クエリ）。
const FETCH_PER_QUERY = 50
// 1クエリから候補にする上限。監修者の判定の量はこちらで決まる
const KEEP_PER_QUERY = 10

const { values: args } = parseArgs({
  options: {
    limit: { type: 'string' },
    json: { type: 'boolean', default: false },
    'skip-review': { type: 'boolean', default: false },
    from: { type: 'string' },
    'write-sheet': { type: 'boolean', default: false },
  },
})

// 下読みしていない候補をシートに入れると、既知の URL になって下読みされないまま埋もれる
if (args['write-sheet'] && args['skip-review'] && !args.from) {
  console.error('--write-sheet と --skip-review は、下読み済みのファイルを --from で渡すときだけ一緒に使えます')
  process.exit(1)
}

const articlesPath = fileURLToPath(new URL('../../src/data/articles.json', import.meta.url))
const knownUrls = JSON.parse(await readFile(articlesPath, 'utf8')).map((a) => a.url)

// 判定用シートの URL も既知として扱う。読めなければ openSheet / readUrls が例外を投げて止まる
let sheet = null
if (args['write-sheet']) {
  sheet = await openSheet()
  const { created } = await sheet.ensureTab(CANDIDATE_TAB, HEADER, {
    judgmentColumn: JUDGMENT_COLUMN,
    judgmentValues: JUDGMENT_VALUES,
  })
  // 手で候補を入れていたタブなど、重複判定にだけ使うタブ（カンマ区切り）
  const extraTabs = (process.env.SHEET_DEDUPE_TABS ?? '').split(',').map((t) => t.trim()).filter(Boolean)
  for (const tab of [CANDIDATE_TAB, ...extraTabs]) {
    const urls = await sheet.readUrls(tab)
    knownUrls.push(...urls)
    console.error(`シート「${tab}」: 既知の URL ${urls.length} 件${tab === CANDIDATE_TAB && created ? '（タブを作成）' : ''}`)
  }
}
const deduper = createDeduper(knownUrls)

async function collect() {
  let queries = buildQueries()
  if (args.limit) queries = queries.slice(0, Number(args.limit))

  const { name: provider, search } = createSearch()
  const fetchedAt = new Date().toISOString().slice(0, 10)

  const candidates = []
  const perQuery = []
  let cost = 0
  for (const q of queries) {
    const { results, costDollars } = await search(q.text, {
      numResults: FETCH_PER_QUERY,
      excludeDomains: COLLECT_EXCLUDED_DOMAINS,
    })
    cost += costDollars ?? 0

    const { kept, stats } = pickFresh(results, deduper, KEEP_PER_QUERY)
    perQuery.push({ query: `${q.axis}.${q.value}`, kept: kept.length, ...stats })
    for (const r of kept) {
      candidates.push({
        ...r,
        publisher: new URL(r.url).hostname,
        fetchedAt,
        query: q.text,
        queryAxis: q.axis,
        queryValue: q.value,
      })
    }
  }

  // クエリごとの内訳。「新規」が 0 のクエリが続くなら、その軸の記事はほぼ集め切ったという合図
  console.error('クエリ別（取得 / 新規 / 採用 / 重複 / 除外ドメイン）')
  for (const s of perQuery) {
    console.error(
      `  ${s.query.padEnd(36)} ${String(s.fetched).padStart(3)} / ${String(s.fresh).padStart(3)} / ${String(s.kept).padStart(3)} / ${String(s.duplicate).padStart(3)} / ${String(s.excluded_domain).padStart(3)}`,
    )
  }
  const saturated = perQuery.filter((s) => s.fresh === 0).map((s) => s.query)
  console.error(
    [
      '',
      `検索: ${provider} / ${queries.length} クエリ × 最大 ${FETCH_PER_QUERY} 件`,
      `候補: ${candidates.length} 件（1クエリ最大 ${KEEP_PER_QUERY} 件）`,
      saturated.length ? `新規 0 件のクエリ: ${saturated.join(', ')}` : null,
      `検索の費用: $${cost.toFixed(4)}`,
    ]
      .filter(Boolean)
      .join('\n'),
  )
  return candidates
}

// 保存済みの候補を使うときも、既知の URL とは突き合わせ直す（同じファイルを2回流しても重複しない）
async function loadFrom(path) {
  const all = JSON.parse(await readFile(path, 'utf8'))
  const fresh = all.filter((c) => {
    if (deduper.check(c.url)) return false
    deduper.add(c.url)
    return true
  })
  console.error(`${path}: ${all.length} 件のうち新規 ${fresh.length} 件`)
  // --skip-review のときは、ファイルにある下読みの結果をそのまま使う（下読みの費用をかけずに追記を試せる）
  return args['skip-review'] ? fresh : fresh.map(({ review: _review, ...c }) => c)
}

let candidates = args.from ? await loadFrom(args.from) : await collect()

if (!args['skip-review']) {
  console.error(`\n下読み: ${candidates.length} 件`)
  const { reviewed, usage } = await reviewCandidates(candidates, {
    onProgress: (done, total) => {
      if (done % 20 === 0 || done === total) console.error(`  ${done} / ${total}`)
    },
  })
  candidates = reviewed

  const byLabel = Object.groupBy(candidates, (c) => c.review.label ?? 'エラー')
  console.error(
    [
      `ラベル別: ${Object.entries(byLabel).map(([k, v]) => `${k} ${v.length}`).join(' / ')}`,
      `下読みの費用: $${estimateCost(usage).toFixed(4)}（入力 ${usage.input_tokens} / 出力 ${usage.output_tokens} トークン）`,
    ].join('\n'),
  )
}

// 下読みに失敗した候補はシートに入れない。入れると既知の URL になり、下読みされないまま埋もれるため。
// 入れなければ次の回にまた候補になる。半分以上が失敗したら、キーや残高など全体の問題とみなして止める
const failed = candidates.filter((c) => c.review?.error)
if (failed.length > 0) {
  console.error(`下読みに失敗: ${failed.length} 件（例: ${failed[0].review.error.slice(0, 300)}）`)
}
const reviewBroken = failed.length > 0 && failed.length >= candidates.length / 2

if (args.json) {
  console.log(JSON.stringify(candidates, null, 2))
} else {
  for (const c of candidates) {
    const r = c.review
    console.log(`- ${c.title || '(タイトルなし)'}\n  ${c.url}\n  [${c.queryAxis}.${c.queryValue}] ${c.publishedAt ?? '公開日不明'}`)
    if (r?.error) console.log(`  下読み: エラー（${r.error}）`)
    else if (r) console.log(`  下読み: ${r.label} ${r.flags.length ? `[${r.flags.join(', ')}]` : ''}\n    ${r.reason}`)
  }
}

if (reviewBroken) {
  console.error('下読みの半分以上が失敗したため、シートには追記せずに止めます')
  process.exit(1)
}

if (sheet) {
  // 下読みの結果が無いもの（失敗した・--from のファイルに無かった）は入れない
  const rows = candidates.filter((c) => c.review?.label)
  await sheet.appendRows(CANDIDATE_TAB, rows.map(toRow))
  console.error(
    `シート「${CANDIDATE_TAB}」に ${rows.length} 件を追記しました${rows.length < candidates.length ? `（下読みの結果が無い ${candidates.length - rows.length} 件は次の回に回す）` : ''}`,
  )
}
