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
  // 補足を囲むかっこ（窓口の「無料・24時間」など）。中身と別の文字列のまま並べる
  'common.parenOpen': '（',
  'common.parenClose': '）',
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
  'consult.relationship': '相手との関係',
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

  // ---- 結果画面 ----
  'result.title': 'あなたへのヒント',
  'result.intro':
    'お話を受け止めました。すぐに全部を解決しようとしなくて大丈夫です。できそうなものから、ひとつずつ。',
  // 結果画面の最初の要点（#226）。危険を示す言葉があるときは出さない
  'result.keyPoints.title': 'まずは、この3つだけ',
  'result.keyPoints.lead': '全部読まなくても大丈夫です。詳しいことは、この下にあります。',
  'result.keyPoints.forYou': 'あなた自身へ',
  'result.keyPoints.reply': '使えそうな一言',
  'result.keyPoints.supportLine': '話せる先',
  // 読み上げ用。各項目のボタンの最後に付く
  'result.keyPoints.jumpHint': '（詳しい説明へ移動します）',
  'result.avoidLabel': '避けたい',
  'result.copyHint': 'タップするとコピーできます。使えそうな言葉を選んでみてください。',
  'result.phoneLines': '電話で相談できる窓口',
  // 英語の画面で crisis のときだけ、窓口の一覧の上に出す（#220）。日本語の画面では出さない
  'lateNight.note':
    '英語で相談できる窓口は、夜遅くはつながらないことがあります。#いのちSOS は24時間つながります（日本語）。',
  'lateNight.emergencyLead': '命に関わる危険があるときは、',
  'lateNight.ambulance': '（救急）',
  'lateNight.or': 'か',
  'lateNight.police': '（警察）',
  'lateNight.emergencyEnd': 'に電話してください。',
  'lateNight.callLabel': '{number}に電話をかける',
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
  // 相談フォームで選んだ「求めるサポート」の名前を入れる（#225）
  'articles.matchedNote': '{labels}も手がかりに選びました。外部のサイトが開きます。',
  'articles.kindSupport': '相談できる先',
  'articles.kindBook': '書籍',
  // 画面の言語と違う言語のページ・窓口に添える（日本語の画面では、日本語の記事・窓口には出さない）
  'articles.inJapanese': '日本語',
  'supportLines.japaneseOnly': '日本語で対応',
  'intakeSummary.title': '入力した内容のまとめ',
  'intakeSummary.hint': 'タップすると入力した内容を確認できます',
  'intakeSummary.edit': '内容を修正する',
  'supportLines.callLabel': '{line}に電話をかける {tel}',

  // ---- フッターのページ（#221）。{name} にはサービス名が入る ----
  'infoPage.contactTitle': 'お問い合わせ',
  'infoPage.contactBody': 'お問い合わせの窓口は、いま準備しています。',
  'faq.title': 'よくある質問',
  'faq.items': [
    { q: '無料で使えますか？', a: 'はい、無料です。会員登録もいりません。' },
    { q: '入力した内容は、どこかに残りますか？', a: '保存も送信もしません。入力した内容は、あなたの端末のブラウザの中だけで使います。「戻る」で入力し直せるように、そのタブを開いている間だけ残り、タブを閉じると消えます。' },
    { q: '相手に知られることはありますか？', a: '{name} から相手に連絡が届くことはありません。ただ、家族と同じ端末を使っている場合は、ブラウザの履歴に {name} を開いた記録が残ることがあります。気になるときは、使い終わったあとにブラウザの履歴を消すか、プライベートブラウズ（シークレットモード）で開いてください。' },
    { q: '診断やカウンセリングをしてもらえますか？', a: 'いいえ。{name} は、あなたが答えた状況に合わせて、関わり方のヒント・参考になりそうな記事や本・相談できる窓口を案内するものです。相手やあなたの心の状態を診断するものではありません。' },
    { q: 'AI が答えているのですか？', a: 'いいえ。ヒントは、公開されている記事や専門家の情報を参考にしてあらかじめ用意した内容の中から、あなたの回答に合わせて選んで表示しています。「詳しい内容」に書いた文章も、決まった言葉が含まれているかを端末の中で確かめるだけで、外には送りません。' },
    { q: '相手の考えを変える方法を教えてもらえますか？', a: '{name} は、相手を説得したり言い負かしたりするためのものではありません。まず会話を終わらせずにいるための関わり方と、あなたがひとりで抱え込まないための情報をお届けします。相手が変わるかどうかをお約束するものではありません。' },
    { q: '紹介される記事や本は、どう選んでいますか？', a: '公的機関・専門家・報道機関・書籍などから、内容を確認したものだけを載せています。SNS の投稿や Q&A サイトは載せていません。健康についての相談では、医療や健康の情報そのものは、あらかじめ決めた発信元のものに限っています。' },
  ],
  'faq.dangerQuestion': '今すぐ危険を感じているときは？',
  'faq.dangerBefore': '無理に話さなくて大丈夫です。身の危険を感じるときは、ためらわずに警察（110）に連絡してください。つらい気持ちを話したいときは「',
  'faq.dangerLink': '電話で相談できる窓口',
  'faq.dangerAfter': '」をご覧ください。',
  'terms.title': 'ご利用にあたって',
  'terms.lead': '{name} を使う前に、知っておいてほしいことをまとめました。',
  'terms.updated': '最終更新日：2026年10月16日',
  'terms.canDoTitle': '{name} でできること',
  'terms.canDoBody': 'いくつかの質問に答えると、あなたの状況に合わせて、次のものを案内します。',
  'terms.canDoItems': ['関わり方のヒント', '近い状況の記事や本', '電話で相談できる窓口'],
  'terms.cannotDoTitle': '{name} ではできないこと',
  'terms.cannotDoItems': ['相手やあなたの心の状態を診断すること', '医療・法律についての助言', '緊急のときの支援', '相手の考えが変わることのお約束'],
  'terms.safetyTitle': 'あなたの安全をいちばんに',
  'terms.safetyBody': '怒鳴られる、脅されていると感じる、生活や仕事に大きな影響が出ている。そんなときは、無理に話さなくて大丈夫です。距離を置くことも、あなたを守る大切な選択肢です。',
  'terms.safetyBefore': '身の危険を感じるときは、ためらわずに警察（110）に連絡してください。つらいときは「',
  'terms.safetyLink': '電話で相談できる窓口',
  'terms.safetyAfter': '」も頼ってください。',
  'terms.externalTitle': '紹介している外部のサイトについて',
  'terms.externalBody': '記事や本は、内容を確認したうえで紹介していますが、リンク先の内容や正確さは、それぞれの発信元が責任を持つものです。リンク先での個人情報の扱いは、各サイトの方針をご確認ください。',
  'terms.accuracyTitle': '情報の正確さについて',
  'terms.accuracyBody1': 'ヒントや窓口の情報は、作成した時点のものです。電話番号や受付時間は変わることがあるので、最新の情報は各窓口の公式サイトでご確認ください。',
  'terms.accuracyBody2': '{name} の情報は、判断するときの参考のひとつとしてお使いください。必要に応じて、専門家や公的な窓口にもご相談ください。',
  'terms.changesTitle': '内容の変更',
  'terms.changesBody': '{name} の内容や、このページは、予告なく変わることがあります。',
  'privacy.title': 'プライバシーポリシー',
  'privacy.lead': '{name} は、身近な人のことで悩む方のためのサービスです。センシティブな内容を扱うため、必要のない情報は集めないことを基本にしています。',
  'privacy.updated': '制定日：2026年10月16日／最終更新日：2026年10月25日',
  'privacy.inputTitle': '相談の入力内容',
  'privacy.inputBody1': 'フォームに入力・選択した内容は、保存も、外部への送信もしません。あなたの端末のブラウザの中だけで処理します。',
  'privacy.inputBody2': '「戻る」で入力し直せるように、入力内容はそのタブを開いている間だけブラウザに残り、タブを閉じると消えます。会員登録やログインの機能はありません。',
  // 言語の設定（src/i18n/language.ts の STORAGE_KEY）。実装と一致させる（#222）
  'privacy.inputBody3': '表示する言語の設定（日本語・英語）だけを、あなたの端末のブラウザに保存します。外部には送信しません。',
  'privacy.analyticsTitle': 'アクセス解析',
  'privacy.analyticsBody1': 'サービスの改善のため、Google LLC の Google Analytics を使っています。Google Analytics は Cookie を使って、次のような情報を集めます。個人を特定する情報は含みません。',
  'privacy.analyticsItems': ['見たページと、見た時間', '端末・ブラウザの種類', 'おおまかな地域', 'どこから {name} に来たか'],
  'privacy.analyticsBody2': '相談の入力内容（選んだ項目や書いた文章）は、Google Analytics に送りません。',
  'privacy.analyticsBody3': '集めた情報は、Google のプライバシーポリシーに沿って扱われます。Google Analytics を無効にしたいときは、Google が提供する「オプトアウト アドオン」を使うか、ブラウザで Cookie を無効にしてください。',
  'privacy.noAnalytics': '現在、アクセス解析のツールは使っていません。使い始めるときは、このページでお知らせします。',
  'privacy.externalSendTitle': '外部に送る情報',
  'privacy.externalSendRows': [
    { label: '送り先', value: 'Google LLC（Google Analytics）' },
    { label: '送る情報', value: '見たページ、端末・ブラウザの情報、Cookie の識別子 など' },
    { label: '目的', value: '利用状況を知り、サービスを改善するため' },
  ],
  'privacy.serverTitle': 'サーバーの記録',
  'privacy.serverBody': '{name} は Cloudflare のサービスで公開しています。安全に運用するため、IP アドレスなどのアクセスの記録が、Cloudflare に一時的に残ることがあります。',
  'privacy.externalTitle': '外部のサイト',
  'privacy.externalBody': '紹介している記事や本のリンク先では、それぞれのサイトの方針で情報が扱われます。',
  'privacy.changesTitle': 'このポリシーの変更',
  'privacy.changesBody': '内容を変えるときは、このページでお知らせします。',
  'about.title': '運営について',
  'about.aboutTitle': '{name} について',
  'about.conceptBefore': '「',
  'about.conceptAfter': '」を大切にしています。',
  'about.valuesTitle': '大切にしていること',
  'about.values': ['相手やあなたの状態を決めつけません', '人ではなく、いま起きている状況に目を向けます', '相手が必ず変わるとはお約束しません', 'あなたの安全を、なによりも優先します', '特定の人や団体、考え方を攻撃しません'],
  'about.shareTitle': '{name} を伝える',
  'supportPage.title': '電話で相談できる窓口',
  'supportPage.introPhrases': ['ひとりで', '抱えきれない', 'ときは、', '公的な', '相談窓口に', '頼ることも', 'できます。', 'あなたの', '安全と', '心の健康が、', 'なによりも', '大切です。'],
  'supportPage.emergencyTitle': '今すぐ身の危険を感じるとき',
  'supportPage.emergencyBefore': 'ためらわずに警察（',
  'supportPage.emergencyAfter': '）に連絡してください。',
}

export type Messages = typeof ja
export type MessageKey = keyof Messages
