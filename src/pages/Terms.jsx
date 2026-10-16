import { Link } from 'react-router-dom'
import InfoPage, { InfoList, InfoSection } from './InfoPage'

// ご利用にあたって（#175）。できること・できないこと、安全、外部サイト、情報の正確さ。
// 免責の書き方は法的な確認が済んでいない。公開前にチームか運営の方に見てもらう
export default function Terms() {
  return (
    <InfoPage
      title="ご利用にあたって"
      lead="Yorido を使う前に、知っておいてほしいことをまとめました。"
      updated="最終更新日：2026年10月16日"
    >
      <InfoSection title="Yorido でできること">
        <p>いくつかの質問に答えると、あなたの状況に合わせて、次のものを案内します。</p>
        <InfoList items={['関わり方のヒント', '近い状況の記事や本', '電話で相談できる窓口']} />
      </InfoSection>

      <InfoSection title="Yorido ではできないこと">
        <InfoList
          items={[
            '相手やあなたの心の状態を診断すること',
            '医療・法律についての助言',
            '緊急のときの支援',
            '相手の考えが変わることのお約束',
          ]}
        />
      </InfoSection>

      <InfoSection title="あなたの安全をいちばんに">
        <p>
          怒鳴られる、脅されていると感じる、生活や仕事に大きな影響が出ている。そんなときは、無理に話さなくて大丈夫です。距離を置くことも、あなたを守る大切な選択肢です。
        </p>
        <p>
          身の危険を感じるときは、ためらわずに警察（110）に連絡してください。つらいときは「
          <Link to="/support" className="font-bold text-brand-700 underline underline-offset-2">
            電話で相談できる窓口
          </Link>
          」も頼ってください。
        </p>
      </InfoSection>

      <InfoSection title="紹介している外部のサイトについて">
        <p>
          記事や本は、内容を確認したうえで紹介していますが、リンク先の内容や正確さは、それぞれの発信元が責任を持つものです。リンク先での個人情報の扱いは、各サイトの方針をご確認ください。
        </p>
      </InfoSection>

      <InfoSection title="情報の正確さについて">
        <p>
          ヒントや窓口の情報は、作成した時点のものです。電話番号や受付時間は変わることがあるので、最新の情報は各窓口の公式サイトでご確認ください。
        </p>
        <p>
          Yorido の情報は、判断するときの参考のひとつとしてお使いください。必要に応じて、専門家や公的な窓口にもご相談ください。
        </p>
      </InfoSection>

      <InfoSection title="内容の変更">
        <p>Yorido の内容や、このページは、予告なく変わることがあります。</p>
      </InfoSection>
    </InfoPage>
  )
}
