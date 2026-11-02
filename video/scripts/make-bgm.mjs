// BGM を合成して public/bgm.wav に書き出す。外部の音源は使わない
// やわらかいパッドと、ベル風の分散和音。80bpm、Fmaj7 → Em7 → Dm7 → Cmaj7 をくり返す
// 市販・フリーの曲に差し替えるときは、public/ に置いて src/YoridoIntro.tsx の BGM を変える
import { RATE, writeWav } from './lib/wav.mjs'

const LENGTH = 51 // 動画（50秒）より少し長く
const BEAT = 60 / 80
const BAR = BEAT * 4
const CHORDS = [
  [53, 57, 60, 64], // Fmaj7
  [52, 55, 59, 62], // Em7
  [50, 53, 57, 60], // Dm7
  [48, 52, 55, 59], // Cmaj7
]
// 分散和音の並び（和音の何番目の音か。-1 は休み）
const ARP = [0, 2, 1, 3, 2, -1, 1, 2]

const hz = (midi) => 440 * 2 ** ((midi - 69) / 12)
const out = new Float32Array(LENGTH * RATE)
const add = (start, dur, fn) => {
  const s = Math.max(0, Math.round(start * RATE))
  const e = Math.min(out.length, Math.round((start + dur) * RATE))
  for (let i = s; i < e; i++) out[i] += fn(i / RATE - start)
}

for (let bar = 0; bar * BAR < LENGTH; bar++) {
  const chord = CHORDS[bar % CHORDS.length]
  const start = bar * BAR
  // パッド：ゆっくり立ち上がり、次の和音と少し重ねる
  for (const n of chord) {
    const f = hz(n)
    add(start, BAR + 0.8, (t) => {
      const env = Math.min(1, t / 0.9) * Math.min(1, (BAR + 0.8 - t) / 0.9)
      return (Math.sin(2 * Math.PI * f * t) + 0.5 * Math.sin(2 * Math.PI * f * 1.003 * t)) * env * 0.045
    })
  }
  // ベース
  const bass = hz(chord[0] - 12)
  add(start, BAR, (t) => Math.sin(2 * Math.PI * bass * t) * Math.min(1, t / 0.05) * Math.exp(-t * 0.6) * 0.12)
  // ベル風の分散和音（1オクターブ上、8分音符）。最初の2小節は入れず、少しずつ始める
  if (bar < 2) continue
  ARP.forEach((k, j) => {
    if (k < 0) return
    const f = hz(chord[k] + 12)
    const vel = j % 2 === 0 ? 0.11 : 0.07
    add(start + (j * BEAT) / 2, 2.5, (t) => {
      const env = Math.min(1, t / 0.004) * Math.exp(-t * 3.2)
      return (Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(2 * Math.PI * f * 2 * t) + 0.08 * Math.sin(2 * Math.PI * f * 3 * t)) * env * vel
    })
  })
}

// 少しだけ響き（ディレイ）を足す
const delay = Math.round(BEAT * 0.75 * RATE)
for (let i = delay; i < out.length; i++) out[i] += out[i - delay] * 0.28

// 頭と終わりをフェード、音量をそろえる
let peak = 0
for (const v of out) peak = Math.max(peak, Math.abs(v))
for (let i = 0; i < out.length; i++) {
  const t = i / RATE
  const fade = Math.min(1, t / 1.5) * Math.min(1, (LENGTH - 1 - t) / 3)
  out[i] = (out[i] / peak) * 0.8 * Math.max(0, fade)
}
await writeWav(new URL('../public/bgm.wav', import.meta.url), out)
console.log('wrote public/bgm.wav')
