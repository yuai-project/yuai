import type { CSSProperties, ReactNode } from 'react'
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'
import { DURATION, INTRO_END, OUTRO_START, SCREEN, ZOOM_END, ZOOM_START, timeline } from './timeline'
import type { CameraKey, Ease, ScreenShot } from './timeline'
import { WORDMARK_PATH } from './logoPaths'

// 色はアプリの src/index.css の @theme にそろえる
const C = {
  surface: '#ffffff',
  // 動画の背景。アプリの新しい背景と同じ、少し温かい白（緑はロゴ・強調・囲みだけに使う）
  paper: '#fbfbf9',
  faint: '#a3aaa6',
  brand50: '#eef4f1',
  brand200: '#c5d8ce',
  brand: '#2f5d50',
  brand700: '#2a5347',
  ink: '#24302b',
  inkSoft: '#55605a',
  bezel: '#1f2623',
}
// 動画の文字は英語。Mac の system-ui（SF Pro）を使い、無ければアプリと同じ並びに落とす
const FONT = "system-ui, -apple-system, 'Helvetica Neue', 'Hiragino Kaku Gothic ProN', sans-serif"
// アプリの英語版のコンセプト文（src/i18n/en.ts の app.concept）
const CONCEPT = 'Before getting the facts across, first keep the conversation going.'

// ステージ（カメラで動かす面）の上の配置。カメラが等倍のとき、ステージの座標＝動画の座標
// スマホ枠の大きさ。画面（CSS px）を SCALE 倍して置く
const SCALE = 1.05
const STATUS_BAR = 44
const BEZEL = 14
const SCREEN_W = SCREEN.width * SCALE
const SCREEN_H = (SCREEN.height + STATUS_BAR) * SCALE
const PHONE_W = SCREEN_W + BEZEL * 2
const PHONE_H = SCREEN_H + BEZEL * 2
const PHONE_LEFT = 1110
const PHONE_TOP = (1080 - PHONE_H) / 2
const PHONE_CX = PHONE_LEFT + PHONE_W / 2
// 冒頭だけ見せる PC のブラウザ。スマホの左に並べる（等倍のときは画面の外）
const DESK_W = 1400
const DESK_BAR = 40
const DESK_H = (DESK_W * 900) / 1440 + DESK_BAR
const DESK_LEFT = PHONE_LEFT - 80 - DESK_W
const DESK_TOP = (1080 - DESK_H) / 2
// スマホ画面の CSS px → ステージの座標
const toStage = (x: number, y: number) => ({
  x: PHONE_LEFT + BEZEL + x * SCALE,
  y: PHONE_TOP + BEZEL + (STATUS_BAR + y) * SCALE,
})

const easeInOut = Easing.bezier(0.45, 0, 0.25, 1)
// 指ではじくスクロールの動き方。引き上げる間はだんだん速く、離したあとはだんだん遅く。
// 2乗の曲線どうしなので、引く時間と流れる時間の比に合わせて量を分ければ、つなぎ目で速さがそろう
const EASES: Record<Ease, (t: number) => number> = { linear: (t) => t, in: Easing.in(Easing.quad), out: Easing.out(Easing.quad) }
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const

// カメラのキー → ステージに掛ける変形（ステージの点 p は p * s + (tx, ty) に映る）
type Transform = { s: number; tx: number; ty: number }
const OVERVIEW: Transform = (() => {
  const s = 0.68
  const cx = (DESK_LEFT + PHONE_LEFT + PHONE_W) / 2
  return { s, tx: 960 - cx * s, ty: 660 - 540 * s }
})()
function toTransform({ zoom, focusY }: CameraKey): Transform {
  if (zoom === 0) return OVERVIEW
  const s = zoom
  // 拡大するほどスマホを少し右へ寄せ、左の見出しにかぶらないようにする
  const cx = interpolate(s, [1, 1.4], [PHONE_CX, 1420], clamp)
  // スマホ枠が丸ごと収まる倍率なら、上下の真ん中に置く
  if (PHONE_H * s <= 1080) return { s, tx: cx - PHONE_CX * s, ty: 540 - (PHONE_TOP + PHONE_H / 2) * s }
  // 収まらないときは focusY が画面の真ん中に来るように。ただしスマホ枠の上下の端より外は見せない
  const ty = 540 - toStage(0, focusY).y * s
  const top = 40 - PHONE_TOP * s
  const bottom = 1040 - (PHONE_TOP + PHONE_H) * s
  return { s, tx: cx - PHONE_CX * s, ty: bottom > top ? (top + bottom) / 2 : Math.min(top, Math.max(bottom, ty)) }
}
const CAMERA = timeline.camera.map((k) => ({ f: k.f, ...toTransform(k) }))
const cameraAt = (frame: number): Transform => ({
  s: keyframes(CAMERA, frame, (k) => k.s),
  tx: keyframes(CAMERA, frame, (k) => k.tx),
  ty: keyframes(CAMERA, frame, (k) => k.ty),
})

