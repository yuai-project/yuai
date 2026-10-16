// フッターから開くページ。フッターのリンク・ルート・タブのタイトルはこの一覧から作る。
// 中身は #175 で作る。それまでは「準備中」の仮ページ（電話で相談できる窓口だけは一覧を出す）
// phrases は文字が大きいときに改行してよい位置で区切ったもの（言葉の途中で改行しないため）
export const INFO_PAGES = [
  { path: '/faq', phrases: ['よくある', '質問'] },
  { path: '/terms', phrases: ['ご利用に', 'あたって'] },
  { path: '/support', phrases: ['電話で', '相談できる', '窓口'] },
  { path: '/privacy', phrases: ['プライバシー', 'ポリシー'] },
  { path: '/about', phrases: ['運営に', 'ついて'] },
].map((page) => ({ ...page, label: page.phrases.join('') }))
