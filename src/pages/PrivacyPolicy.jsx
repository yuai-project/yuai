import InfoPage, { InfoList, InfoSection } from './InfoPage'

// プライバシーポリシー（#175）。書いてあることと実装を必ず一致させる。
// - 相談の入力内容は保存も送信もしない（ブラウザの履歴の state に、タブを開いている間だけ残る）
// - アクセス解析は #176 で Google Analytics を入れる予定。入れるまでは USES_ANALYTICS を false のままにし、
//   「使っていない」と書く。入れたら true にして、外部送信の表も出す
// 公開前にチームか運営の方に確認してもらう
const USES_ANALYTICS = false

export default function PrivacyPolicy() {
  return (
    <InfoPage
      title="プライバシーポリシー"
      lead="Yorido は、身近な人のことで悩む方のためのサービスです。センシティブな内容を扱うため、必要のない情報は集めないことを基本にしています。"
      updated="制定日：2026年10月16日"
    >
      <InfoSection title="相談の入力内容">
        <p>フォームに入力・選択した内容は、保存も、外部への送信もしません。あなたの端末のブラウザの中だけで処理します。</p>
        <p>
          「戻る」で入力し直せるように、入力内容はそのタブを開いている間だけブラウザに残り、タブを閉じると消えます。会員登録やログインの機能はありません。
        </p>
      </InfoSection>

      <InfoSection title="アクセス解析">
        {USES_ANALYTICS ? (
          <>
            <p>
              サービスの改善のため、Google LLC の Google Analytics を使っています。Google Analytics は Cookie を使って、次のような情報を集めます。個人を特定する情報は含みません。
            </p>
            <InfoList items={['見たページと、見た時間', '端末・ブラウザの種類', 'おおまかな地域', 'どこから Yorido に来たか']} />
            <p>相談の入力内容（選んだ項目や書いた文章）は、Google Analytics に送りません。</p>
            <p>
              集めた情報は、Google のプライバシーポリシーに沿って扱われます。Google Analytics を無効にしたいときは、Google が提供する「オプトアウト アドオン」を使うか、ブラウザで Cookie を無効にしてください。
            </p>
          </>
        ) : (
          <p>現在、アクセス解析のツールは使っていません。使い始めるときは、このページでお知らせします。</p>
        )}
      </InfoSection>

      {USES_ANALYTICS && (
        <InfoSection title="外部に送る情報">
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
            <dt className="font-bold text-ink">送り先</dt>
            <dd>Google LLC（Google Analytics）</dd>
            <dt className="font-bold text-ink">送る情報</dt>
            <dd>見たページ、端末・ブラウザの情報、Cookie の識別子 など</dd>
            <dt className="font-bold text-ink">目的</dt>
            <dd>利用状況を知り、サービスを改善するため</dd>
          </dl>
        </InfoSection>
      )}

      <InfoSection title="サーバーの記録">
        <p>
          Yorido は Cloudflare のサービスで公開しています。安全に運用するため、IP アドレスなどのアクセスの記録が、Cloudflare に一時的に残ることがあります。
        </p>
      </InfoSection>

      <InfoSection title="外部のサイト">
        <p>紹介している記事や本のリンク先では、それぞれのサイトの方針で情報が扱われます。</p>
      </InfoSection>

      <InfoSection title="このポリシーの変更">
        <p>内容を変えるときは、このページでお知らせします。</p>
      </InfoSection>

      <InfoSection title="お問い合わせ">
        <p>お問い合わせの窓口は、いま準備しています。</p>
      </InfoSection>
    </InfoPage>
  )
}