export function YoridoIntro() {
  return (
    <AbsoluteFill style={{ background: C.paper, fontFamily: FONT, color: C.ink }}>
      <Audio
        src={staticFile('bgm.wav')}
        volume={(f) => interpolate(f, [0, 20, DURATION - 45, DURATION], [0, 0.35, 0.35, 0], clamp)}
      />
      <DemoScene />
      <Opening />
      <Sequence from={OUTRO_START}>
        <Outro />
      </Sequence>
      {timeline.clicks.map((c) => (
        <Sequence key={c.f} from={c.f} durationInFrames={10}>
          <Audio src={staticFile('click.wav')} volume={0.7} />
        </Sequence>
      ))}
    </AbsoluteFill>
  )
}

// ロゴ（ワードマーク）。o を2つともアーチ窓にした形。size はロゴの高さ
function Logo({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 862 226" height={size} width={(size * 862) / 226} style={{ display: 'block' }}>
      <path fill={C.brand} fillRule="evenodd" d={WORDMARK_PATH} />
    </svg>
  )
}

// 下からふわっと出す
function FadeUp({ delay = 0, children, style }: { delay?: number; children: ReactNode; style?: CSSProperties }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const p = spring({ frame: frame - delay, fps, config: { damping: 200 } })
  return <div style={{ opacity: p, transform: `translateY(${(1 - p) * 24}px)`, ...style }}>{children}</div>
}

// 冒頭：PC とスマホの上にロゴとコンセプト。スマホに寄りはじめたら消す
function Opening() {
  const frame = useCurrentFrame()
  const out = interpolate(frame, [ZOOM_START, ZOOM_START + 15], [1, 0], clamp)
  if (out === 0) return null
  return (
    <AbsoluteFill style={{ alignItems: 'center', paddingTop: 96, opacity: out }}>
      <FadeUp>
        <Logo size={64} />
      </FadeUp>
      <FadeUp delay={10} style={{ marginTop: 28, fontSize: 42, fontWeight: 700, color: C.brand700 }}>
        {CONCEPT}
      </FadeUp>
    </AbsoluteFill>
  )
}

// カメラで動かすステージ（PC・スマホ枠・カーソル）＋左の見出し
function DemoScene() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const enter = spring({ frame, fps, config: { damping: 200 } })
  const leave = interpolate(frame, [OUTRO_START - 5, OUTRO_START + 15], [0, 1], { ...clamp, easing: easeInOut })
  const cam = cameraAt(frame)
  const captionsIn = interpolate(frame, [ZOOM_END - 6, INTRO_END + 6], [0, 1], clamp)
  const desktop = interpolate(frame, [ZOOM_START, ZOOM_START + 25], [1, 0], clamp)
  return (
    <AbsoluteFill style={{ opacity: enter * (1 - leave), transform: `translateY(${(1 - enter) * 60 + leave * 60}px)` }}>
      <div style={{ opacity: captionsIn }}>
        <Captions frame={frame} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 1920,
          height: 1080,
          transformOrigin: '0 0',
          transform: `translate(${cam.tx}px, ${cam.ty}px) scale(${cam.s})`,
        }}
      >
        {desktop > 0 && <Desktop opacity={desktop} />}
        <Phone frame={frame} />
        <Highlights frame={frame} />
        <Touch frame={frame} />
      </div>
      <Popouts frame={frame} cam={cam} />
    </AbsoluteFill>
  )
}

