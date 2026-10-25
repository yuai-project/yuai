// 多言語対応のしくみのテスト（#215）。
//
//   npm test

import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, test } from 'node:test'
import { en } from '../src/i18n/en.ts'
import { ja } from '../src/i18n/ja.ts'
import {
  STORAGE_KEY,
  detectLanguage,
  fill,
  joinPhrases,
  langFromNavigator,
  readStoredLang,
  writeStoredLang,
} from '../src/i18n/language.ts'
import { translate } from '../src/i18n/translate.ts'

describe('言語の決め方（URL ＞ 前回選んだ言語 ＞ ブラウザの言語）', () => {
  test('URL の ?lang= がいちばん強い', () => {
    assert.equal(detectLanguage({ search: '?lang=en', stored: 'ja', navigatorLanguages: ['ja'] }), 'en')
    assert.equal(detectLanguage({ search: '?lang=ja', stored: 'en', navigatorLanguages: ['en'] }), 'ja')
  })

  test('URL に無ければ、前回選んだ言語', () => {
    assert.equal(detectLanguage({ search: '', stored: 'en', navigatorLanguages: ['ja'] }), 'en')
  })

  test('どちらも無ければ、ブラウザの言語', () => {
    assert.equal(detectLanguage({ navigatorLanguages: ['en-US', 'ja'] }), 'en')
    assert.equal(detectLanguage({ navigatorLanguages: ['ja-JP', 'en'] }), 'ja')
  })

  test('知らない言語は飛ばし、何も当てはまらなければ日本語', () => {
    assert.equal(detectLanguage({ search: '?lang=fr', stored: 'de', navigatorLanguages: ['fr', 'en'] }), 'en')
    assert.equal(detectLanguage({ navigatorLanguages: ['fr', 'ko'] }), 'ja')
    assert.equal(detectLanguage(), 'ja')
  })

  test('ブラウザの言語は大文字・小文字と地域を問わない', () => {
    assert.equal(langFromNavigator(['EN-gb']), 'en')
    assert.equal(langFromNavigator([]), null)
  })
})

describe('localStorage（読み書きできない環境でも落ちない）', () => {
  const throwing = {
    getItem() {
      throw new Error('blocked')
    },
    setItem() {
      throw new Error('blocked')
    },
  }

  test('読めないときは null、書けないときは何もしない', () => {
    assert.equal(readStoredLang(throwing), null)
    assert.doesNotThrow(() => writeStoredLang(throwing, 'en'))
    assert.equal(readStoredLang(undefined), null)
    assert.doesNotThrow(() => writeStoredLang(undefined, 'en'))
  })

  test('書いた言語を読み戻せる', () => {
    const map = new Map()
    const storage = { getItem: (k) => map.get(k) ?? null, setItem: (k, v) => map.set(k, v) }
    writeStoredLang(storage, 'en')
    assert.equal(map.get(STORAGE_KEY), 'en')
    assert.equal(readStoredLang(storage), 'en')
  })
})

