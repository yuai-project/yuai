// フッターから開くページ。フッターのリンクとタブのタイトルはこの一覧から作る。
// ページの中身は pages/Faq.jsx などにあり、ルートは App.jsx に書く（パスを変えたら両方直す）
// ページの名前は言語ごとに辞書（src/i18n/ja.ts・en.ts の key）に、改行してよい位置で区切って置く
export const INFO_PAGES = [
  { path: '/faq', key: 'infoPages.faq' },
  { path: '/terms', key: 'infoPages.terms' },
  { path: '/support', key: 'infoPages.support' },
  { path: '/privacy', key: 'infoPages.privacy' },
  { path: '/about', key: 'infoPages.about' },
]