function Desktop({ opacity }: { opacity: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: DESK_LEFT,
        top: DESK_TOP,
        width: DESK_W,
        height: DESK_H,
        borderRadius: 16,
        overflow: 'hidden',
        background: C.surface,
        opacity,
        boxShadow: '0 40px 80px rgba(36,48,43,0.18), 0 0 0 1px rgba(36,48,43,0.08)',
      }}
    >
      <div style={{ height: DESK_BAR, display: 'flex', alignItems: 'center', gap: 9, padding: '0 18px', background: '#e8ebe9' }}>
        {['#e0796b', '#e7b65a', '#7cbf7a'].map((c) => (
          <span key={c} style={{ width: 13, height: 13, borderRadius: '50%', background: c }} />
        ))}
        <span style={{ marginLeft: 'auto', marginRight: 'auto', width: 420, height: 24, borderRadius: 12, background: C.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: C.inkSoft, fontFamily: 'system-ui, sans-serif' }}>
          Yorido
        </span>
      </div>
      <Img src={staticFile('shots/desktop-home.png')} style={{ display: 'block', width: DESK_W, height: DESK_H - DESK_BAR }} />
    </div>
  )
}

// アプリの英語版の質問の短い名前（src/i18n/en.ts の consult.questionNames。PC 版の左の一覧と同じ）
const QUESTION_NAMES = [
  'Your relationship',
  'What it is about',
  'What is troubling you',
  'Someone to talk to',
  'Your relationship from here',
  'Support you want',
  'Details',
]

// 左の見出し。説明の文はナレーションに任せ、短い見出し（と質問の一覧）だけにする
function Captions({ frame }: { frame: number }) {
  const list = timeline.captions
  const i = Math.max(list.findLastIndex((c) => c.from <= frame), 0)
  const c = list[i]
  const p = interpolate(frame - c.from, [0, 12], [0, 1], clamp)
  return (
    // ロゴは左上に固定し、見出し（と一覧）は上下の真ん中に置く
    <>
      <div style={{ position: 'absolute', left: 190, top: 96 }}>
        <Logo size={40} />
      </div>
      <div
        key={c.from}
        style={{
          position: 'absolute',
          left: 190,
          top: c.pinTop ? POPOUT_TOP - 150 : 0,
          bottom: c.pinTop ? undefined : 0,
          width: 820,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          opacity: p,
        }}
      >
        <div style={{ fontSize: 88, fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>{c.title}</div>
        {c.questions && <QuestionList frame={frame} starts={c.questions} />}
      </div>
    </>
  )
}

// 質問の一覧。いまの問いだけ緑の太字にし、答え終わった問いにはチェック、まだの問いは薄く
function QuestionList({ frame, starts }: { frame: number; starts: number[] }) {
  const current = starts.findLastIndex((f) => f <= frame)
  return (
    <div style={{ marginTop: 52, display: 'flex', flexDirection: 'column', gap: 20, opacity: 1 - popoutShown(frame) }}>
      {QUESTION_NAMES.map((name, i) => {
        const done = i < current
        const now = i === current
        return (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 22, fontSize: 40, lineHeight: 1.2 }}>
            <span
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: now ? C.brand : done ? C.brand50 : 'transparent',
                border: `2.5px solid ${now || done ? C.brand : C.brand200}`,
                boxSizing: 'border-box',
              }}
            >
              {done && (
                <svg width="18" height="18" viewBox="0 0 14 14">
                  <path d="M2.5 7.5 L5.8 10.5 L11.5 3.8" fill="none" stroke={C.brand} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span style={{ fontWeight: now ? 700 : 500, color: now ? C.brand700 : done ? C.inkSoft : C.faint }}>{name}</span>
          </div>
        )
      })}
    </div>
  )
}

function Phone({ frame }: { frame: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: PHONE_LEFT,
        top: PHONE_TOP,
        width: PHONE_W,
        height: PHONE_H,
        borderRadius: 64,
        background: C.bezel,
        padding: BEZEL,
        boxShadow: '0 40px 80px rgba(36,48,43,0.22), 0 8px 20px rgba(36,48,43,0.12)',
      }}
    >
      <div style={{ position: 'relative', width: SCREEN_W, height: SCREEN_H, borderRadius: 50, overflow: 'hidden', background: C.surface }}>
        <StatusBar />
        <div style={{ position: 'absolute', top: STATUS_BAR * SCALE, left: 0, width: SCREEN_W, height: SCREEN.height * SCALE, overflow: 'hidden' }}>
          <ScreenContent frame={frame} />
          <NewTab frame={frame} />
        </div>
      </div>
    </div>
  )
}

