// 検証スクリプト（scripts/validate-articles.mjs）の、健康の記事の決まりのテスト（#145）。
// 医療・健康の情報そのものを扱う記事（medicalInfo: true）だけ、発信元を限る。
//
//   npm test

import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, describe, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { mockArticles } from '../src/data/articles.js'

const script = fileURLToPath(new URL('../scripts/validate-articles.mjs', import.meta.url))
const dir = mkdtempSync(join(tmpdir(), 'yorido-validate-'))
after(() => rmSync(dir, { recursive: true, force: true }))

let n = 0
// 実データに1件足したファイルを検証する（フォールバックの記事が要るので、実データを土台にする）
function validateWith(extra) {
  const file = join(dir, `articles-${n++}.json`)
  writeFileSync(file, JSON.stringify([...mockArticles, extra]))
  const result = spawnSync(process.execPath, [script, file], { encoding: 'utf8' })
  return { ok: result.status === 0, output: result.stdout + result.stderr }
}

const base = {
  id: 't-health',
  url: 'https://example.com/validate-test',
  title: 'テスト用の記事',
  publisher: 'テスト',
  summary: 'テスト用の記事です。',
  relationships: ['any'],
  topics: ['health'],
  concerns: ['any'],
  supportTypes: ['experience'],
  stance: 'neutral',
  burden: 'light',
  sourceType: 'media',
  status: 'approved',
  reviewedAt: '2026-10-13',
}

describe('validate-articles: 健康の記事の発信元', () => {
  test('実データが検証を通る', () => {
    const file = fileURLToPath(new URL('../src/data/articles.json', import.meta.url))
    const result = spawnSync(process.execPath, [script, file], { encoding: 'utf8' })
    assert.equal(result.status, 0, result.stdout + result.stderr)
  })

  test('topics に health があっても、medicalInfo がなければ報道機関の記事を入れられる', () => {
    assert.equal(validateWith(base).ok, true)
    assert.equal(validateWith({ ...base, medicalInfo: false }).ok, true)
  })

  test('medicalInfo: true の記事は、許可外の発信元だと検証に落ちる', () => {
    for (const sourceType of ['media', 'support_org']) {
      const result = validateWith({ ...base, medicalInfo: true, sourceType })
      assert.equal(result.ok, false, sourceType)
      assert.match(result.output, /medicalInfo が true の記事の sourceType/)
    }
  })

  test('medicalInfo: true でも、許可された発信元なら通る', () => {
    for (const sourceType of ['public_agency', 'academic', 'professional']) {
      assert.equal(validateWith({ ...base, medicalInfo: true, sourceType }).ok, true, sourceType)
    }
  })

  test('topics が health でなくても、medicalInfo: true なら発信元を限る', () => {
    const result = validateWith({ ...base, topics: ['any'], medicalInfo: true })
    assert.equal(result.ok, false)
  })

  test('medicalInfo は true / false だけ', () => {
    for (const medicalInfo of ['true', 1, null]) {
      const result = validateWith({ ...base, medicalInfo })
      assert.equal(result.ok, false, JSON.stringify(medicalInfo))
      assert.match(result.output, /true \/ false ではない/)
    }
  })
})
