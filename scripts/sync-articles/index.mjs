#!/usr/bin/env node
// 判定用シートで承認した記事を articles.json に足す（#168）。Actions では、差分があれば PR を作る。
//
// シートの「レビュー」タブで判定が「承認」の行のうち、URL が articles.json に無いものを取り込む。
// - 関係性・話題・困りごと・記事の種類: シートの値（監修者が付けたもの）
// - 要約・stance・burden・sourceType・medicalInfo: AI の下書き（summarize.mjs）。PR で人が確かめる
//   記事の種類がシートで空の行は、AI の候補を使う
// - 本文が取れず下書きできなかった記事と、発信元の決まりに合わない記事は status: paused で入れる（推薦に出ない）
// - 載せないと決めた記事は、PR で status: paused にしておけば次から取り込まれない（URL で重複を見るため）
//
//   npm run sync:articles -- --dry-run              # シートを読んで、取り込む件数だけ出す（AI もファイルも触らない）
//   npm run sync:articles                           # articles.json を書き換える
//   npm run sync:articles -- --report pr-body.md    # あわせて PR 本文を書き出す（Actions ではこれ）
//   npm run sync:articles -- --limit 2              # 先頭2件だけ（試し用）

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import Anthropic from '@anthropic-ai/sdk'
import { isRestrictedMedicalArticle } from '../../src/data/articleTags.ts'
import { REVIEW_TAB } from '../collect-articles/sheetRow.mjs'
import { openSheet } from '../collect-articles/sheets.mjs'
import { formatArticles, pickNewApproved, readReviewRows, toId, toTags, todayJst } from './convert.mjs'
import { draftArticle, estimateCost } from './summarize.mjs'

const { values: args } = parseArgs({
  options: {
    'dry-run': { type: 'boolean', default: false },
    report: { type: 'string' },
    limit: { type: 'string' },
  },
})

const articlesPath = fileURLToPath(new URL('../../src/data/articles.json', import.meta.url))
const articles = JSON.parse(await readFile(articlesPath, 'utf8'))

const sheet = await openSheet()
const rows = readReviewRows(await sheet.readRows(REVIEW_TAB))
const { picked: allPicked, skipped } = pickNewApproved(rows, articles)
const picked = args.limit ? allPicked.slice(0, Number(args.limit)) : allPicked

console.error(`シート「${REVIEW_TAB}」: ${rows.length} 行、うち承認済みで未取り込み ${allPicked.length} 件`)
for (const { row, reason } of skipped) console.error(`  取り込まない: No.${row.No}（${reason}）`)

if (args['dry-run'] || picked.length === 0) {
  console.error(args['dry-run'] ? 'dry run のため、ここで終わります' : '取り込む記事はありません')
  process.exit(0)
}

const client = new Anthropic()
const usedIds = new Set(articles.map((a) => a.id))
const reviewedAt = todayJst()
const usage = { input_tokens: 0, output_tokens: 0 }
const added = []

for (const row of picked) {
  const { tags, warnings } = toTags(row)
  const result = await draftArticle(row, tags, { client })
  const notes = [...warnings]
  let status = 'approved'

  let drafted
  if (result.ok) {
    drafted = result.draft
    usage.input_tokens += result.usage.input_tokens
    usage.output_tokens += result.usage.output_tokens
    if (drafted.notes) notes.push(`AI: ${drafted.notes}`)
  } else {
    // 仮の値で入れて paused にする。人が要約を書いて approved に戻す
    drafted = { summary: '（要約はまだありません）', stance: 'neutral', burden: 'moderate', sourceType: 'media', medicalInfo: false, supportTypes: ['coping_tips'] }
    status = 'paused'
    notes.push(`${result.error}。要約・stance・burden・sourceType は仮の値なので、書いてから approved にする`)
  }
  if (tags.supportTypes.length === 0) {
    tags.supportTypes = drafted.supportTypes.slice(0, 2)
    notes.push(`記事の種類がシートで空なので、${result.ok ? 'AI の候補' : '仮の値'}（${tags.supportTypes.join(', ')}）にした`)
  }

  const article = {
    id: toId(row.No, usedIds),
    url: row.URL,
    title: row['タイトル'],
    publisher: row['発信元'],
    summary: drafted.summary,
    ...tags,
    stance: drafted.stance,
    burden: drafted.burden,
    sourceType: drafted.sourceType,
    status,
    reviewedAt,
    ...(drafted.medicalInfo ? { medicalInfo: true } : {}),
  }
  if (isRestrictedMedicalArticle(article)) {
    article.status = 'paused'
    notes.push('医療・健康の情報そのものを扱う記事だが、発信元が公的機関・学術・専門職ではないので paused にした')
  }

  added.push({ article, row, notes })
  console.error(`  ${article.id}: ${article.status}`)
}

await writeFile(articlesPath, formatArticles([...articles, ...added.map((a) => a.article)]))
console.error(`${added.length} 件を articles.json に足しました（AI の費用の目安 $${estimateCost(usage).toFixed(3)}）`)

if (args.report) await writeFile(args.report, buildReport(added, skipped))

function buildReport(items, skippedRows) {
  const paused = items.filter((i) => i.article.status === 'paused')
  const lines = [
    '## 何を変えた？',
    '',
    `判定用シートの「${REVIEW_TAB}」タブで承認済みの記事 ${items.length} 件を、\`src/data/articles.json\` に足しました（\`sync-articles\` ワークフローが自動で作った PR です）。`,
    paused.length > 0 ? `うち ${paused.length} 件は \`status: paused\` で入れています（推薦には出ません）。` : null,
    '',
    '## マージする前に',
    '',
    '- **要約・stance・burden・sourceType・medicalInfo は AI の下書きです。** 記事を開いて確かめ、直すところはこのブランチで直してください',
    '- 要約は利用者に見える文言です。`tone-check` スキルで7項目を確かめてください',
    '- **載せない記事は、消さずに `status` を `paused` にしてください。** 消すと次の実行でまた取り込まれます',
    '- この PR が開いている間、ワークフローは新しい PR を作りません（手で直した内容を上書きしないため）',
    '',
    '## 足した記事',
    '',
    '| id | シート | 記事 | status | 確かめてほしいこと |',
    '|---|---|---|---|---|',
    ...items.map(({ article, row, notes }) =>
      `| ${article.id} | No.${row.No} | [${escapeCell(article.title)}](${article.url}) | ${article.status} | ${escapeCell(notes.join(' / ')) || '—'} |`,
    ),
    ...(skippedRows.length > 0
      ? [
          '',
          '## 取り込まなかった承認済みの行',
          '',
          'シートを直すと、次の実行で取り込まれます。',
          '',
          ...skippedRows.map(({ row, reason }) => `- No.${row.No}: ${reason}（${row.URL}）`),
        ]
      : []),
    '',
    '## プロダクト思想チェック（文言を足した / 変えた PR のみ）',
    '',
    '- [ ] 相手の状態を断定・診断していない',
    '- [ ] 相手を「陰謀論者」とラベリングしていない',
    '- [ ] 相手を必ず変えられると約束していない',
    '- [ ] 危険な状況で「無理に話さなくていい」逃げ道を残している',
    '',
    '🤖 Generated by `.github/workflows/sync-articles.yml`',
    '',
  ]
  return lines.filter((l) => l != null).join('\n')
}

function escapeCell(s) {
  return String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ')
}
