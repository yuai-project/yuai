// 結果画面の「似た体験談」を、相手との関係から選ぶ。
// 純関数のみ。日時・乱数を使わず、同じ回答なら同じ結果を返す。

import { mockStories } from './mockStories.js'

// フォームの relationship → 体験談の relation。
// other（その他）と未回答は対応なし（指定なし）。
export const STORY_RELATION_BY_RELATIONSHIP = {
  father: '家族',
  mother: '家族',
  sibling: '家族',
  child: '家族',
  grandparent: '家族',
  relative: '家族',
  friend: '友人',
  partner: '恋人',
}

export const MAX_RELATED_STORIES = 2

// 該当する体験談がないときに出す、固定の体験談。
export const FALLBACK_STORY_IDS = ['s1', 's3']

// 同じ relation の体験談を、stories の並び順のまま最大2件。該当がなければ固定の体験談。
// request は buildAdviceRequest()（consultationIntake.js）の戻り値。
export function selectRelatedStoryIds(request, stories = mockStories) {
  const relation = STORY_RELATION_BY_RELATIONSHIP[request?.relationship]
  const matched = relation
    ? stories.filter((s) => s.relation === relation).slice(0, MAX_RELATED_STORIES)
    : []
  return matched.length > 0 ? matched.map((s) => s.id) : [...FALLBACK_STORY_IDS]
}
