// 画面の文言（日本語）。英語は en.ts。キーは「画面や部品の名前.項目」。
//
// - {name} などの波かっこは t() で差し込む。{name} にはサービス名（config.js の APP.name）が入る
// - 配列は、改行してよい位置で区切った文節（Phrases で表示する）か、並べて出す項目
// - このファイルの形が辞書の型（Messages）になる。en.ts にキーが足りないと typecheck で落ちる
// - 選択肢・アドバイス・相談窓口など src/data/ の文言はここには無い（#215 ではまだ日本語のまま）

export const ja = {
  // ---- サービス全体（もとは config.js） ----
  // ブラウザのタブに出るトップページのタイトル（「ひとりで抱え込まない」はここに残す）
  'app.title': '{name} | ひとりで抱え込まないために',
  // トップページのメインコピー。1行ごとに「改行してよい位置」で区切った文節の配列
  'app.catchcopy': [
    ['陰謀論の', '話になると、'],
    ['大切な人と', 'すれ違って', 'しまう。'],
  ],
  // タグライン（キャッチの下の一文）。共有するときの文は、これをつないだもの
  'app.taglinePhrases': ['あなたに合う', 'ヒントと、', '相談先を。'],
  'app.description':
    '陰謀論の話になると、大切な人とすれ違ってしまう。{name}は、あなたの状況に合わせて、関わり方のヒントと相談先を見つけるお手伝いをします。ひとりで抱え込まないために。',
  'app.concept': '正しい情報を届ける前に、まず会話を終わらせない。',

  // ---- 共通 ----
  'common.back': '戻る',
  'common.required': '必須',
  'common.optional': '任意',
  'common.selectPlaceholder': '選択してください',
  'common.chooseAny': 'いくつでも選べます。',
  'common.notDiagnosisSkip': 'これは診断ではありません。答えたくない項目は、とばして大丈夫です。',
  'common.skipOk': '答えたくない項目は、とばして大丈夫です。',
  // 言葉を囲むかっこ（避けたい対応・返し方・コンセプト）。
  // 中身と別の文字列のまま並べる（1つの文字列にすると、かっこの前後の詰め方が変わって見た目がずれる）
  'common.quoteOpen': '「',
  'common.quoteClose': '」',
  'common.copy': 'コピー',
  'common.copied': 'コピーしました',
  // 外部リンクに添える、読み上げ用の一言
  'common.opensInNewTab': '（外部サイトが新しいタブで開きます）',

  // ---- ブラウザのタブのタイトル（「〇〇 | Yorido」） ----
  'pageTitle.consult': 'ヒントをみる',
  'pageTitle.result': 'あなたへのヒント',

  // ---- ヘッダー・フッター ----
  'siteHeader.homeLabel': '{name} ホーム',
  'footer.navLabel': 'このサイトについて',
  'footer.disclaimer':
    'このサービスは一般的な情報提供を目的としたプロトタイプです。医療・法律・緊急支援を提供するものではありません。',
  // 言語の切り替え。ボタンには「切り替えた先の言語の名前」を、その言語で出す
  'language.switchTo': 'English',
  'language.switchToLang': 'en',
  'language.switchLabel': 'Show this site in English',

  // ---- フッターのページの名前（改行してよい位置で区切る） ----
  'infoPages.faq': ['よくある', '質問'],
  'infoPages.terms': ['ご利用に', 'あたって'],
  'infoPages.support': ['電話で', '相談できる', '窓口'],
  'infoPages.privacy': ['プライバシー', 'ポリシー'],
  'infoPages.about': ['運営に', 'ついて'],
  // 英語の画面で、まだ日本語しかないページの冒頭に出す（日本語の画面では出さない）
  'infoPages.japaneseOnly': 'このページは日本語のみです。',

  // ---- ホーム ----
  'home.findsTitle': 'あなたの状況に合わせて見つかるもの',
  'home.finds': ['関わり方のヒント', '近い状況の記事や本', '電話で相談できる窓口'],
  'home.start': '状況を入れてヒントをみる',
  'home.supportLead': 'ひとりで抱えきれないときは',
  'home.supportLink': '電話で相談できる窓口を見る',
  'home.worriesTitle': 'こんな悩みはありませんか？',
  'home.worries': [
    '否定すると怒ってしまう',
    '何を言えばいいか分からない',
    '自分まで疲れてしまった',
  ],
  'home.worriesFollow':
    'どれかひとつでも当てはまったら、まずは気持ちを整理するところから始めましょう。',
  'home.shareLead': '同じように悩んでいる人がいたら、このサイトを伝えることもできます。',
  'share.button': 'このサイトを伝える',
  'share.copied': 'URLをコピーしました',
  'share.failed': 'コピーできませんでした。',

  // ---- 相談フォーム ----
  'consult.title': 'あなたの状況を教えてください',
  'consult.steps': ['あなたと相手について', 'いま困っていること', 'これからどうしたいか'],
  'consult.next': '次へ',
  'consult.submit': 'ヒントをみる',
  'consult.loading': 'あなたの気持ちを整理しています…',
  // サービス名（APP.name）のすぐ後ろに続ける。名前と別の文字列のまま並べる（つなぐと文字の間隔が変わる）
  'consult.notDebateAfterName': 'は相手を論破するためのものではありません。',
  'consult.gentleSupport': 'あなたと大切な人の関係を、そっと支えます。',
  'consult.relationshipError': '相手との関係を選んでください',
  'consult.intro':
    'いくつかの質問に答えていただくと、あなたに合ったヒントや、参考になる情報・相談先をご案内しやすくなります。',
  'consult.introNote': 'これは診断ではありません。分かる範囲で大丈夫です。',
  'consult.age': 'あなたの年齢',
  'consult.agePlaceholder': '例）35',
  'consult.ageUnit': '歳',
  'consult.gender': 'あなたの性別',
  'consult.relationship': '相手との関係',
  'consult.duration': 'いつ頃から気になっていますか？',
  'consult.immersion': 'その話を、どのくらい強く信じているように感じますか？',
  'consult.immersionHint': '医学的な評価ではありません。あなたが感じているままで大丈夫です。',
  'consult.topics': 'どんな内容についてですか？',
  'consult.topicsHint': 'いくつでも選べます。内容が正しいかどうかを判断するものではありません。',
  'consult.concerns': 'どんなことで困っていますか？',
  'consult.concernsOtherLabel': 'その他の困っていること',
  'consult.concernsOtherPlaceholder': '例）夜遅くに長い電話がかかってくる',
  'consult.supportPerson': '周囲に相談できる人はいますか？',
  'consult.desiredRelationship': 'その人と今後どんな関係でいたいですか？',
  'consult.desiredRelationshipHint':
    'どれを選んでも大丈夫です。距離を置くことも、あなたを守る大切な選択肢です。',
  'consult.desiredSupport': 'どんなサポートを求めていますか？',
  'consult.freeText': 'もう少し詳しく教えてください',
  'consult.privacyNote':
    '個人が特定できる情報（実名・住所・勤務先・SNSアカウントなど）は入力しないでください。',
  'consult.freeTextPlaceholder': `最近、父が健康に関する情報を強く信じるようになりました。
否定すると怒ってしまうので、どう話せばいいか分かりません。
自分自身も少し疲れています。`,

  // ---- 相談フォームの部品 ----
  // 読み上げ用。見た目の「2 / 3」の前に付く
  'steps.srPrefix': '全{total}ステップ中 ',
  'immersion.reset': '未回答にもどす',
  'immersion.howTo': 'つまみを動かして選べます',
  'immersion.valueText': '{value}（{max}段階中）',
  'immersion.unanswered': '未回答',
  // 両端の数字と説明のあいだ
  'immersion.scaleSep': '：',
  'immersion.low': ['少しだけ信じている', 'ように見える'],
  'immersion.high': ['とても強く信じている', 'ように見える'],

  // ---- 結果画面 ----
  'result.title': 'あなたへのヒント',
  'result.intro':
    'お話を受け止めました。すぐに全部を解決しようとしなくて大丈夫です。できそうなものから、ひとつずつ。',
  'result.avoidLabel': '避けたい',
  'result.copyHint': 'タップするとコピーできます。使えそうな言葉を選んでみてください。',
  'result.phoneLines': '電話で相談できる窓口',
  'result.sourcesTitle': 'このヒントの参考にした情報',
  'result.disclaimer':
    'このヒントは一般的な情報提供であり、医療・法律・緊急支援を提供するものではありません。',
  'sources.label': '参考：',
  // 見た目はドメインだけのリンクの読み上げ。記事のタイトルも伝える
  'sources.linkWithTitle': '（{title}。外部サイトが新しいタブで開きます）',
  'sources.showMore': 'ほかに参考にした記事 {count} 件の一覧を開く',
  'sources.hideMore': 'ほかに参考にした記事 {count} 件の一覧を閉じる',
  'articles.title': '近い状況の記事や本',
  'articles.fallbackNote':
    'まずはこちらから。気になるものがあれば、読めそうなときに開いてみてください。外部のサイトが開きます。',
  'articles.externalNote': '外部のサイトが開きます。',
  'articles.kindSupport': '相談できる先',
  'articles.kindBook': '書籍',
  'desiredSupport.title': 'あなたが求めているサポート',
  'desiredSupport.unsureNote':
    'まだはっきりしなくても大丈夫です。下のヒントから、気になるものをひとつ見てみてください。',
  'intakeSummary.title': '入力した内容のまとめ',
  'intakeSummary.hint': 'タップすると入力した内容を確認できます',
  'intakeSummary.edit': '内容を修正する',
  'supportLines.callLabel': '{line}に電話をかける {tel}',
}

export type Messages = typeof ja
export type MessageKey = keyof Messages