// 記事をタップしたあとに開く、ブラウザの新しいタブ。下からせり上がる。
// 開いた先は他のサイトのページなので、中身は映さずに灰色の仮の行だけを置き、アドレス欄にドメインだけ出す
function NewTab({ frame }: { frame: number }) {
  const { fps } = useVideoConfig()
  const { from, host } = timeline.newTab
  if (frame < from) return null
  const p = spring({ frame: frame - from, fps, config: { damping: 200 }, durationInFrames: 18 })
  const bar = { background: '#e6e9e7', borderRadius: 6 }
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.surface, transform: `translateY(${(1 - p) * 100}%)`, boxShadow: '0 -10px 30px rgba(0,0,0,0.12)' }}>
      <div style={{ padding: '10px 16px 12px', background: '#f2f3f2', borderBottom: '1px solid #e1e4e2' }}>
        <div style={{ height: 40, borderRadius: 12, background: '#e3e6e4', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 17, color: C.ink, fontFamily: 'system-ui, sans-serif' }}>
          <svg width="12" height="14" viewBox="0 0 12 14">
            <rect x="1" y="6" width="10" height="7.5" rx="1.5" fill={C.inkSoft} />
            <path d="M3.3 6 V4.2 A2.7 2.7 0 0 1 8.7 4.2 V6" fill="none" stroke={C.inkSoft} strokeWidth="1.6" />
          </svg>
          {host}
        </div>
      </div>
      <div style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ ...bar, height: 26, width: '85%' }} />
        <div style={{ ...bar, height: 26, width: '60%' }} />
        <div style={{ ...bar, height: 180, marginTop: 14, borderRadius: 12 }} />
        {[92, 100, 96, 88, 100, 72].map((w, i) => (
          <div key={i} style={{ ...bar, height: 14, width: `${w}%`, marginTop: i === 0 ? 10 : 0 }} />
        ))}
      </div>
    </div>
  )
}

function StatusBar() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: STATUS_BAR * SCALE, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 34px', fontSize: 17, fontWeight: 700, fontFamily: 'system-ui, sans-serif' }}>
      <span>9:41</span>
      <div style={{ position: 'absolute', left: '50%', top: 10, width: 120, height: 34, marginLeft: -60, borderRadius: 17, background: '#000' }} />
      <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
          {[5, 8, 11, 14].map((h) => (
            <span key={h} style={{ width: 3.5, height: h, borderRadius: 1, background: C.ink }} />
          ))}
        </span>
        <span style={{ width: 26, height: 13, borderRadius: 4, border: `1.5px solid ${C.ink}`, padding: 1.5, boxSizing: 'border-box' }}>
          <span style={{ display: 'block', width: '80%', height: '100%', borderRadius: 2, background: C.ink }} />
        </span>
      </span>
    </div>
  )
}

// 今のフレームの画面。fade の画面は前の画面の上に重ねて、少しずつ出す
function ScreenContent({ frame }: { frame: number }) {
  const list = timeline.shots
  const i = Math.max(list.findLastIndex((s) => s.from <= frame), 0)
  const cur = list[i]
  const fadeIn = cur.fade ? interpolate(frame - cur.from, [0, 8], [0, 1], clamp) : 1
  return (
    <>
      {fadeIn < 1 && i > 0 && <ShotImage shot={list[i - 1]} frame={frame} />}
      <div style={{ position: 'absolute', inset: 0, opacity: fadeIn }}>
        <ShotImage shot={cur} frame={frame} />
      </div>
    </>
  )
}

// 結果画面のスクロール位置。キーの間は、後ろのキーの ease の動き方でつなぐ
const scrollAt = (shot: ScreenShot, frame: number) => {
  const keys = shot.scroll
  if (!keys) return shot.scrollY ?? 0
  return keyframes(keys, frame, (k) => k.y, (k) => EASES[k.ease])
}

function ShotImage({ shot, frame }: { shot: ScreenShot; frame: number }) {
  const isResult = shot.src.endsWith('result.png')
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.surface }}>
      <Img
        src={staticFile(shot.src)}
        style={{
          position: 'absolute',
          top: -scrollAt(shot, frame) * SCALE,
          left: 0,
          width: SCREEN_W,
          height: isResult ? timeline.resultHeight * SCALE : SCREEN.height * SCALE,
        }}
      />
    </div>
  )
}

