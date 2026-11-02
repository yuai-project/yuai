// アドバイスのカードの「参考にした情報」（sources）のテスト（#156・#213）。
// sources は項目（avoid / tryReplies / askNext）ごとに持ち、安全の案内には電話番号を確かめたページを付ける。
//
//   npm test

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { ADVICE_CARDS } from '../src/data/adviceCards.ts'
import {
  MAX_SOURCES_PER_CARD,
  MAX_SOURCES_PER_SECTION,
  SOURCE_SECTIONS,
  cardSourceIds,
  invalidSourceIds,
  mergeSources,
  resolveSources,
  sourceSummary,
  supportLineSources,
} from '../src/data/adviceSources.ts'
import { mockArticles } from '../src/data/articles.ts'
import { buildAdviceRequest, initialIntake } from '../src/data/consultationIntake.ts'
import { buildAdvice, selectCardKey } from '../src/data/mockAdvice.ts'
import { isCandidateArticle, toRecommendationProfile } from '../src/data/recommendArticles.ts'
import {
  CONSUMER_SUPPORT_LINE,
  CRISIS_SUPPORT_LINE,
  SUPPORT_LINES,
} from '../src/data/supportLines.ts'

const byId = (id) => mockArticles.find((a) => a.id === id)
const requestOf = (intake = {}) => buildAdviceRequest({ ...initialIntake, ...intake })
const idsOf = (sources) => sources.map((s) => s.id)
// カードが持っている項目だけ（distance は askNext を持たない）
const sectionsOf = (card) => SOURCE_SECTIONS.filter((key) => card[key])

describe('項目ごとの sources（実データ）', () => {
  for (const [key, card] of Object.entries(ADVICE_CARDS)) {
    for (const section of sectionsOf(card)) {
      test(`${key}.${section}: 出典の ID がすべて存在し、status が approved で、書籍ではない`, () => {
        const ids = card[section].sources
        assert.ok(Array.isArray(ids), `${key}.${section}`)
        assert.ok(ids.length <= MAX_SOURCES_PER_SECTION, `${key}.${section}`)
        assert.equal(new Set(ids).size, ids.length, `${key}.${section}: 重複`)
        assert.deepEqual(invalidSourceIds(ids), [], `${key}.${section}`)
        for (const id of ids) {
          assert.ok(byId(id), `${key}.${section}: ${id} が存在しない`)
          assert.equal(byId(id).status, 'approved', `${key}.${section}: ${id}`)
          assert.notEqual(byId(id).sourceType, 'book', `${key}.${section}: ${id}`)
        }
      })
    }

    test(`${key}: カード全体でも、重複を除いて ${MAX_SOURCES_PER_CARD} 件まで`, () => {
      assert.ok(cardSourceIds(card).length <= MAX_SOURCES_PER_CARD, cardSourceIds(card).join(','))
    })
  }

  test('カード全体には sources を持たない（項目ごとに持つ）', () => {
    for (const [key, card] of Object.entries(ADVICE_CARDS)) assert.ok(!('sources' in card), key)
  })

  test('書籍（b01・b02）と、本文を取得できなかった r07 は、どの項目にも入っていない', () => {
    const all = Object.values(ADVICE_CARDS).flatMap(cardSourceIds)
    for (const id of ['b01', 'b02', 'r07']) assert.ok(!all.includes(id), id)
  })

  test('裏づけの見つかっていない項目は空（exhausted の避けたい対応）', () => {
    assert.deepEqual(ADVICE_CARDS.exhausted.avoid.sources, [])
  })
})

