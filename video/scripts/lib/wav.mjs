// モノラル 16bit の WAV を書き出す（samples は -1〜1 の Float32Array）
import { writeFile } from 'node:fs/promises'

export const RATE = 44100

export async function writeWav(url, samples) {
  const data = Buffer.alloc(samples.length * 2)
  for (let i = 0; i < samples.length; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]))
    data.writeInt16LE(Math.round(v * 32767), i * 2)
  }
  const header = Buffer.alloc(44)
  header.write('RIFF', 0)
  header.writeUInt32LE(36 + data.length, 4)
  header.write('WAVEfmt ', 8)
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20) // PCM
  header.writeUInt16LE(1, 22) // mono
  header.writeUInt32LE(RATE, 24)
  header.writeUInt32LE(RATE * 2, 28)
  header.writeUInt16LE(2, 32)
  header.writeUInt16LE(16, 34)
  header.write('data', 36)
  header.writeUInt32LE(data.length, 40)
  await writeFile(url, Buffer.concat([header, data]))
}

// 毎回同じ音になるよう、乱数は種を固定する
export function noise(seed = 1) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return (s / 2 ** 32) * 2 - 1
  }
}
