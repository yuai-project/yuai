// 「フォーム回答→どのアドバイスが出るか」のテスト。
// カードの文章は下書きで、チーム・専門家の確認前。ここでは選び方と形だけを確かめる。
//
//   npm test

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { ADVICE_CARDS, FOR_YOU, SAFETY } from '../src/data/adviceCards.ts'
import { FOR_YOU_EN } from '../src/data/adviceCards.en.ts'
import {
  CONCERNS,
  DESIRED_RELATIONSHIP,
  RELATIONSHIPS,
  buildAdviceRequest,
  initialIntake,
} from '../src/data/consultationIntake.ts'
import { buildAdvice, selectCardKey } from '../src/data/mockAdvice.ts'

// フォームの入力状態から、実際に送られるリクエストを作る
const requestOf = (intake = {}) => buildAdviceRequest({ ...initialIntake, ...intake })
const adviceOf = (intake) => buildAdvice(requestOf(intake))

// 4つのカードがそれぞれ選ばれる、いちばん素直な回答
const INTAKE_OF = {
  default: { concerns: ['unsure_how_to_respond'], desiredRelationship: 'improve' },
  angry: { concerns: ['angry_when_disagreed'] },
  exhausted: { concerns: ['self_exhausted'] },
  distance: { desiredRelationship: 'some_distance' },
}
const CARD_KEYS = Object.keys(INTAKE_OF)

describe('カードの選び方', () => {
  for (const key of CARD_KEYS) {
    test(`${key} のカードが選ばれる`, () => {
      const advice = adviceOf(INTAKE_OF[key])
      assert.equal(selectCardKey(requestOf(INTAKE_OF[key])), key)
      assert.deepEqual(advice.avoid.items, ADVICE_CARDS[key].avoid.items)
      assert.deepEqual(advice.tryReplies.items, ADVICE_CARDS[key].tryReplies.items)
    })
  }

  test('「かなり距離を置きたい」でも distance', () => {
    assert.equal(selectCardKey(requestOf({ desiredRelationship: 'more_distance' })), 'distance')
  })

  test('何も答えていなくても default', () => {
    assert.equal(selectCardKey(requestOf()), 'default')
    assert.equal(selectCardKey(undefined), 'default')
  })

  test('距離を置きたい・疲れている・怒ってしまう以外の回答はすべて default', () => {
    const concerns = CONCERNS.map((c) => c.value).filter(
      (v) => v !== 'self_exhausted' && v !== 'angry_when_disagreed',
    )
    for (const desiredRelationship of ['keep', 'improve', 'unsure', null]) {
      assert.equal(selectCardKey(requestOf({ concerns, desiredRelationship })), 'default')
    }
  })
})

describe('判定の優先順位', () => {
  const all = ['angry_when_disagreed', 'self_exhausted']

  test('distance > exhausted > angry', () => {
    assert.equal(
      selectCardKey(requestOf({ concerns: all, desiredRelationship: 'more_distance' })),
      'distance',
    )
    assert.equal(
      selectCardKey(requestOf({ concerns: all, desiredRelationship: 'improve' })),
      'exhausted',
    )
    assert.equal(
      selectCardKey(
        requestOf({ concerns: ['angry_when_disagreed'], desiredRelationship: 'improve' }),
      ),
      'angry',
    )
  })

  test('困りごとを選んだ順番は結果に影響しない', () => {
    assert.equal(selectCardKey(requestOf({ concerns: [...all].reverse() })), 'exhausted')
  })
})

describe('forYou', () => {
  // 画面の 1. には、要点用の一文（keyPoint）を除いた title / body だけを出す
  const sectionOf = ({ keyPoint: _keyPoint, ...section }) => section

  test('距離を置きたい場合は distance 用（疲れていても）', () => {
    assert.deepEqual(adviceOf(INTAKE_OF.distance).forYou, sectionOf(FOR_YOU.distance))
    assert.deepEqual(
      adviceOf({ concerns: ['self_exhausted'], desiredRelationship: 'some_distance' }).forYou,
      sectionOf(FOR_YOU.distance),
    )
  })

  test('「自分自身が疲れている」があれば exhausted 用', () => {
    assert.deepEqual(adviceOf(INTAKE_OF.exhausted).forYou, sectionOf(FOR_YOU.exhausted))
  })

  test('それ以外（angry を含む）は default 用', () => {
    assert.deepEqual(adviceOf(INTAKE_OF.angry).forYou, sectionOf(FOR_YOU.default))
    assert.deepEqual(adviceOf(INTAKE_OF.default).forYou, sectionOf(FOR_YOU.default))
  })

  test('6つの枠の forYou には keyPoint を出さない', () => {
    for (const key of CARD_KEYS) assert.ok(!('keyPoint' in adviceOf(INTAKE_OF[key]).forYou), key)
  })
})

