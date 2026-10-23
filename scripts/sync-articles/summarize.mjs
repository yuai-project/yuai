// 承認済みの記事の、シートに無い項目（要約・stance・burden・sourceType・medicalInfo）を AI に下書きさせる（#168）。
// シートの「記事の種類」が空の行では、supportTypes の候補も使う。
//
// - 下書きは PR で人が確かめる前提。要約は利用者に見える文言なので、PR の前に tone-check を通す。
// - 渡すのは公開記事の情報と、監修者のタグだけ。利用者の入力は使わない。
// - 本文が取れなかった記事（PDF・有料・取得失敗）は AI に渡さない。タイトルだけで要約を書かせると、中身と違う要約になりうるため。

import Anthropic from '@anthropic-ai/sdk'
import { ARTICLE_MULTI_AXES, ARTICLE_SINGLE_AXES, BOOK_SOURCE_TYPE } from '../../src/data/articleTags.ts'
import { fetchPage } from '../collect-articles/fetchPage.mjs'

const MODEL = 'claude-sonnet-5-5'
// 件数は1回に数件なので Batches API は使わない
const EFFORT = 'medium'

// 既存の要約から、書き方の見本にするもの
const EXAMPLES = [
  '父が陰謀論を信じるようになったという相談への回答です。強く否定するより、関心を持って質問しながら話を聞く接し方を紹介しています。',
  '家族が陰謀論を信じるようになった人たちから寄せられた声をまとめた記事です。同じように悩んでいる人がいることを知るきっかけになります。',
  '政治心理学者へのインタビューで、陰謀論が広がる仕組みを解説しています。誰が伝えるかが大切で、会話を続けること自体に意味がある、という視点にも触れています。',
]

const SYSTEM_PROMPT = `あなたは Yorido の記事一覧の編集者です。Yorido は、身近な人が陰謀論や極端な情報を信じるようになって悩んでいる「相談者本人」を支えるアプリです。
監修者が承認した記事について、アプリの結果画面に出す要約と、いくつかの分類を下書きします。下書きは人が確かめてから載せます。

## 要約（summary）
- 2〜3文、全体で120字前後。「〜です。」「〜しています。」の丁寧な文体
- 記事に何が書いてあるかを、相談者が読むかどうか決められるように書く。記事に無いことを足さない
- 次を必ず守る
  1. 相手の心理状態を断定・診断しない（「〜という状態です」ではなく「〜かもしれません」）
  2. 人を「陰謀論者」「信者」などとラベリングしない。人ではなく状況を描写する（「〜を信じるようになった家族」）
  3. 相手を必ず変えられると約束しない。「〜すれば解決します」と書かない
  4. 話し続けることを勧めきらない。距離を取る選択肢を否定しない
  5. 実在の個人・団体・思想を攻撃しない
  6. 暗い・攻撃的・監視的・恐怖を煽る言い方をしない。やさしく、落ち着いたトーンにする
- 記事のタイトルにラベリングの言葉があっても、要約では言い換える

見本:
${EXAMPLES.map((e) => `- ${e}`).join('\n')}

## 分類
- stance: 相手との関係についての記事の向き。keep_connection（関係を保つ）/ distance（距離を置く・関係を終える）/ neutral（どちらでもない）
- burden: 読む負担。light（短く読みやすい）/ moderate（ある程度の長さ・専門的な話）/ heavy（長い・つらい内容が多い）
- sourceType: 発信元の種類。public_agency（公的機関）/ support_org（支援団体）/ academic（研究者・学術）/ professional（弁護士・医師・カウンセラーなどの専門職）/ media（報道・雑誌・個人のブログ）
- medicalInfo: 病気・治療・ワクチン・健康法について「何が正しいか」を説明する記事なら true。健康の話題が出てくるだけの体験談や接し方の記事は false
- supportTypes: 記事が相談者に何を届けるか。1〜2個。coping_tips（具体的な接し方・対処法）/ self_care（相談者自身のケア）/ background（背景の解説）/ experience（体験談）/ peer_support（同じ悩みを持つ人とつながる場）/ consultation_service（相談窓口）。監修者のタグに supportTypes が無いときだけ使う
- notes: 人が確かめるときに特に気を付けてほしいことを、大事なものから2つまで、全体で100字以内。例: 有料部分がある、英語の記事、本文に人をラベリングする表現が多い、主題が監修者のタグとずれている。無ければ空文字。要約で言い換えたことや、冒頭しか読めていないことは書かなくてよい`

const SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    stance: { type: 'string', enum: ARTICLE_SINGLE_AXES.stance },
    burden: { type: 'string', enum: ARTICLE_SINGLE_AXES.burden },
    // 書籍は author が要るので AI には選ばせない（書籍は手で足す）
    sourceType: { type: 'string', enum: ARTICLE_SINGLE_AXES.sourceType.filter((v) => v !== BOOK_SOURCE_TYPE) },
    medicalInfo: { type: 'boolean' },
    supportTypes: {
      type: 'array',
      items: { type: 'string', enum: ARTICLE_MULTI_AXES.supportTypes.values },
    },
    notes: { type: 'string' },
  },
  required: ['summary', 'stance', 'burden', 'sourceType', 'medicalInfo', 'supportTypes', 'notes'],
  additionalProperties: false,
}

function buildUserMessage(row, tags, page) {
  return [
    `タイトル: ${row['タイトル']}`,
    `URL: ${row.URL}`,
    `発信元: ${row['発信元']}`,
    `監修者が付けたタグ: ${JSON.stringify(tags)}`,
    page.description ? `ページの説明: ${page.description}` : null,
    page.author ? `書き手: ${page.author}` : null,
    '',
    '本文（冒頭）:',
    page.excerpt,
  ]
    .filter((l) => l != null)
    .join('\n')
}

// 戻り値: { ok: true, draft } か { ok: false, error }。1件の失敗で全体を止めない
export async function draftArticle(row, tags, { client = new Anthropic() } = {}) {
  const page = await fetchPage(row.URL)
  if (!page.ok) return { ok: false, error: `本文を取得できなかった（${page.error}）` }
  if (page.kind !== 'html' || !page.excerpt) return { ok: false, error: `本文を取り出せなかった（${page.kind}）` }

  let message
  try {
    message = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserMessage(row, tags, page) }],
      output_config: { effort: EFFORT, format: { type: 'json_schema', schema: SCHEMA } },
    })
  } catch (e) {
    return { ok: false, error: `AI の呼び出しに失敗した（${e.message.slice(0, 200)}）` }
  }
  if (message.stop_reason !== 'end_turn') {
    return { ok: false, error: `AI の応答が途中で止まった（${message.stop_reason}）` }
  }
  const text = message.content.find((b) => b.type === 'text')?.text
  return { ok: true, draft: JSON.parse(text), usage: message.usage }
}

// Sonnet 5.5: 入力 $2 / 出力 $10（100万トークンあたり）
export const estimateCost = ({ input_tokens, output_tokens }) => (input_tokens * 2 + output_tokens * 10) / 1_000_000
