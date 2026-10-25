// 画面の文言（英語）。キーと形は ja.ts と同じ（Messages 型で揃える。足りないと typecheck で落ちる）。
//
// CLAUDE.md の7原則は英語にも当てはめる:
// - 相手の状態を断定しない（"may", "seems" で止める）
// - 人にラベルを貼らない（"conspiracy theorist" "believer" と呼ばず、状況を描写する）
// - 変えられると約束しない / 無理に話さなくていい逃げ道を残す / やさしいトーン
// 日本語より意味を足したり強めたりしない。

import type { Messages } from './ja.ts'

export const en: Messages = {
  // ---- サービス全体 ----
  'app.title': "{name} | So you don't have to carry this alone",
  // 英語は文節が長くなりやすいので、375px で1行に収まる短さで区切る
  'app.catchcopy': [
    ['When conspiracy', 'theories come up,'],
    ['you and someone', 'you care about', 'end up talking', 'past each other.'],
  ],
  'app.taglinePhrases': ['Tips that fit your situation,', 'and places to turn for support.'],
  'app.description':
    "When conspiracy theories come up, you and someone you care about can end up talking past each other. {name} helps you find tips for how to respond and places to turn for support, based on your situation. So you don't have to carry this alone.",
  'app.concept': 'Before getting the facts across, first keep the conversation going.',

  // ---- 共通 ----
  'common.back': 'Back',
  'common.required': 'Required',
  'common.optional': 'Optional',
  'common.selectPlaceholder': 'Please select',
  'common.chooseAny': 'Choose as many as you like.',
  'common.notDiagnosisSkip':
    "This is not a diagnosis. You can skip any question you'd rather not answer.",
  'common.skipOk': "You can skip any question you'd rather not answer.",
  'common.quoteOpen': '“',
  'common.quoteClose': '”',
  'common.copy': 'Copy',
  'common.copied': 'Copied',
  'common.opensInNewTab': ' (opens an external site in a new tab)',

  // ---- ブラウザのタブのタイトル ----
  'pageTitle.consult': 'Get tips',
  'pageTitle.result': 'Tips for you',

  // ---- ヘッダー・フッター ----
  'siteHeader.homeLabel': '{name} home',
  'footer.navLabel': 'About this site',
  'footer.disclaimer':
    'This service is a prototype that offers general information. It does not provide medical, legal, or emergency support.',
  'language.switchTo': '日本語',
  'language.switchToLang': 'ja',
  'language.switchLabel': '日本語で表示する',

  // ---- フッターのページの名前 ----
  'infoPages.faq': ['FAQ'],
  'infoPages.terms': ['Terms of use'],
  'infoPages.support': ['Phone lines for support'],
  'infoPages.privacy': ['Privacy policy'],
  'infoPages.about': ['About us'],
  'infoPages.japaneseOnly': 'This page is available in Japanese only.',

  // ---- ホーム ----
  'home.findsTitle': 'What you can find, based on your situation',
  'home.finds': [
    'Tips for how to respond',
    'Articles and books about similar situations',
    'Phone lines where you can talk to someone',
  ],
  'home.start': 'Describe your situation and get tips',
  'home.supportLead': 'If this feels like too much to carry alone',
  'home.supportLink': 'See phone lines where you can talk to someone',
  'home.worriesTitle': 'Does any of this sound familiar?',
  'home.worries': [
    'They get upset when I disagree',
    "I don't know what to say",
    "I've started to feel worn out too",
  ],
  'home.worriesFollow':
    'If even one of these sounds familiar, you could start by sorting through your own feelings.',
  'home.shareLead': 'If you know someone in a similar situation, you can also tell them about this site.',
  'share.button': 'Share this site',
  'share.copied': 'Link copied',
  'share.failed': "Couldn't copy the link. ",

  // ---- 相談フォーム ----
  'consult.title': 'Tell us about your situation',
  'consult.steps': ['About you and the other person', "What's troubling you now", 'What you would like from here'],
  'consult.next': 'Next',
  'consult.submit': 'See tips',
  'consult.loading': 'Sorting through what you shared…',
  'consult.notDebateAfterName': ' is not a tool for winning arguments.',
  'consult.gentleSupport': 'It is here to gently support you and your relationship with someone you care about.',
  'consult.relationshipError': 'Please choose your relationship with them',
  'consult.intro':
    'If you answer a few questions, it becomes easier for us to suggest tips, helpful information, and places to turn for support that fit your situation.',
  'consult.introNote': 'This is not a diagnosis. Just answer what you can.',
  'consult.age': 'Your age',
  'consult.agePlaceholder': 'e.g. 35',
  'consult.ageUnit': 'years old',
  'consult.gender': 'Your gender',
  'consult.relationship': 'Your relationship with them',
  'consult.duration': 'How long has this been on your mind?',
  'consult.immersion': 'How strongly does it seem to you that they believe it?',
  'consult.immersionHint': 'This is not a medical assessment. Just go with your own impression.',
  'consult.topics': 'What is it about?',
  'consult.topicsHint': 'Choose as many as you like. This is not a judgment of whether the content is true.',
  'consult.concerns': 'What is troubling you?',
  'consult.concernsOtherLabel': 'Other things troubling you',
  'consult.concernsOtherPlaceholder': 'e.g. They call me late at night and talk for a long time',
  'consult.supportPerson': 'Is there someone around you that you can talk to?',
  'consult.desiredRelationship': 'What kind of relationship would you like to have with them from here?',
  'consult.desiredRelationshipHint':
    'Any choice is okay. Keeping some distance is also an important way to protect yourself.',
  'consult.desiredSupport': 'What kind of support are you looking for?',
  'consult.freeText': 'Tell us a little more',
  'consult.privacyNote':
    'Please do not enter information that could identify someone (real names, addresses, workplaces, social media accounts, etc.).',
  'consult.freeTextPlaceholder': `Recently, my father has come to strongly believe some health information.
He gets upset when I disagree, so I don't know how to talk with him.
I'm also feeling a little tired myself.`,

  // ---- 相談フォームの部品 ----
  'steps.srPrefix': '{total} steps in total. Step ',
  'immersion.reset': 'Clear answer',
  'immersion.howTo': 'Move the slider to choose',
  'immersion.valueText': '{value} out of {max}',
  'immersion.unanswered': 'Not answered',
  'immersion.scaleSep': ': ',
  'immersion.low': ['Seems to believe it', 'a little'],
  'immersion.high': ['Seems to believe it', 'very strongly'],

  // ---- 結果画面 ----
  'result.title': 'Tips for you',
  'result.intro':
    "We've received what you shared. You don't need to solve everything at once. One step at a time, starting with whatever feels doable.",
  'result.avoidLabel': 'Avoid',
  'result.copyHint': 'Tap to copy. Pick any words that feel right to you.',
  'result.phoneLines': 'Phone lines where you can talk to someone',
  'result.sourcesTitle': 'Sources for these tips',
  'result.disclaimer':
    'These tips are general information and do not provide medical, legal, or emergency support.',
  'sources.label': 'Source: ',
  'sources.linkWithTitle': ' ({title}. Opens an external site in a new tab)',
  'sources.showMore': 'Show more sources ({count})',
  'sources.hideMore': 'Hide more sources ({count})',
  'articles.title': 'Articles and books about similar situations',
  'articles.fallbackNote':
    'You could start with these. If anything catches your eye, open it whenever you feel up to it. These links open external sites.',
  'articles.externalNote': 'These links open external sites.',
  'articles.kindSupport': 'Support service',
  'articles.kindBook': 'Book',
  'desiredSupport.title': 'The support you are looking for',
  'desiredSupport.unsureNote':
    "It's okay if you're not sure yet. Try looking at one of the tips below that catches your interest.",
  'intakeSummary.title': 'Summary of your answers',
  'intakeSummary.hint': 'Tap to review your answers',
  'intakeSummary.edit': 'Edit your answers',
  'supportLines.callLabel': 'Call {line} at {tel}',
}