describe('keyPoints（まずは、この3つだけ。#226）', () => {
  // 読点・空白・大文字小文字の違いは見ない
  const normalize = (text) => text.replace(/[、,\s]/g, '').toLowerCase()

  test('要点の一文は、どれも 1. の本文から抜き出したもの（日本語・英語）', () => {
    for (const cards of [FOR_YOU, FOR_YOU_EN]) {
      for (const [key, { body, keyPoint }] of Object.entries(cards)) {
        assert.ok(keyPoint, key)
        assert.ok(normalize(body).includes(normalize(keyPoint)), `${key}: ${keyPoint}`)
      }
    }
  })

  for (const key of CARD_KEYS) {
    test(`${key}: 3つがそろい、それぞれ 1. の一文・返し方の1つ目・電話窓口の1つ目`, () => {
      for (const lang of ['ja', 'en']) {
        const advice = buildAdvice(requestOf(INTAKE_OF[key]), lang)
        const cards = lang === 'en' ? FOR_YOU_EN : FOR_YOU
        const [line] = advice.supportLines
        assert.equal(advice.keyPoints.forYou, (cards[key] ?? cards.default).keyPoint)
        assert.equal(advice.keyPoints.reply, advice.tryReplies.items[0])
        assert.equal(advice.keyPoints.supportLine.id, line.id)
        assert.equal(advice.keyPoints.supportLine.tel, line.tel)
        assert.equal(advice.keyPoints.supportLine.name, lang === 'en' ? line.en.name : line.name)
      }
    })
  }

  test('「疲れている」「距離を置きたい」では、1つ目がそれぞれに合った一文になる', () => {
    assert.equal(adviceOf(INTAKE_OF.default).keyPoints.forYou, '相手の考えを変える責任を、あなた一人で背負う必要はありません。')
    assert.equal(adviceOf(INTAKE_OF.exhausted).keyPoints.forYou, 'まずは、あなたが休むことを優先して大丈夫です。')
    assert.equal(adviceOf(INTAKE_OF.distance).keyPoints.forYou, '自分を守るための距離は、相手を見捨てることとは違います。')
  })

  test('結果画面を直接開いたとき（回答なし）も出す', () => {
    assert.ok(buildAdvice(undefined).keyPoints)
  })

  test('詳しい内容に危険を示す言葉があるときは出さない（null）', () => {
    const advice = adviceOf({ freeText: '毎日怒鳴られて、殴られることもあります。' })
    assert.equal(advice.safetyFirst, true)
    assert.equal(advice.keyPoints, null)
    assert.equal(buildAdvice(requestOf({ freeText: 'He hits me and I feel threatened.' }), 'en').keyPoints, null)
  })
})

describe('アドバイスの形', () => {
  const SHAPE = [
    'forYou',
    'whatMayBeHappening',
    'avoid',
    'tryReplies',
    'askNext',
    'safety',
  ]

  for (const key of CARD_KEYS) {
    const advice = adviceOf(INTAKE_OF[key])

    test(`${key}: 6つの枠のキーがそろっている`, () => {
      for (const k of SHAPE) assert.ok(k in advice, k)
    })

    test(`${key}: whatMayBeHappening は null`, () => {
      assert.equal(advice.whatMayBeHappening, null)
    })

    test(`${key}: safety が必ずある`, () => {
      // 文章は SAFETY のまま。sources（電話番号を確かめたページ）だけを足す（#213）
      const { sources: _sources, ...text } = advice.safety
      assert.deepEqual(text, SAFETY)
      assert.ok(advice.safety.title && advice.safety.body)
      assert.ok(advice.safety.signs.length > 0)
    })

    test(`${key}: 出す枠には見出しと中身がある`, () => {
      assert.ok(advice.forYou.title && advice.forYou.body)
      assert.ok(advice.avoid.title && advice.avoid.reason)
      assert.ok(advice.avoid.items.length > 0)
      assert.ok(advice.tryReplies.title)
      assert.ok(advice.tryReplies.items.length > 0)
      if (advice.askNext) {
        assert.ok(advice.askNext.title)
        assert.ok(advice.askNext.items.length > 0)
      }
    })
  }

  test('distance は askNext を持たない（キーは残して null）', () => {
    assert.equal(adviceOf(INTAKE_OF.distance).askNext, null)
  })

  test('distance 以外は askNext を持つ', () => {
    for (const key of ['default', 'angry', 'exhausted']) {
      assert.ok(adviceOf(INTAKE_OF[key]).askNext, key)
    }
  })

  test('distance は返し方の見出しが専用のものになる', () => {
    assert.equal(adviceOf(INTAKE_OF.distance).tryReplies.title, '距離を置くときに伝えられる一言')
    assert.equal(adviceOf(INTAKE_OF.default).tryReplies.title, 'こんな返し方を試してみる')
  })

  test('同じ回答なら同じ結果を返す', () => {
    for (const key of CARD_KEYS) {
      assert.deepEqual(adviceOf(INTAKE_OF[key]), adviceOf(INTAKE_OF[key]))
    }
  })
})

