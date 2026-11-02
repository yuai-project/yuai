// 動画の台本。どのフレームでどの画面を出し、カーソルをどこへ動かしてタップするか。
// 位置（ボタン・選択肢）は scripts/capture.mjs が実画面から測った shots.json を使う。
// 座標はすべてスマホ画面の CSS px（幅390 × 高さ844。左上が原点）。カーソル（cursor）は指の代わりの白い丸の位置。
// 見る人が酔わないよう、カメラは場面の切り替えのときだけ動かす（操作中はカーソルだけが動く）
import capture from '../public/shots/shots.json'

export const FPS = 30
export const DURATION = 48 * FPS
export const SCREEN = capture.viewport

const sec = (s: number) => Math.round(s * FPS)

type Rect = { x: number; y: number; w: number; h: number }
type Point = { x: number; y: number }
// scrollY は結果画面（ページ全体の画像）をどこまでスクロールした状態で見せるか。
// scroll があるときは、そのキーに沿ってスクロールする（結果画面を、指ではじくようにして上から順に見せる）
export type ScreenShot = { from: number; src: string; fade: boolean; scrollY?: number; scroll?: ScrollKey[] }
// ease は、ひとつ前のキーからこのキーまでの動き方。in は指で引き上げる間（だんだん速く）、out は指を離したあとの惰性（だんだん遅く）
export type Ease = 'linear' | 'in' | 'out'
export type ScrollKey = { f: number; y: number; ease: Ease }
export type CursorKey = { f: number; ease?: Ease } & Point
// 指が画面に触れて引いている間（白い丸を少し縮めて濃くする）
export type Drag = { from: number; to: number }
// 左の見出し。questions があるときは、その下に質問の一覧を出す（いまの問いだけ強調）。
// pinTop は見出しを上に寄せる（下に飛び出した部品を置くため）
export type Caption = { from: number; title: string; questions?: number[]; pinTop?: boolean }
// カメラ。zoom 0 は冒頭の「PC とスマホを並べた全景」、1 はスマホ枠の標準の大きさ。focusY はスマホ画面のどこを中心に見せるか
export type CameraKey = { f: number; zoom: number; focusY: number }
// ナレーションに合わせて、スマホ画面の上の部品を囲む
export type Highlight = { from: number; to: number; rect: Rect }
// スマホ画面の部品を切り出し、左の見出しの下へ飛び出させて大きく見せる。
// src が 'screen' のときは、そのとき出ている画面から切り出す（自由記述の入力中も文字が増えていく）。
// 'result' のときは結果画面のページ全体の画像から切り出し、rect はページの先頭からの位置、scrollY はそのときのスクロール位置。
// inPlace のときは左へ飛ばさず、スマホの画面の上でその場で大きくする（フォームの選択肢）
export type Popout = { from: number; to: number; rect: Rect; scrollY: number; src: 'screen' | 'result'; inPlace?: boolean }

// 冒頭：PC とスマホを並べて見せ（〜ZOOM_START）、スマホに寄る（〜ZOOM_END）
export const ZOOM_START = sec(1.8)
export const ZOOM_END = sec(3.3)
export const INTRO_END = sec(3.5)
export const OUTRO_START = sec(42)
// 操作中の倍率。スマホ画面の全体が動画に収まる大きさ。冒頭で寄ったあとは最後まで変えない
const BASE_ZOOM = 1.08
const MIDDLE = SCREEN.height / 2

const shots: ScreenShot[] = []
const cursor: CursorKey[] = []
const clicks: CursorKey[] = []
const captions: Caption[] = []
const highlights: Highlight[] = []
const popouts: Popout[] = []
const drags: Drag[] = []
const touchOff: { from: number; to: number }[] = []
const camera: CameraKey[] = [
  { f: 0, zoom: 0, focusY: MIDDLE },
  { f: ZOOM_START, zoom: 0, focusY: MIDDLE },
  { f: ZOOM_END, zoom: BASE_ZOOM, focusY: MIDDLE },
]

let t = INTRO_END
let pos: Point = { x: 110, y: 650 }

