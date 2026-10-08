// recommendArticles のテスト専用の記事。articles.json のモックには依存させない
// （実記事に差し替えてもテストが壊れないように）。値はすべて articleTags.js のスキーマ内。

const base = {
  url: 'https://example.com/fixture',
  title: 'テスト用の記事',
  publisher: 'テスト',
  summary: 'テスト用の記事です。',
  relationships: ['any'],
  topics: ['any'],
  concerns: ['any'],
  supportTypes: ['background'],
  stance: 'neutral',
  burden: 'light',
  sourceType: 'support_org',
  status: 'approved',
  reviewedAt: '2026-09-01',
}

const article = (id, overrides) => ({
  ...base,
  url: `https://example.com/fixture/${id}`,
  id,
  ...overrides,
})

export const FIXTURE_FALLBACK_IDS = ['f-selfcare', 'f-consult']

export const fixtureArticles = [
  article('f-coping-angry', {
    concerns: ['angry_when_disagreed', 'conversation_breaks_down'],
    supportTypes: ['coping_tips'],
    stance: 'keep_connection',
    burden: 'moderate',
    sourceType: 'academic',
  }),
  article('f-coping-info', {
    concerns: ['sends_lots_of_info'],
    supportTypes: ['coping_tips'],
    burden: 'moderate',
  }),
  article('f-selfcare', {
    concerns: ['self_exhausted'],
    supportTypes: ['self_care'],
  }),
  article('f-consult', {
    concerns: ['money_worries', 'relationships_worsening', 'self_exhausted'],
    supportTypes: ['consultation_service'],
    sourceType: 'public_agency',
  }),
  // 「かなり距離を置きたい」の比較用。stance 以外は同じ
  article('f-keep', {
    concerns: ['relationships_worsening'],
    supportTypes: ['experience'],
    stance: 'keep_connection',
    burden: 'moderate',
  }),
  article('f-distance', {
    concerns: ['relationships_worsening'],
    supportTypes: ['experience'],
    stance: 'distance',
    burden: 'moderate',
  }),
  // 「疲れている」の比較用。burden 以外は同じ
  article('f-heavy', {
    concerns: ['repeats_same_topic'],
    supportTypes: ['background'],
    burden: 'heavy',
  }),
  article('f-moderate', {
    concerns: ['repeats_same_topic'],
    supportTypes: ['background'],
    burden: 'moderate',
  }),
  // 関係と話題だけが一致しうる記事
  article('f-relation-topic', {
    relationships: ['mother'],
    topics: ['politics_society'],
    concerns: ['repeats_same_topic'],
    supportTypes: ['background'],
    sourceType: 'media',
  }),
  // 健康を選んだ相談では出してはいけない（topics: any でも発信元で外す）
  article('f-media-any', {
    concerns: ['angry_when_disagreed'],
    supportTypes: ['coping_tips'],
    sourceType: 'media',
  }),
  article('f-health-pro', {
    topics: ['health'],
    concerns: ['angry_when_disagreed'],
    supportTypes: ['coping_tips'],
    sourceType: 'professional',
  }),
  // approved なら上位に来る内容だが、取り下げ済み
  article('f-paused', {
    concerns: ['angry_when_disagreed', 'self_exhausted', 'money_worries'],
    supportTypes: ['coping_tips', 'consultation_service'],
    sourceType: 'public_agency',
    status: 'paused',
  }),
]
