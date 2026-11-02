// タップ音（「カチ」）を合成して public/click.wav に書き出す。外部の音源は使わない
// 高い音のごく短い立ち上がりを2つ重ね、スイッチを押したような硬い音にする
import { RATE, noise, writeWav } from './lib/wav.mjs'

const out = new Float32Array(Math.round(RATE * 0.04))
const rand = noise(7)
const tick = (start, gain) => {
  for (let i = Math.round(start * RATE); i < out.length; i++) {
    const t = i / RATE - start
    const body = Math.sin(2 * Math.PI * 4200 * t) * Math.exp(-t * 700)
    const snap = rand() * Math.exp(-t * 1800)
    out[i] += (body * 0.6 + snap * 0.5) * gain
  }
}
tick(0, 0.9) // カ
tick(0.009, 0.45) // チ
await writeWav(new URL('../public/click.wav', import.meta.url), out)
console.log('wrote public/click.wav')