const show = (src: string, fade = false, scrollY?: number) => {
  shots.push({ from: t, src: `shots/${src}.png`, fade, scrollY })
  return shots[shots.length - 1]
}
const wait = (s: number) => {
  t += sec(s)
}
// 選択肢は文字のあたり、ボタンは真ん中を狙う
const target = (r: Rect, left = false): Point => ({
  x: r.x + (left ? Math.min(150, r.w * 0.4) : r.w / 2),
  y: r.y + r.h / 2,
})
const moveTo = (p: Point, s = 0.6) => {
  cursor.push({ f: t, ...pos })
  wait(s)
  pos = p
  cursor.push({ f: t, ...pos })
}
// 時間を進めずに、t から s 秒かけてカーソルを動かす（左の一覧にチェックが付く間など、ほかの動きと重ねるとき）
const drift = (p: Point, s: number) => {
  cursor.push({ f: t, ...pos }, { f: t + sec(s), ...p })
  pos = p
}
const tap = () => {
  clicks.push({ f: t, ...pos })
  wait(0.2)
}
// いま出ている画面の部品を、t から s 秒のあいだ左へ飛び出させる（スマホの中のもとの部分も囲む）
const popScreen = (rect: Rect, s: number) => {
  popouts.push({ from: t, to: t + sec(s), rect, scrollY: 0, src: 'screen' })
  highlights.push({ from: t, to: t + sec(s), rect })
}
// いま出ている画面の部品を、t から s 秒のあいだ、スマホの画面の上でその場で大きくする
const zoomInPlace = (rect: Rect, s: number) => {
  popouts.push({ from: t, to: t + sec(s), rect, scrollY: 0, src: 'screen', inPlace: true })
}
// 複数の選択肢をまとめて囲む四角
const union = (rects: Rect[]): Rect => {
  const x = Math.min(...rects.map((r) => r.x))
  const y = Math.min(...rects.map((r) => r.y))
  return {
    x,
    y,
    w: Math.max(...rects.map((r) => r.x + r.w)) - x,
    h: Math.max(...rects.map((r) => r.y + r.h)) - y,
  }
}

// ---------- ホーム ----------
// 見出しはどの場面も上に寄せ、その下に飛び出した部品（質問の場面では質問の一覧）を置く
captions.push({ from: t, title: 'Start here', pinTop: true })
show('home')
cursor.push({ f: t, ...pos })
wait(0.6)
// 押す前に、はじめるボタンを飛び出させる
popScreen(capture.home.cta, 2.3)
wait(2.9)
moveTo(target(capture.home.cta), 0.9)
wait(0.3)
tap()
wait(0.2)

// ---------- 質問 ----------
// 見る人が追いつけるよう、操作を見せるのは 1問目（相手が誰か）と 6問目（求めるサポート）だけ。
// 6問目は、答えで結果のヒントと記事が変わることを伝える問いなので、選んだ答えをその場で大きく見せる。
// 2〜5問目は画面を出さず、左の一覧にチェックが順に付いていくだけにする。
// 7問目（自由記述）は、AI と会話する機能に見えないよう、書かずに「See tips without writing」を押す（書くのは任意）
const questionStarts: number[] = []
captions.push({ from: t, title: 'Answer 7 questions', questions: questionStarts, pinTop: true })
// 答えを選んで、その場で大きくして見せ、「Next」を押す
const answer = (i: number, hold = 3) => {
  const q = capture.questions[i]
  wait(0.8)
  q.choices.forEach((c, j) => {
    moveTo(target(c, true), 0.6)
    tap()
    show(`q${i + 1}-${j + 1}`)
    wait(0.3)
  })
  zoomInPlace(union(q.choices), hold)
  wait(hold + 0.2)
  moveTo(target(q.next), 0.6)
  tap()
}
// 一覧で、飛ばして見せる問いにチェックを順に付ける
const tick = (count: number) => {
  for (let k = 0; k < count; k++) {
    questionStarts.push(t)
    wait(0.35)
  }
}

questionStarts.push(t)
show('q1-0', true)
answer(0, 2.2)

// 1問目の「Next」の位置は、6問目の「Skip this question」と重なる。押しそうに見えないよう、チェックが付く間に指を中ほどへ逃がす
drift({ x: 300, y: 672 }, 1.2)
tick(4)
questionStarts.push(t)
show('q6-0', true)
// ナレーションの "you can skip any question" のあたりで「Skip this question」を囲む
const skip = capture.questions[5].skip
if (skip) highlights.push({ from: t, to: t + sec(2.4), rect: skip })
wait(0.6)
answer(5, 3.3)

// ---------- 7問目：自由記述（書かずに進む） ----------
questionStarts.push(t)
show('q7-0', true)
wait(0.8)
moveTo(target(capture.freeText.submit), 0.7)
wait(0.2)
tap()
show('loading')
wait(1.1)

