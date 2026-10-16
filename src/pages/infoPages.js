// フッターから開くページ。フッターのリンクとタブのタイトルはこの一覧から作る。
// ページの中身は pages/Faq.jsx などにあり、ルートは App.jsx に書く（パスを変えたら両方直す）
// phrases は文字が大きいときに改行してよい位置で区切ったもの（言葉の途中で改行しないため）
export const INFO_PAGES = [
  { path: '/faq', phrases: ['よくある', '質問'] },
  { path: '/terms', phrases: ['ご利用に', 'あたって'] },
  { path: '/support', phrases: ['電話で', '相談できる', '窓口'] },
  { path: '/privacy', phrases: ['プライバシー', 'ポリシー'] },
  { path: '/about', phrases: ['運営に', 'ついて'] },
].map((page) => ({ ...page, label: page.phrases.join('') }))