describe('どの回答に合わせたかの一行', () => {
  test('default のときは出さない', () => {
    assert.equal(adviceOf(INTAKE_OF.default).matchedLabel, null)
    assert.equal(buildAdvice(undefined).matchedLabel, null)
  })

  test('困りごとで選ばれたときは、その選択肢の文言を出す', () => {
    assert.equal(
      adviceOf(INTAKE_OF.angry).matchedLabel,
      '「否定すると怒ってしまう」の回答に合わせています',
    )
    assert.equal(
      adviceOf(INTAKE_OF.exhausted).matchedLabel,
      '「自分自身が疲れている」の回答に合わせています',
    )
  })

  test('距離を置きたいときは、選んだほうの文言を出す', () => {
    assert.equal(adviceOf(INTAKE_OF.distance).matchedLabel, '「少し距離を置きたい」の回答に合わせています')
    assert.equal(
      adviceOf({ desiredRelationship: 'more_distance' }).matchedLabel,
      '「かなり距離を置きたい」の回答に合わせています',
    )
  })

  test('フォームの選択肢の文言とずれていない', () => {
    const labels = [...CONCERNS, ...DESIRED_RELATIONSHIP].map((o) => o.label)
    for (const intake of [
      INTAKE_OF.angry,
      INTAKE_OF.exhausted,
      INTAKE_OF.distance,
      { desiredRelationship: 'more_distance' },
    ]) {
      const { matchedLabel } = adviceOf(intake)
      assert.ok(labels.some((l) => matchedLabel.includes(l)), matchedLabel)
    }
  })
})

describe('続柄が文章に出ない', () => {
  // 誰を選んでも同じ文章を出すので、「お父さま」のような特定の続柄が入っていてはいけない
  // 「大丈夫」の「夫」は続柄ではないので除く
  const KINSHIP =
    /お?[父母](さま|さん|親)?|両親|息子|娘|お子さ|子ども|(?<!丈)夫|妻|旦那|奥さ|[兄弟姉妹]|祖父|祖母|おじい|おばあ|親戚|友人|友達|恋人|パートナー|彼氏/

  // 利用者に見える、人が書いた文字列だけを集める。
  // sources（参考にした情報）は外部記事のタイトルと URL なので、どの項目のものも除く（#156・#213）
  const textsOf = (advice) => {
    const out = []
    const walk = (v) => {
      if (typeof v === 'string') out.push(v)
      else if (Array.isArray(v)) v.forEach(walk)
      else if (v && typeof v === 'object') {
        for (const [k, x] of Object.entries(v)) if (k !== 'sources') walk(x)
      }
    }
    walk(advice)
    return out
  }

  for (const key of CARD_KEYS) {
    test(`${key}: どの続柄を選んでも、続柄の言葉が出ない`, () => {
      for (const { value: relationship } of RELATIONSHIPS) {
        const texts = textsOf(adviceOf({ ...INTAKE_OF[key], relationship }))
        assert.ok(texts.length > 0)
        for (const text of texts) assert.doesNotMatch(text, KINSHIP)
      }
    })
  }

  test('検査の正規表現が「お父さま」「お母さま」を拾える', () => {
    assert.match('お父さまは、不安を抱えているのかもしれません。', KINSHIP)
    assert.match('お母さまの話を聞いてみる', KINSHIP)
    assert.match('夫と話すのがつらい', KINSHIP)
    assert.doesNotMatch('無理に話さなくて大丈夫', KINSHIP)
  })
})