describe('invalidSourceIds', () => {
  const articles = [
    { id: 'ok', status: 'approved', sourceType: 'media', url: 'https://example.com/ok', title: 'OK' },
    { id: 'paused', status: 'paused', sourceType: 'media', url: 'https://example.com/p', title: 'P' },
    { id: 'book', status: 'approved', sourceType: 'book', url: 'https://example.com/b', title: 'B' },
  ]

  test('問題がなければ空', () => {
    assert.deepEqual(invalidSourceIds(['ok'], articles), [])
    assert.deepEqual(invalidSourceIds([], articles), [])
  })

  test('存在しない ID があると失敗する', () => {
    assert.deepEqual(invalidSourceIds(['ok', 'nope'], articles), [{ id: 'nope', reason: 'missing' }])
  })

  test('paused の記事があると失敗する', () => {
    assert.deepEqual(invalidSourceIds(['paused'], articles), [
      { id: 'paused', reason: 'not_approved' },
    ])
  })

  test('書籍があると失敗する', () => {
    assert.deepEqual(invalidSourceIds(['book'], articles), [{ id: 'book', reason: 'book' }])
  })

  test('実データの paused の記事（r10・r27・r29）を入れると失敗する', () => {
    for (const id of ['r10', 'r27', 'r29']) {
      assert.deepEqual(invalidSourceIds([id]), [{ id, reason: 'not_approved' }], id)
    }
  })
})

describe('resolveSources', () => {
  test('画面に出す形（タイトル・URL・ドメイン・ページの言語）にする。www. はドメインから外す', () => {
    assert.deepEqual(resolveSources(['r11']), [
      {
        id: 'r11',
        title: byId('r11').title,
        url: 'https://www.technologyreview.jp/s/254076/how-to-talk-to-vaccine-hesitant-people/',
        domain: 'technologyreview.jp',
        lang: 'ja',
      },
    ])
  })

  test('引用してはいけない ID は、画面に出す形からも外す（paused にした r08・r09 も。#244）', () => {
    assert.deepEqual(
      resolveSources(['r11', 'nope', 'r27', 'b01', 'r08', 'r09']).map((s) => s.id),
      ['r11'],
    )
  })
})

describe('アドバイスへの反映', () => {
  const INTAKE_OF = {
    default: { concerns: ['unsure_how_to_respond'] },
    angry: { concerns: ['angry_when_disagreed'] },
    exhausted: { concerns: ['self_exhausted'] },
    distance: { desiredRelationship: 'some_distance' },
  }

  for (const [key, intake] of Object.entries(INTAKE_OF)) {
    test(`${key}: 項目ごとの sources が、アドバイスの同じ項目に入る`, () => {
      const request = requestOf(intake)
      assert.equal(selectCardKey(request), key)
      const advice = buildAdvice(request)
      for (const section of sectionsOf(ADVICE_CARDS[key])) {
        assert.deepEqual(idsOf(advice[section].sources), ADVICE_CARDS[key][section].sources, section)
      }
    })

    test(`${key}: 最後の「このヒントの参考にした情報」は、項目ごとの sources を重複なしでまとめたもの`, () => {
      const request = requestOf(intake)
      assert.deepEqual(idsOf(buildAdvice(request).sources), cardSourceIds(ADVICE_CARDS[key]))
    })
  }

  test('askNext を持たないカードでは、askNext は null', () => {
    assert.equal(buildAdvice(requestOf(INTAKE_OF.distance)).askNext, null)
  })

  test('sources が空なら、アドバイスの sources も空（画面には何も出さない）', () => {
    assert.deepEqual(resolveSources([]), [])
    assert.deepEqual(mergeSources([[], []]), [])
  })
})

