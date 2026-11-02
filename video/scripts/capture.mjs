// 動画に使う画面を、ローカルの dev サーバー（npm run dev）から撮る。
// 画面ごとの PNG と、カーソルを動かす先（ボタン・選択肢の位置）を public/shots/ に書き出す。
// 使い方: リポジトリ直下で npm run dev → video/ で npm run capture
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright-core'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const OUT = new URL('../public/shots/', import.meta.url)
const VIEWPORT = { width: 390, height: 844 }

// 発表・動画は英語なので、アプリも英語版（?lang=en）で撮る
// デモで答える内容（英語版の選択肢の文言）。結果画面の並びが標準（要点 → ヒント）になるよう、相談先（professional_referral）は選ばない。
// 6問目（求めるサポート）は、答えでヒントと記事が変わることを見せる問い。記事につながる「似た経験を読む」も選ぶ
const ANSWERS = [
  ['Mother'],
  ['Health, vaccines, and health remedies'],
  ['They get upset when I disagree', "I'm feeling worn out myself"],
  ['No'],
  ['Improve our relationship'],
  ['Learn practical ways to respond', 'Read about people with similar experiences'],
]

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch({ channel: 'chrome' })

// 冒頭で並べる PC のトップ画面
const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, locale: 'en-US' })
await desktop.goto(`${BASE}/?lang=en`)
await desktop.waitForLoadState('networkidle')
await desktop.waitForTimeout(600)
await desktop.screenshot({ path: new URL('desktop-home.png', OUT).pathname })
await desktop.close()

const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: 2, locale: 'en-US' })
const meta = { viewport: VIEWPORT }

const rectOf = async (locator) => {
  const b = await locator.boundingBox()
  return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }
}
const shot = (name, opts = {}) =>
  page.screenshot({ path: new URL(`${name}.png`, OUT).pathname, ...opts })
// 動きを止めて、毎回同じ見た目で撮る
const freeze = () =>
  page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}' })

await page.goto(`${BASE}/?lang=en`)
await page.waitForLoadState('networkidle')
await freeze()
const start = page.getByRole('link', { name: /Describe your situation/ }).first()
meta.home = { cta: await rectOf(start) }
await shot('home')
await start.click()
await page.waitForURL('**/consult')
await freeze()

meta.questions = []
for (const [i, labels] of ANSWERS.entries()) {
  await page.evaluate(() => window.scrollTo(0, 0))
  await shot(`q${i + 1}-0`)
  const q = { choices: [], next: null, skip: null }
  for (const [j, label] of labels.entries()) {
    // 文言が前方一致する選択肢（例: "No" と "Not sure"）を取り違えないよう、入力欄の名前で完全一致させる
    const choice = page.locator('label').filter({ has: page.getByLabel(label, { exact: true }) })
    q.choices.push(await rectOf(choice))
    await choice.click()
    await shot(`q${i + 1}-${j + 1}`)
  }
  const next = page.getByRole('button', { name: 'Next', exact: true })
  q.next = await rectOf(next)
  // 「Skip this question」は2問目から。ナレーションで「とばせる」と言うときに囲む
  const skip = page.getByRole('button', { name: 'Skip this question', exact: true })
  if (await skip.count()) q.skip = await rectOf(skip)
  meta.questions.push(q)
  await next.click()
}

// 7問目：自由記述。AI と会話する機能に見えないよう、書かずに「See tips without writing」を押す（書くのは任意）
await page.evaluate(() => window.scrollTo(0, 0))
const submit = page.getByRole('button', { name: 'See tips without writing', exact: true })
meta.freeText = { submit: await rectOf(submit) }
await shot('q7-0')
await submit.click()
await page.waitForTimeout(200)
await shot('loading')

await page.waitForURL('**/consult/result')
await page.waitForLoadState('networkidle')
await freeze()
// 押したボタンの位置にマウスが残っていると、その下のカードがホバーの色になるので、左上へ逃がす
await page.mouse.move(0, 0)
await page.evaluate(() => window.scrollTo(0, 0))
await page.waitForTimeout(300)
const height = await page.evaluate(() => document.documentElement.scrollHeight)
// 結果は、いちばん上から記事の一覧までゆっくりスクロールし、記事の一覧をスマホから左へ飛び出させて大きく見せ、最後に記事を開く。
// どれもページの先頭（スクロール 0）からの位置で測る。スクロールで止める位置は、いちばん上 → 記事の一覧
// 記事の一覧（近い状況の記事や本）と、デモで開く記事。2問目の答え（健康・ワクチン）とつながる記事を開き、
// 答えで記事が変わることを見せる。見つからないときは一覧の2つめ。開いた先は動画には映さず、ドメインだけ使う
const articles = page.locator('section', { has: page.getByRole('heading', { name: 'Articles and books about similar situations' }) }).first()
const vaccineLink = articles.locator('a', { hasText: /vaccine/i }).first()
const articleLink = (await vaccineLink.count()) ? vaccineLink : articles.locator('a').nth(1)
const articlesRect = await rectOf(articles)
const articlesStop = Math.round(Math.min(articlesRect.y - 24, height - VIEWPORT.height))
meta.result = {
  height,
  stops: [0, articlesStop],
  articles: articlesRect,
  article: await rectOf(articleLink),
  articleHost: new URL(await articleLink.getAttribute('href')).hostname.replace(/^www\./, ''),
}
await shot('result', { fullPage: true })

await writeFile(new URL('shots.json', OUT), JSON.stringify(meta, null, 2))
await browser.close()
console.log(`captured → ${OUT.pathname} (result height ${height}px)`)