describe('辞書（ja と en）', () => {
  const shapeOf = (v) =>
    typeof v === 'string' ? 'string' : Array.isArray(v[0]) ? 'phrases[][]' : 'string[]'
  const varsOf = (v) =>
    [...new Set(JSON.stringify(v).match(/\{\w+\}/g) ?? [])].sort()

  test('キーが同じ（en に足りないキーも、余分なキーもない）', () => {
    assert.deepEqual(Object.keys(en).sort(), Object.keys(ja).sort())
  })

  test('値の形（文字列・配列・文節の配列の配列）が同じ', () => {
    for (const key of Object.keys(ja)) assert.equal(shapeOf(en[key]), shapeOf(ja[key]), key)
  })

  test('差し込み（{name} など）の名前が同じ', () => {
    for (const key of Object.keys(ja)) assert.deepEqual(varsOf(en[key]), varsOf(ja[key]), key)
  })

  test('空の文言がない（英語の画面だけで出す注記を除く）', () => {
    for (const [lang, dict] of Object.entries({ ja, en })) {
      for (const [key, value] of Object.entries(dict)) {
        assert.ok(JSON.stringify(value).replace(/["[\],\s]/g, '').length > 0, `${lang}: ${key}`)
      }
    }
  })

  test('英語の文言に日本語が混ざっていない（言語の切り替えで「日本語」と出す部分を除く）', () => {
    const allowed = new Set(['language.switchTo', 'language.switchLabel'])
    for (const [key, value] of Object.entries(en)) {
      if (allowed.has(key)) continue
      assert.doesNotMatch(JSON.stringify(value), /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u, key)
    }
  })

  test('英語でも人にラベルを貼らない（CLAUDE.md ルール2）', () => {
    const LABELS = /conspiracy theorist|conspiracist|believers?\b|truther|anti-?vaxxer|brainwash|cult member|delusional/i
    for (const [key, value] of Object.entries(en)) assert.doesNotMatch(JSON.stringify(value), LABELS, key)
  })

  test('英語でも変えられると約束しない・断定しない（CLAUDE.md ルール1・3）', () => {
    const PROMISES = /\b(will definitely|guarantee[sd]?|always works|for sure|is suffering from)\b/i
    for (const [key, value] of Object.entries(en)) assert.doesNotMatch(JSON.stringify(value), PROMISES, key)
  })
})

describe('translate', () => {
  test('{name} にはサービス名が入る', () => {
    assert.equal(translate('en', 'app.title'), "Yorido | So you don't have to carry this alone")
    assert.equal(translate('ja', 'app.title'), 'Yorido | ひとりで抱え込まないために')
  })

  test('差し込みを埋める。知らない名前はそのまま残す', () => {
    assert.equal(translate('en', 'supportLines.callLabel', { line: 'A', tel: '1' }), 'Call A at 1')
    assert.equal(fill('{a} {b}', { a: 1 }), '1 {b}')
  })

  test('配列はそのまま返す', () => {
    assert.deepEqual(translate('ja', 'app.catchcopy'), ja['app.catchcopy'])
  })

  test('文節をつなぐ: 日本語は詰め、英語は空白', () => {
    assert.equal(joinPhrases('ja', ja['app.taglinePhrases']), 'あなたに合うヒントと、相談先を。')
    assert.equal(
      joinPhrases('en', en['app.taglinePhrases']),
      'Tips that fit your situation, and places to turn for support.',
    )
  })
})

describe('画面のコードで使っているキーが、辞書にある', () => {
  const files = (dir) =>
    readdirSync(dir).flatMap((name) => {
      const path = join(dir, name)
      return statSync(path).isDirectory() ? files(path) : /\.(jsx?|tsx?)$/.test(name) ? [path] : []
    })
  // t('key') / t("key") / t(cond ? 'a' : 'b') / key: 'infoPages.faq' の形で書かれたキー
  const KEY = /['"]((?:app|common|pageTitle|siteHeader|footer|language|infoPages|home|share|consult|steps|immersion|result|sources|articles|desiredSupport|intakeSummary|supportLines)\.[\w.]+)['"]/g

  test('src/ の中のキーがすべて ja にある', () => {
    const used = new Set()
    for (const file of files('src')) {
      if (file.includes(join('src', 'i18n'))) continue
      for (const [, key] of readFileSync(file, 'utf8').matchAll(KEY)) used.add(key)
    }
    assert.ok(used.size > 50, `見つかったキーが少なすぎる: ${used.size}`)
    for (const key of used) assert.ok(key in ja, key)
  })

  test('main の流れの画面と components/ に、日本語の文字列が直接書かれていない', () => {
    const targets = [
      ...files(join('src', 'components')),
      join('src', 'pages', 'Home.jsx'),
      join('src', 'pages', 'Consultation.jsx'),
      join('src', 'pages', 'AdviceResult.jsx'),
    ]
    for (const file of targets) {
      const code = readFileSync(file, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '') // ブロックコメント（JSX の {/* */} も）
        .replace(/\/\/.*$/gm, '') // 行コメント
      assert.doesNotMatch(code, /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}「」]/u, file)
    }
  })
})