describe('項目のすぐ下のリンク（sourceSummary）', () => {
  const s = (id) => ({ id, title: id, url: `https://example.com/${id}`, domain: 'example.com' })

  test('出典が空の項目には、リンクが出ない', () => {
    assert.equal(sourceSummary([]), null)
    assert.equal(sourceSummary(undefined), null)
  })

  test('実データでも、出典が空の項目（exhausted の避けたい対応）にはリンクが出ない', () => {
    const advice = buildAdvice(requestOf({ concerns: ['self_exhausted'] }))
    assert.deepEqual(advice.avoid.sources, [])
    assert.equal(sourceSummary(advice.avoid.sources), null)
  })

  test('絞り込みで全部外れた項目にも、リンクが出ない（子ども ＋ 政治の default カード）', () => {
    const advice = buildAdvice(
      requestOf({ relationship: 'child', topics: ['politics_society'], concerns: ['unsure_how_to_respond'] }),
    )
    for (const section of ['avoid', 'tryReplies', 'askNext']) {
      assert.equal(sourceSummary(advice[section].sources), null, section)
    }
  })

  test('1件なら先頭の1件だけ、2件以上なら残りの件数（＋1 など）を添える', () => {
    assert.deepEqual(sourceSummary([s('a')]), { first: s('a'), rest: 0 })
    assert.deepEqual(sourceSummary([s('a'), s('b')]), { first: s('a'), rest: 1 })
    assert.deepEqual(sourceSummary([s('a'), s('b'), s('c')]), { first: s('a'), rest: 2 })
  })
})

describe('安全の案内の出典（電話番号を確かめたページ）', () => {
  const PAGE_OF = {
    c01: 'https://www.mhlw.go.jp/mamorouyokokoro/soudan/tel',
    c02: 'https://www.gov-online.go.jp/kurashinosodan/list/fu_caa.html',
  }

  test('どの窓口にも、確かめたページ（approved の記事）が付いている', () => {
    for (const line of [...SUPPORT_LINES, CRISIS_SUPPORT_LINE, CONSUMER_SUPPORT_LINE]) {
      assert.deepEqual(invalidSourceIds([line.sourceId]), [], line.id)
      assert.equal(byId(line.sourceId).url, PAGE_OF[line.sourceId], line.id)
    }
  })

  test('いつもは「まもろうよ こころ」のページだけ', () => {
    assert.deepEqual(idsOf(buildAdvice(requestOf()).safety.sources), ['c01'])
    assert.deepEqual(idsOf(buildAdvice(undefined).safety.sources), ['c01'])
  })

  test('消費者ホットラインを出すときは、政府広報オンラインのページも付く', () => {
    const advice = buildAdvice(requestOf({ concerns: ['money_worries'] }))
    assert.ok(advice.supportLines.includes(CONSUMER_SUPPORT_LINE))
    assert.deepEqual(idsOf(advice.safety.sources), ['c01', 'c02'])
  })

  test('同じページは1回だけ', () => {
    assert.deepEqual(idsOf(supportLineSources([...SUPPORT_LINES, CRISIS_SUPPORT_LINE])), ['c01'])
  })

  test('関係を選んでも外れない（番号の確かめ先なので絞り込まない）', () => {
    for (const relationship of ['father', 'mother', 'partner', 'child']) {
      assert.deepEqual(idsOf(buildAdvice(requestOf({ relationship })).safety.sources), ['c01'])
    }
  })

  test('最後の「このヒントの参考にした情報」には、番号の確かめ先は入れない', () => {
    const ids = idsOf(buildAdvice(requestOf({ concerns: ['money_worries'] })).sources)
    assert.ok(!ids.includes('c01') && !ids.includes('c02'), ids.join(','))
  })
})

