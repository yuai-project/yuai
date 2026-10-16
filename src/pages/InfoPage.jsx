import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Phrases from '../components/Phrases'

// フッターから開くページの仮置き。中身は #175 で作る
export default function InfoPage({ title }) {
  return (
    <div>
      <Header title={title} back />
      <div className="px-5 pb-12 pt-6 lg:mx-auto lg:max-w-page lg:px-8 lg:pb-16">
        <p className="text-sm leading-relaxed text-ink-soft">
          <Phrases phrases={['このページは、', 'いま', '準備しています。']} />
        </p>
        <Link
          to="/"
          className="mt-4 inline-block py-2 text-sm font-bold text-brand-700 underline underline-offset-2"
        >
          ホームにもどる
        </Link>
      </div>
    </div>
  )
}