// キーフレームの間をなめらかにつなぐ（キーの外は端の値で止める）。easeOf があれば、後ろのキーごとに動き方を変える
function keyframes<K extends { f: number }>(keys: K[], frame: number, pick: (k: K) => number, easeOf?: (k: K) => (t: number) => number) {
  if (frame <= keys[0].f) return pick(keys[0])
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1]
    const b = keys[i]
    if (frame <= b.f) {
      if (b.f === a.f) return pick(b)
      return interpolate(frame, [a.f, b.f], [pick(a), pick(b)], { easing: easeOf ? easeOf(b) : easeInOut })
    }
  }
  return pick(keys[keys.length - 1])
}

// ナレーションに合わせて、スマホ画面の上の部品を淡い緑の枠で囲む
function Highlights({ frame }: { frame: number }) {
  return (
    <>
      {timeline.highlights.map((h) => {
        const o = interpolate(frame, [h.from, h.from + 10, h.to - 10, h.to], [0, 1, 1, 0], clamp)
        if (o === 0) return null
        const a = toStage(h.rect.x, h.rect.y)
        const pad = 6
        return (
          <div
            key={h.from}
            style={{
              position: 'absolute',
              left: a.x - pad,
              top: a.y - pad,
              width: h.rect.w * SCALE + pad * 2,
              height: h.rect.h * SCALE + pad * 2,
              borderRadius: 16,
              border: `3px solid ${C.brand}`,
              boxShadow: `0 0 0 6px ${C.brand200}`,
              opacity: o * 0.9,
            }}
          />
        )
      })}
    </>
  )
}

// 飛び出した部品を置く場所（左の見出しの下）と、大きさの上限
const POPOUT_LEFT = 190
const POPOUT_TOP = 350
// 切り出すときに部品の周りに足す余白（CSS px）。枠のない部品でも文字が端に詰まらないように
const POPOUT_PAD = 14
const POPOUT_MAX_W = 800
const POPOUT_MAX_H = 680
// 出る・戻る動きのフレーム数
const POPOUT_MOVE = 20
// フォームの選択肢をその場で大きくするときの倍率
const IN_PLACE = 1.45

// そのとき出ている画面の画像
const shotAt = (frame: number) => timeline.shots.findLast((s) => s.from <= frame)?.src ?? timeline.shots[0].src
// 左へ飛び出した部品がどれだけ出ているか（0〜1）。出ている間は、左の質問の一覧を隠す
const popoutShown = (frame: number) =>
  Math.max(0, ...timeline.popouts.filter((o) => !o.inPlace).map((o) => interpolate(frame, [o.from, o.from + 8, o.to - 8, o.to], [0, 1, 1, 0], clamp)))

// スマホ画面の部品を、スマホの中の同じ位置から切り出して左へ飛び出させる。
// 切り出しは撮った画面の画像から行うので、スマホの中と同じ見た目のまま大きくなる
function Popouts({ frame, cam }: { frame: number; cam: Transform }) {
  const { fps } = useVideoConfig()
  return (
    <>
      {timeline.popouts.map((o) => {
        if (frame < o.from || frame > o.to) return null
        const r = { x: o.rect.x - POPOUT_PAD, y: o.rect.y - POPOUT_PAD, w: o.rect.w + POPOUT_PAD * 2, h: o.rect.h + POPOUT_PAD * 2 }
        // 出るときと同じ動きを逆にたどって、最後はスマホの中のもとの場所へ戻る（消すときにフェードしない）
        const out = spring({ frame: frame - (o.to - POPOUT_MOVE), fps, config: { damping: 200 }, durationInFrames: POPOUT_MOVE })
        const p = Math.min(spring({ frame: frame - o.from, fps, config: { damping: 200 }, durationInFrames: POPOUT_MOVE }), 1 - out)
        // 出発点：スマホの中でその部品が見えている位置（動画の座標）
        const from = toStage(r.x, r.y - o.scrollY)
        const fromK = SCALE * cam.s
        const fromX = from.x * cam.s + cam.tx
        const fromY = from.y * cam.s + cam.ty
        // その場で大きくするときは、もとの位置の真ん中を中心に IN_PLACE 倍にする
        const toK = o.inPlace ? fromK * IN_PLACE : Math.min(POPOUT_MAX_W / r.w, POPOUT_MAX_H / r.h)
        const toX = o.inPlace ? fromX - (r.w * (toK - fromK)) / 2 : POPOUT_LEFT
        const toY = o.inPlace ? fromY - (r.h * (toK - fromK)) / 2 : POPOUT_TOP
        const k = interpolate(p, [0, 1], [fromK, toK])
        const x = interpolate(p, [0, 1], [fromX, toX])
        const y = interpolate(p, [0, 1], [fromY, toY])
        return (
          <div
            key={o.from}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: r.w * k,
              height: r.h * k,
              overflow: 'hidden',
              borderRadius: 14,
              background: C.surface,
              boxShadow: `0 ${24 * p}px ${60 * p}px rgba(36,48,43,${0.18 * p})`,
            }}
          >
            <Img
              src={staticFile(o.src === 'result' ? 'shots/result.png' : shotAt(frame))}
              style={{
                position: 'absolute',
                left: -r.x * k,
                top: -r.y * k,
                width: SCREEN.width * k,
                height: (o.src === 'result' ? timeline.resultHeight : SCREEN.height) * k,
              }}
            />
          </div>
        )
      })}
    </>
  )
}

