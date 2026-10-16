import Header from '../components/Header'
import Phrases from '../components/Phrases'
import SupportLineList from '../components/SupportLineList'
import { getSupportLines } from '../data/supportLines'

// 電話で相談できる窓口。マイページをなくしたので、結果画面の外ではここから開く。
// 説明の文章などは #175 で足す
export default function SupportLines() {
  const lines = getSupportLines()

  return (
    <div>
      <Header title="電話で相談できる窓口" back />
      <div className="px-5 pb-12 pt-4 lg:mx-auto lg:max-w-page lg:px-8 lg:pb-16">
        <div className="rounded-2xl border border-calm-200 bg-calm-50 p-4 lg:max-w-2xl lg:p-5">
          <p className="text-sm leading-relaxed text-calm-700">
            <Phrases
              phrases={[
                'ひとりで', '抱えきれない', 'ときは、', '公的な', '相談窓口に', '頼ることも', 'できます。',
                'あなたの', '安全と', '心の健康が、', 'なによりも', '大切です。',
              ]}
            />
          </p>
          <SupportLineList lines={lines} />
        </div>
      </div>
    </div>
  )
}
