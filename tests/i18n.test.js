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

  test('一覧の項目の数が同じ（よくある質問・ご利用にあたって・プライバシーポリシーなどの約束を、日英で揃える）', () => {
    // 文節（改行してよい位置）で区切った配列は、言語ごとに区切り方が違ってよい
    const PHRASES = /^(app\.catchcopy|app\.taglinePhrases|infoPages\.|immersion\.(low|high)|supportPage\.introPhrases)/
    for (const key of Object.keys(ja)) {
      if (!Array.isArray(ja[key]) || PHRASES.test(key)) continue
      assert.equal(en[key].length, ja[key].length, key)
      if (typeof ja[key][0] === 'object') {
        ja[key].forEach((item, i) => assert.deepEqual(Object.keys(en[key][i]), Object.keys(item), `${key}[${i}]`))
      }
    }
  })

  test('「Japanese only」の注記はもう無い（フッターのページも英語になった。#221）', () => {
    assert.ok(!('infoPages.japaneseOnly' in ja))
    assert.ok(!('infoPages.japaneseOnly' in en))
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

  test('一覧の中の {name} も埋める（よくある質問・プライバシーポリシー）', () => {
    const faq = translate('en', 'faq.items')
    assert.equal(faq[2].a.includes('{name}'), false)
    assert.ok(faq[2].a.startsWith('Yorido never contacts'))
    assert.ok(translate('ja', 'privacy.analyticsItems').includes('どこから Yorido に来たか'))
    // 辞書そのものは書き換えない
    assert.ok(ja['faq.items'][2].a.includes('{name}'))
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
  const KEY = /['"]((?:app|common|pageTitle|siteHeader|footer|language|infoPages|home|share|consult|steps|immersion|result|sources|articles|desiredSupport|intakeSummary|supportLines|lateNight|faq|terms|privacy|about|supportPage|infoPage)\.[\w.]+)['"]/g

  test('src/ の中のキーがすべて ja にある', () => {
    const used = new Set()
    for (const file of files('src')) {
      if (file.includes(join('src', 'i18n'))) continue
      for (const [, key] of readFileSync(file, 'utf8').matchAll(KEY)) used.add(key)
    }
    assert.ok(used.size > 50, `見つかったキーが少なすぎる: ${used.size}`)
    for (const key of used) assert.ok(key in ja, key)
  })

  test('画面（pages/）と components/ に、日本語の文字列が直接書かれていない', () => {
    // フッターのページ（#221）も含めて、src/pages と src/components のすべて
    const targets = [...files(join('src', 'components')), ...files(join('src', 'pages'))]
    for (const file of targets) {
      const code = readFileSync(file, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '') // ブロックコメント（JSX の {/* */} も）
        .replace(/\/\/.*$/gm, '') // 行コメント
      assert.doesNotMatch(code, /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}「」]/u, file)
    }
  })
})

describe('プライバシーポリシーと実装が一致している（#222）', () => {
  const files = (dir) =>
    readdirSync(dir).flatMap((name) => {
      const path = join(dir, name)
      return statSync(path).isDirectory() ? files(path) : /\.(jsx?|tsx?)$/.test(name) ? [path] : []
    })

  test('端末に保存するのは言語の設定だけ（localStorage などを使うのは src/i18n の2つのファイルだけ）', () => {
    const STORAGE = /localStorage|sessionStorage|indexedDB|document\.cookie|\.setItem\(/
    // コメント（説明として名前を書いている）は除く
    const code = (f) => readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
    const users = files('src').filter((f) => STORAGE.test(code(f)))
    assert.deepEqual(users.sort(), [join('src', 'i18n', 'I18nProvider.tsx'), join('src', 'i18n', 'language.ts')])
    assert.equal(STORAGE_KEY, 'yorido.lang')
  })

  test('ポリシーに、言語の設定だけを保存し送信しないことが日英で書いてある', () => {
    assert.match(ja['privacy.inputBody3'], /言語の設定.*だけ.*保存.*送信しません/)
    assert.match(en['privacy.inputBody3'], /only thing we save.*language setting.*not sent/)
    // 入力内容を保存しないという約束はそのまま
    assert.match(ja['privacy.inputBody1'], /保存も、外部への送信もしません/)
    assert.match(en['privacy.inputBody1'], /neither saved nor sent/)
  })
})