// ---------- 結果 ----------
// いちばん上から記事の一覧まで、人がスクロールするように指で4回はじいて進める（部品は飛び出させない）。
// 1回ごとに、指を置く → 引き上げる（ページが指に付いて動く）→ 離す（勢いで少し流れて止まる）→ 少し読む
// → 記事の一覧を左へ飛び出させる（記事が結果の中心であることを見せる）
// → 記事をタップすると、その記事が左へ飛び出し、新しいタブが開く
captions.push({ from: t, title: 'Read your tips', pinTop: true })
const { articles, article, articleHost } = capture.result
const [top, articlesStop] = capture.result.stops
const result = show('result', true, top)
const scrollKeys: ScrollKey[] = [{ f: t, y: top, ease: 'linear' }]
result.scroll = scrollKeys
// 指は画面から離れている間は消す（iPhone の画面収録の「タッチを表示」と同じ）。offFrom は指が離れたとき
let offFrom = t
wait(0.6)
const ARTICLE_POP = 3.6
const ARTICLE_SCENE = sec(ARTICLE_POP + 0.2 + 0.5 + 0.15 + 0.2 + 3.2)
const SWIPES = 4
// 指が出てから触れるまで・引き上げる時間・離したあと流れる時間（秒）
const LEAD = 0.3
const DRAG = 0.3
const FLING = 0.6
// 1回で進む量のうち、指で引く分（残りは離したあとの惰性）。引く速さと惰性の出だしの速さがそろう割合にする
const DRAG_SHARE = DRAG / (DRAG + FLING)
// 記事の場面に要る時間を引いた残りで、はじいたあとに読む間を決める
const readPause = Math.max(0.3, ((OUTRO_START - t - ARTICLE_SCENE) / FPS - SWIPES * (LEAD + DRAG + FLING)) / SWIPES)
const SWIPE_FROM = { x: 236, y: 640 }
let scrolled = top
for (let k = 0; k < SWIPES; k++) {
  const step = (articlesStop - top) / SWIPES
  // 消えている間に、指を置く位置へ移しておく
  cursor.push({ f: t - 1, ...pos }, { f: t, ...SWIPE_FROM })
  pos = SWIPE_FROM
  touchOff.push({ from: offFrom, to: t })
  wait(LEAD)
  // 引き上げる。指とページは同じだけ、同じ速さで動く
  const pull = step * DRAG_SHARE
  drags.push({ from: t, to: t + sec(DRAG) })
  cursor.push({ f: t, ...pos })
  scrollKeys.push({ f: t, y: scrolled, ease: 'linear' })
  wait(DRAG)
  pos = { x: SWIPE_FROM.x + 8, y: SWIPE_FROM.y - pull }
  cursor.push({ f: t, ...pos, ease: 'in' })
  scrolled += pull
  scrollKeys.push({ f: t, y: scrolled, ease: 'in' })
  // 離す。ページは勢いで流れて止まる
  offFrom = t
  wait(FLING)
  scrolled = k === SWIPES - 1 ? articlesStop : scrolled + step - pull
  scrollKeys.push({ f: t, y: scrolled, ease: 'out' })
  wait(readPause)
}
captions.push({ from: t, title: 'Articles for you', pinTop: true })
popouts.push({ from: t, to: t + sec(ARTICLE_POP), rect: articles, scrollY: articlesStop, src: 'result' })
highlights.push({ from: t, to: t + sec(ARTICLE_POP), rect: { ...articles, y: articles.y - articlesStop } })
wait(ARTICLE_POP + 0.2)
// 指を出し、記事をタップする
touchOff.push({ from: offFrom, to: t })
const articleOnScreen = { ...article, y: article.y - articlesStop }
cursor.push({ f: t - 1, ...pos })
pos = { x: target(articleOnScreen, true).x + 60, y: target(articleOnScreen, true).y - 110 }
cursor.push({ f: t, ...pos })
moveTo(target(articleOnScreen, true), 0.5)
wait(0.15)
tap()
// タップした記事（タイトル・出典・要約）を左へ飛び出させる。エンディングまで出したまま。
// 記事の上の区切り線が入らないよう、上を少し詰めて切り出す
const ARTICLE_TRIM = 14
popouts.push({ from: t, to: OUTRO_START + sec(1), rect: { ...article, y: article.y + ARTICLE_TRIM, h: article.h - ARTICLE_TRIM }, scrollY: articlesStop, src: 'result' })
// タップしたら指は離す（新しいタブの上には残さない）
touchOff.push({ from: t, to: DURATION + sec(1) })
// 記事は外部サイトを新しいタブで開く。開いた先のページは映さず、アドレス欄のドメインだけ見せる
const newTab = { from: t + sec(0.6), host: articleHost }

export const timeline = {
  shots,
  cursor,
  clicks,
  captions,
  camera,
  highlights,
  popouts,
  touchOff,
  drags,
  newTab,
  resultHeight: capture.result.height,
}
