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
  'common.parenOpen': ' (',
  'common.parenClose': ')',
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
  'lateNight.note':
    'The English-language lines may not be open late at night. #Inochi SOS is available 24 hours a day (in Japanese).',
  'lateNight.emergencyLead': 'If you are in immediate danger, please call ',
  'lateNight.ambulance': ' (ambulance)',
  'lateNight.or': ' or ',
  'lateNight.police': ' (police)',
  'lateNight.emergencyEnd': '.',
  'lateNight.callLabel': 'Call {number}',
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
  'articles.inJapanese': 'Japanese',
  'supportLines.japaneseOnly': 'Japanese-language service',
  'desiredSupport.title': 'The support you are looking for',
  'desiredSupport.unsureNote':
    "It's okay if you're not sure yet. Try looking at one of the tips below that catches your interest.",
  'intakeSummary.title': 'Summary of your answers',
  'intakeSummary.hint': 'Tap to review your answers',
  'intakeSummary.edit': 'Edit your answers',
  'supportLines.callLabel': 'Call {line} at {tel}',

  // ---- フッターのページ（#221）。{name} にはサービス名が入る ----
  'infoPage.contactTitle': 'Contact',
  'infoPage.contactBody': 'We are currently preparing a contact point.',
  'faq.title': 'Frequently asked questions',
  'faq.items': [
    { q: 'Is it free to use?', a: 'Yes, it is free. You do not need to register.' },
    { q: 'Is what I enter saved anywhere?', a: 'It is neither saved nor sent anywhere. What you enter is used only within the browser on your device. So that you can go “Back” and re-enter your answers, it stays only while that tab is open, and disappears when you close the tab.' },
    { q: 'Could the other person find out?', a: '{name} never contacts the other person. However, if you share a device with family members, your browser history may show that you opened {name}. If this concerns you, clear your browser history after using it, or open it in a private browsing (incognito) window.' },
    { q: 'Can I get a diagnosis or counseling?', a: 'No. {name} suggests tips for how to respond, articles and books that may be helpful, and phone lines where you can talk to someone, based on the situation you describe. It does not diagnose the state of mind of the other person or of you.' },
    { q: 'Are the answers written by AI?', a: 'No. The tips are selected to match your answers from content prepared in advance with reference to published articles and information from experts. The text you write in “Tell us a little more” is only checked on your device for certain words, and is not sent anywhere.' },
    { q: "Can you tell me how to change the other person's mind?", a: '{name} is not meant for persuading the other person or winning arguments. It offers ways of relating that help keep the conversation from ending, and information so that you do not have to carry this alone. It does not promise whether the other person will change.' },
    { q: 'How are the articles and books chosen?', a: 'We include only items whose content we have checked, from sources such as public agencies, experts, news organizations, and books. We do not include social media posts or Q&A sites. For health-related situations, information about medicine and health itself is limited to sources we have decided on in advance.' },
  ],
  'faq.dangerQuestion': 'What if I feel in danger right now?',
  'faq.dangerBefore': "You don't have to force yourself to talk. If you feel your safety is at risk, please don't hesitate to contact the police (110). If you want to talk about painful feelings, please see “",
  'faq.dangerLink': 'Phone lines for support',
  'faq.dangerAfter': '”.',
  'terms.title': 'Terms of use',
  'terms.lead': 'Here is what we would like you to know before using {name}.',
  'terms.updated': 'Last updated: October 16, 2026',
  'terms.canDoTitle': 'What {name} can do',
  'terms.canDoBody': 'When you answer a few questions, it suggests the following, based on your situation.',
  'terms.canDoItems': ['Tips for how to respond', 'Articles and books about similar situations', 'Phone lines where you can talk to someone'],
  'terms.cannotDoTitle': 'What {name} cannot do',
  'terms.cannotDoItems': ['Diagnosing the state of mind of the other person or of you', 'Medical or legal advice', 'Support in emergencies', 'A promise that the other person will change their mind'],
  'terms.safetyTitle': 'Your safety comes first',
  'terms.safetyBody': "Being yelled at, feeling threatened, or facing major effects on your daily life or work: at times like these, you don't have to force yourself to talk. Keeping your distance is also an important choice that protects you.",
  'terms.safetyBefore': "If you feel your safety is at risk, please don't hesitate to contact the police (110). When things are hard, please also turn to “",
  'terms.safetyLink': 'Phone lines for support',
  'terms.safetyAfter': '”.',
  'terms.externalTitle': 'About the external sites we introduce',
  'terms.externalBody': "We introduce articles and books after checking their content, but each source is responsible for the content and accuracy of what is at the link. Please check each site's policy for how it handles personal information.",
  'terms.accuracyTitle': 'About the accuracy of information',
  'terms.accuracyBody1': "The tips and phone line information are as of when they were prepared. Phone numbers and hours may change, so please check each service's official website for the latest information.",
  'terms.accuracyBody2': 'Please use the information on {name} as one reference when making decisions. If needed, please also consult professionals or public services.',
  'terms.changesTitle': 'Changes to the content',
  'terms.changesBody': 'The content of {name} and of this page may change without notice.',
  'privacy.title': 'Privacy policy',
  'privacy.lead': '{name} is a service for people who are troubled about someone close to them. Because it deals with sensitive matters, our basic approach is not to collect information we do not need.',
  'privacy.updated': 'Established: October 16, 2026',
  'privacy.inputTitle': 'What you enter in the form',
  'privacy.inputBody1': 'What you enter or select in the form is neither saved nor sent anywhere outside. It is processed only within the browser on your device.',
  'privacy.inputBody2': 'So that you can go “Back” and re-enter your answers, what you enter stays in the browser only while that tab is open, and disappears when you close the tab. There is no account registration or login.',
  'privacy.analyticsTitle': 'Access analytics',
  'privacy.analyticsBody1': 'To improve the service, we use Google Analytics by Google LLC. Google Analytics uses cookies to collect information such as the following. It does not include information that identifies individuals.',
  'privacy.analyticsItems': ['Pages viewed, and when', 'Type of device and browser', 'Approximate region', 'Where you came to {name} from'],
  'privacy.analyticsBody2': 'What you enter in the form (the items you choose and the text you write) is not sent to Google Analytics.',
  'privacy.analyticsBody3': "The information collected is handled in accordance with Google's privacy policy. If you want to disable Google Analytics, use the “opt-out add-on” provided by Google, or disable cookies in your browser.",
  'privacy.noAnalytics': 'We do not currently use any access analytics tools. If we start using one, we will let you know on this page.',
  'privacy.externalSendTitle': 'Information sent to outside parties',
  'privacy.externalSendRows': [
    { label: 'Recipient', value: 'Google LLC (Google Analytics)' },
    { label: 'Information sent', value: 'Pages viewed, device and browser information, cookie identifiers, etc.' },
    { label: 'Purpose', value: 'To understand how the service is used and improve it' },
  ],
  'privacy.serverTitle': 'Server logs',
  'privacy.serverBody': "{name} is published using Cloudflare's services. For safe operation, access records such as IP addresses may be kept temporarily by Cloudflare.",
  'privacy.externalTitle': 'External sites',
  'privacy.externalBody': "On the sites linked from the articles and books we introduce, information is handled according to each site's own policy.",
  'privacy.changesTitle': 'Changes to this policy',
  'privacy.changesBody': 'If we change the content, we will let you know on this page.',
  'about.title': 'About us',
  'about.aboutTitle': 'About {name}',
  'about.conceptBefore': 'We value this idea: “',
  'about.conceptAfter': '”',
  'about.valuesTitle': 'What we value',
  'about.values': ['We do not make assumptions about the state of the other person or of you', 'We focus on the situation happening now, rather than on the person', 'We do not promise that the other person will change', 'We put your safety above everything else', 'We do not attack any particular person, group, or way of thinking'],
  'about.shareTitle': 'Tell others about {name}',
  'supportPage.title': 'Phone lines for support',
  'supportPage.introPhrases': ['When this feels like too much', 'to carry alone,', 'you can turn', 'to public support services.', 'Your safety', 'and mental health', 'matter more', 'than anything.'],
  'supportPage.emergencyTitle': 'If you feel in danger right now',
  'supportPage.emergencyBefore': "Please don't hesitate to contact the police (",
  'supportPage.emergencyAfter': ').',
}
