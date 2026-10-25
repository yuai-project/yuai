import Header from '../components/Header'
import JapaneseOnlyNotice from '../components/JapaneseOnlyNotice'

// フッターから開く読み物ページ（よくある質問・ご利用にあたって・プライバシーポリシー・運営について）の共通の枠。
// 本文は読みやすい幅に収め、見出しは文節で折り返す（文字が大きくても言葉の途中で切れない）
// 中身はまだ日本語だけなので lang="ja" を付け、英語の画面では冒頭に注記を出す（#215）
export default function InfoPage({ title, lead, updated, children }) {
  return (
    <div lang="ja">
      <Header title={title} back />
      <article className="px-5 pb-12 pt-4 lg:mx-auto lg:max-w-page lg:px-8 lg:pb-16 lg:pt-6">
        <div className="max-w-2xl text-sm leading-relaxed text-ink-soft">
          <JapaneseOnlyNotice />
          {lead && <p className="mb-2 text-ink-soft [word-break:auto-phrase]">{lead}</p>}
          {children}
          {updated && <p className="mt-8 text-xs text-ink-faint">{updated}</p>}
        </div>
      </article>
    </div>
  )
}

// ページの中の見出し付きのまとまり。罫線で区切る
export function InfoSection({ title, children }) {
  return (
    <section className="mt-6 border-t border-line pt-5">
      <h2 className="mb-2 text-base font-bold text-ink [word-break:auto-phrase]">{title}</h2>
      <div className="space-y-2.5">{children}</div>
    </section>
  )
}

// 箇条書き。読み上げでも一覧として伝わるよう ul を使う
export function InfoList({ items }) {
  return (
    <ul className="list-disc space-y-1 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}
