import ShareSiteButton from '../components/ShareSiteButton'
import { translate } from '../i18n/translate'
import InfoPage, { InfoList, InfoSection } from './InfoPage'

// 運営について（#175）。チーム名などは載せず、Yorido の目的と大切にしていることだけを書く。
// このページはまだ日本語だけなので、サービスの説明も日本語の辞書から出す（#215）
// 「大切にしていること」は CLAUDE.md の「絶対に守るルール」を利用者向けの言葉にしたもの
export default function About() {
  return (
    <InfoPage title="運営について">
      <InfoSection title="Yorido について">
        <p>{translate('ja', 'app.description')}</p>
        <p>「{translate('ja', 'app.concept')}」を大切にしています。</p>
      </InfoSection>

      <InfoSection title="大切にしていること">
        <InfoList
          items={[
            '相手やあなたの状態を決めつけません',
            '人ではなく、いま起きている状況に目を向けます',
            '相手が必ず変わるとはお約束しません',
            'あなたの安全を、なによりも優先します',
            '特定の人や団体、考え方を攻撃しません',
          ]}
        />
      </InfoSection>

      <InfoSection title="Yorido を伝える">
        <p>同じように悩んでいる人がいたら、このサイトを伝えることもできます。</p>
        <ShareSiteButton />
      </InfoSection>

      <InfoSection title="お問い合わせ">
        <p>お問い合わせの窓口は、いま準備しています。</p>
      </InfoSection>
    </InfoPage>
  )
}