// 指の代わりの、半透明の白い丸（iPhone の画面収録で「タッチを表示」にしたときのような見た目）。
// 画面の一部として拡大・縮小する。白い画面の上でも見えるよう、薄い縁と影を付ける
const TOUCH = 46 * SCALE

function Touch({ frame }: { frame: number }) {
  const keys = timeline.cursor
  // ease の付いたキー（はじくときの引き上げ）は、ページと同じ動き方で動かす
  const easeOf = (k: (typeof keys)[number]) => (k.ease ? EASES[k.ease] : easeInOut)
  const p = toStage(keyframes(keys, frame, (k) => k.x, easeOf), keyframes(keys, frame, (k) => k.y, easeOf))
  // 最初に出てきたあとは、読んでいる間（touchOff）だけ消す
  const appear = Math.min(
    interpolate(frame, [keys[0].f, keys[0].f + 10], [0, 1], clamp),
    ...timeline.touchOff.map((o) => interpolate(frame, [o.from, o.from + 10, o.to, o.to + 8], [1, 0, 0, 1], clamp)),
  )
  if (appear === 0) return null
  const last = timeline.clicks.findLast((c) => c.f <= frame)
  const since = last ? frame - last.f : 99
  // 押した瞬間だけ少し縮んで濃くなる。指ではじいている間（触れて引いている間）も同じ
  const dragging = timeline.drags.some((d) => frame >= d.from - 2 && frame <= d.to)
  const press = dragging ? 0.86 : since < 8 ? interpolate(since, [0, 2, 8], [1, 0.82, 1]) : 1
  const solid = dragging ? 0.82 : since < 8 ? interpolate(since, [0, 2, 8], [0.62, 0.85, 0.62]) : 0.62
  return (
    <>
      {last && since < 18 && <Ripple at={toStage(last.x, last.y)} t={since / 18} />}
      <div
        style={{
          position: 'absolute',
          left: p.x - TOUCH / 2,
          top: p.y - TOUCH / 2,
          width: TOUCH,
          height: TOUCH,
          borderRadius: '50%',
          background: `rgba(255,255,255,${solid})`,
          border: '2px solid rgba(36,48,43,0.22)',
          boxShadow: '0 4px 14px rgba(36,48,43,0.28)',
          boxSizing: 'border-box',
          opacity: appear,
          transform: `scale(${press})`,
        }}
      />
    </>
  )
}

// タップした位置から広がる輪
function Ripple({ at, t }: { at: { x: number; y: number }; t: number }) {
  const size = interpolate(t, [0, 1], [TOUCH, TOUCH * 2.1], { easing: Easing.out(Easing.quad) })
  return (
    <div
      style={{
        position: 'absolute',
        left: at.x - size / 2,
        top: at.y - size / 2,
        width: size,
        height: size,
        borderRadius: '50%',
        border: '2px solid rgba(36,48,43,0.35)',
        background: 'rgba(255,255,255,0.25)',
        boxSizing: 'border-box',
        opacity: 1 - t,
      }}
    />
  )
}

function Outro() {
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <FadeUp delay={12}>
        <Logo size={96} />
      </FadeUp>
      <FadeUp delay={26} style={{ marginTop: 48, fontSize: 52, fontWeight: 700, color: C.brand700 }}>
        {CONCEPT}
      </FadeUp>
      <FadeUp delay={40} style={{ marginTop: 28, fontSize: 38, color: C.inkSoft }}>
        For you, when talking with someone close feels hard.
      </FadeUp>
    </AbsoluteFill>
  )
}