describe('その人に合わない記事は、出典から外す（推薦と同じ入口の絞り込み）', () => {
  const sourcesOf = (intake) => idsOf(buildAdvice(requestOf(intake)).sources)
  // 項目ごとの出典を、項目の名前つきで
  const sectionSourcesOf = (intake) => {
    const advice = buildAdvice(requestOf(intake))
    return SOURCE_SECTIONS.flatMap((key) => (advice[key]?.sources ?? []).map((s) => `${key}:${s.id}`))
  }

  test('パートナーを選ぶと、r09（父についての記事）と r08（親についての記事）が、どの項目にも出ない', () => {
    for (const intake of [
      { relationship: 'partner', concerns: ['angry_when_disagreed'] },
      { relationship: 'partner', concerns: ['unsure_how_to_respond'] },
      { relationship: 'partner', concerns: ['self_exhausted'] },
      { relationship: 'partner', desiredRelationship: 'some_distance' },
      { relationship: 'partner', topics: ['health'], concerns: ['angry_when_disagreed'] },
      { relationship: 'partner', topics: ['health'], concerns: ['self_exhausted'] },
    ]) {
      for (const entry of sectionSourcesOf(intake)) {
        assert.ok(!/:r0[89]$/.test(entry), `${JSON.stringify(intake)} → ${entry}`)
      }
    }
  })

  test('パートナーを選ぶと、最後の一覧にも r09・r08 が出ない', () => {
    for (const intake of [
      { relationship: 'partner', concerns: ['angry_when_disagreed'] },
      { relationship: 'partner', concerns: ['unsure_how_to_respond'] },
      { relationship: 'partner', concerns: ['self_exhausted'] },
      { relationship: 'partner', desiredRelationship: 'some_distance' },
      { relationship: 'partner', topics: ['health'], concerns: ['angry_when_disagreed'] },
    ]) {
      const ids = sourcesOf(intake)
      assert.ok(!ids.includes('r09'), JSON.stringify(intake))
      assert.ok(!ids.includes('r08'), JSON.stringify(intake))
    }
  })

  test('関係が合う記事は出る（母 ＋ 健康なら、r20 が返し方の項目に出る）', () => {
    const intake = { relationship: 'mother', topics: ['health'], concerns: ['angry_when_disagreed'] }
    assert.ok(sourcesOf(intake).includes('r20'))
    assert.ok(sectionSourcesOf(intake).includes('tryReplies:r20'), sectionSourcesOf(intake).join(','))
  })

  test('関係が合わない記事は外す（父を選ぶと、母・パートナーの記事の r20 は出ない）', () => {
    const intake = { relationship: 'father', topics: ['health'], concerns: ['angry_when_disagreed'] }
    assert.ok(!sourcesOf(intake).includes('r20'), sourcesOf(intake).join(','))
  })

  test('話題が合わない記事も外す（政治を選ぶと、健康の話題の r20 は母でも出ない）', () => {
    const ids = sourcesOf({
      relationship: 'mother',
      topics: ['politics_society'],
      concerns: ['angry_when_disagreed'],
    })
    assert.ok(!ids.includes('r20'), ids.join(','))
  })

  test('全部外れたら空になる（子ども ＋ 政治の default カード）', () => {
    const request = requestOf({
      relationship: 'child',
      topics: ['politics_society'],
      concerns: ['unsure_how_to_respond'],
    })
    assert.equal(selectCardKey(request), 'default')
    assert.deepEqual(buildAdvice(request).sources, [])
    assert.deepEqual(sectionSourcesOf({
      relationship: 'child',
      topics: ['politics_society'],
      concerns: ['unsure_how_to_respond'],
    }), [])
  })

  test('request が無い（直接開いた）ときは絞らない', () => {
    const advice = buildAdvice(undefined)
    assert.deepEqual(idsOf(advice.sources), cardSourceIds(ADVICE_CARDS.default))
    for (const section of SOURCE_SECTIONS) {
      assert.deepEqual(idsOf(advice[section].sources), ADVICE_CARDS.default[section].sources, section)
    }
  })

  test('推薦と同じ関数で絞っている（推薦で外れる記事は、出典でも外れる）', () => {
    const request = requestOf({ relationship: 'partner', topics: ['politics_society'] })
    const profile = toRecommendationProfile(request)
    for (const id of ['r08', 'r09', 'r11', 'r12', 'r20', 'r25']) {
      const shown = resolveSources([id], { request }).length === 1
      assert.equal(shown, isCandidateArticle(byId(id), profile), id)
    }
  })
})
