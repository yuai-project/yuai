import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  MessageCircleHeart,
  ShieldCheck,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import ChoiceGroup from '../components/intake/ChoiceGroup'
import FormField from '../components/intake/FormField'
import ImmersionSlider from '../components/intake/ImmersionSlider'
import SelectField from '../components/intake/SelectField'
import StepProgress from '../components/intake/StepProgress'
import {
  CONCERNS,
  CONCERNS_OTHER_MAX,
  DESIRED_RELATIONSHIP,
  DESIRED_SUPPORT,
  DESIRED_SUPPORT_UNSURE,
  DURATIONS,
  FREE_TEXT_MAX,
  GENDERS,
  RELATIONSHIPS,
  SUPPORT_PERSON,
  SUPPORT_PERSON_UNSURE,
  TOPICS,
  buildAdviceRequest,
  initialIntake,
} from '../data/consultationIntake'
import { getAdvice } from '../data/mockAdvice'

const STEP_TITLES = [
  'あなたと相手について',
  'いま困っていること',
  'これからどうしたいか',
]

const placeholder = `最近、父が健康に関する情報を強く信じるようになりました。
否定すると怒ってしまうので、どう話せばいいか分かりません。
自分自身も少し疲れています。`

// iOSでフォーカス時にズームしないよう、入力欄の文字は16px（text-base）
const inputClass =
  'rounded-xl border border-line bg-surface text-base text-ink outline-none transition placeholder:text-ink-faint/70 focus:border-brand-600 focus:ring-2 focus:ring-brand-100'

// PC幅で2項目を横に並べる行。スマホでは縦に並び、読む順序は同じ。
const pairRow = 'space-y-7 lg:grid lg:grid-cols-2 lg:gap-x-6 lg:space-y-0'

// AI相談の入力フォーム（3ステップ）。送信内容は buildAdviceRequest() の形で getAdvice() に渡す。
export default function Consultation() {
  const navigate = useNavigate()
  const location = useLocation()
  // 結果画面の「内容を修正する」やブラウザの戻るで来た場合は、入力内容を復元する
  const [intake, setIntake] = useState(() => ({
    ...initialIntake,
    ...location.state?.intake,
  }))
  const [step, setStep] = useState(() => location.state?.step ?? 0)
  const [loading, setLoading] = useState(false)
  const [showErrors, setShowErrors] = useState(false)
  const relationshipRef = useRef(null)

  const update = (patch) => setIntake((s) => ({ ...s, ...patch }))
  const isLast = step === STEP_TITLES.length - 1

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [step])

  const goNext = () => {
    if (step === 0 && !intake.relationship) {
      setShowErrors(true)
      relationshipRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      relationshipRef.current?.querySelector('select')?.focus({ preventScroll: true })
      return
    }
    setStep((s) => s + 1)
  }

  const goBack = () => (step === 0 ? navigate(-1) : setStep((s) => s - 1))

  const submit = async () => {
    if (loading) return
    setLoading(true)
    // ブラウザの「戻る」で結果画面から戻ったとき、入力内容が残るようにする
    navigate(location.pathname, { replace: true, state: { intake, step } })
    const request = buildAdviceRequest(intake)
    // ここが将来のLLM API呼び出しポイント
    const advice = await getAdvice(request)
    navigate('/consult/result', { state: { intake, request, advice } })
  }

  return (
    <div>
      <Header title="AIに相談する" back onBack={goBack} />

      <div className="px-5 pb-10 pt-4 lg:mx-auto lg:grid lg:max-w-page lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start lg:gap-10 lg:px-8 lg:pb-16 lg:pt-6">
        {/* 進捗（PCでは左列に固定） */}
        <aside className="lg:sticky lg:top-24">
          <StepProgress current={step + 1} steps={STEP_TITLES} />
          <p className="mt-6 hidden rounded-xl bg-brand-50 p-3 text-xs leading-relaxed text-brand-700 lg:block">
            これは診断ではありません。答えたくない項目は、とばして大丈夫です。
          </p>
        </aside>

        {/* フォーム本体（PCでは白いパネル） */}
        <div className="lg:rounded-3xl lg:border lg:border-line lg:bg-surface lg:p-10 lg:shadow-[0_1px_3px_rgba(60,50,40,0.04)]">
          <div key={step} className="mt-5 animate-fade-up lg:mt-0">
            {step === 0 && (
              <StepAboutYou
                intake={intake}
                update={update}
                relationshipRef={relationshipRef}
                relationshipError={
                  showErrors && !intake.relationship
                    ? '相手との関係を選んでください'
                    : null
                }
              />
            )}
            {step === 1 && <StepConcerns intake={intake} update={update} />}
            {step === 2 && <StepHopes intake={intake} update={update} />}
          </div>

          {/* 戻る / 次へ */}
          <div className="mt-9 flex gap-3 lg:mt-10">
            {step > 0 && !loading && (
              <button
                type="button"
                onClick={goBack}
                className="flex w-28 shrink-0 items-center justify-center gap-1 rounded-2xl border border-brand-200 bg-surface py-3.5 font-bold text-brand-700 transition hover:bg-brand-50 active:scale-[0.98] lg:w-36"
              >
                <ArrowLeft size={18} />
                戻る
              </button>
            )}
            {isLast ? (
              <button
                type="button"
                onClick={submit}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-brand py-3.5 font-bold text-brand-ink shadow-[0_8px_20px_rgba(242,138,69,0.28)] transition hover:bg-brand-400 active:scale-[0.98] disabled:opacity-90 lg:ml-auto lg:max-w-sm"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    あなたの気持ちを整理しています…
                  </>
                ) : (
                  <>
                    <MessageCircleHeart size={20} />
                    AIに相談する
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={goNext}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-brand py-3.5 font-bold text-brand-ink shadow-[0_8px_20px_rgba(242,138,69,0.28)] transition hover:bg-brand-400 active:scale-[0.98] lg:ml-auto lg:max-w-sm"
              >
                次へ
                <ArrowRight size={18} />
              </button>
            )}
          </div>

          <p className="mt-4 text-center text-xs leading-relaxed text-ink-faint lg:text-right">
            {isLast ? (
              <>
                このAIは相手を論破するためのものではありません。<br />
                あなたと大切な人の関係を、そっと支えます。
              </>
            ) : (
              '答えたくない項目は、とばして大丈夫です。'
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

/* ---------- Step 1：あなたと相手について ---------- */
function StepAboutYou({ intake, update, relationshipRef, relationshipError }) {
  return (
    <div className="space-y-7">
      <div className="rounded-2xl bg-gradient-to-b from-brand-50 to-cream p-4">
        <p className="text-sm leading-relaxed text-ink-soft">
          相談の前に、いまの状況を少しだけ教えてください。あなたに合ったヒントや、体験談・相談先をご案内しやすくなります。
        </p>
        <p className="mt-2 text-xs leading-relaxed text-ink-faint lg:hidden">
          これは診断ではありません。分かる範囲で大丈夫です。
        </p>
      </div>

      <div className={pairRow}>
        <FormField htmlFor="userAge" label="あなたの年齢">
          <div className="flex items-center gap-2">
            <input
              id="userAge"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              maxLength={3}
              value={intake.userAge}
              onChange={(e) => update({ userAge: e.target.value.replace(/\D/g, '') })}
              placeholder="例）35"
              className={`${inputClass} min-h-12 w-24 px-3.5 py-2.5`}
            />
            <span className="text-sm text-ink-soft">歳</span>
          </div>
        </FormField>

        <FormField htmlFor="userGender" label="あなたの性別">
          <SelectField
            id="userGender"
            options={GENDERS}
            value={intake.userGender}
            onChange={(userGender) => update({ userGender })}
          />
        </FormField>
      </div>

      <div className={pairRow}>
        <div ref={relationshipRef} className="scroll-mt-24">
          <FormField
            htmlFor="relationship"
            label="相手との関係"
            required
            error={relationshipError}
          >
            <SelectField
              id="relationship"
              required
              invalid={!!relationshipError}
              options={RELATIONSHIPS}
              value={intake.relationship}
              onChange={(relationship) => update({ relationship })}
            />
          </FormField>
        </div>

        <FormField htmlFor="duration" label="いつ頃から気になっていますか？">
          <SelectField
            id="duration"
            options={DURATIONS}
            value={intake.duration}
            onChange={(duration) => update({ duration })}
          />
        </FormField>
      </div>

      <FormField
        id="immersion-label"
        label="あなたから見て、どのくらい強くのめり込んでいるように感じますか？"
        hint="医学的な評価ではありません。あなたが感じているままで大丈夫です。"
      >
        <ImmersionSlider
          labelledBy="immersion-label"
          value={intake.immersionLevel}
          onChange={(immersionLevel) => update({ immersionLevel })}
        />
      </FormField>
    </div>
  )
}

/* ---------- Step 2：いま困っていること ---------- */
function StepConcerns({ intake, update }) {
  const otherSelected = intake.concerns.includes('other')
  return (
    <div className="space-y-7">
      <FormField
        id="topics-label"
        label="どんな内容についてですか？"
        hint="いくつでも選べます。内容が正しいかどうかを判断するものではありません。"
      >
        <ChoiceGroup
          labelledBy="topics-label"
          multiple
          options={TOPICS}
          value={intake.topics}
          onChange={(topics) => update({ topics })}
        />
      </FormField>

      <FormField
        id="concerns-label"
        label="どんなことで困っていますか？"
        hint="いくつでも選べます。"
      >
        <ChoiceGroup
          labelledBy="concerns-label"
          multiple
          variant="card"
          options={CONCERNS}
          value={intake.concerns}
          onChange={(concerns) => update({ concerns })}
        />
        {otherSelected && (
          <div className="mt-3 animate-fade-up">
            <textarea
              aria-label="その他の困っていること"
              value={intake.concernsOther}
              onChange={(e) => update({ concernsOther: e.target.value })}
              maxLength={CONCERNS_OTHER_MAX}
              rows={2}
              placeholder="例）夜遅くに長い電話がかかってくる"
              className={`${inputClass} w-full resize-none rounded-2xl p-3.5 leading-relaxed`}
            />
          </div>
        )}
      </FormField>

      <FormField id="support-person-label" label="周囲に相談できる人はいますか？">
        <div className="lg:max-w-md">
          <ChoiceGroup
            labelledBy="support-person-label"
            variant="grid"
            subtleValues={[SUPPORT_PERSON_UNSURE]}
            options={SUPPORT_PERSON}
            value={intake.hasSupportPerson}
            onChange={(hasSupportPerson) => update({ hasSupportPerson })}
          />
        </div>
      </FormField>
    </div>
  )
}

/* ---------- Step 3：これからどうしたいか ---------- */
function StepHopes({ intake, update }) {
  return (
    <div className="space-y-7">
      <FormField
        id="desired-relationship-label"
        label="その人と今後どんな関係でいたいですか？"
        hint="どれを選んでも大丈夫です。距離を置くことも、あなたを守る大切な選択肢です。"
      >
        <ChoiceGroup
          labelledBy="desired-relationship-label"
          options={DESIRED_RELATIONSHIP}
          value={intake.desiredRelationship}
          onChange={(desiredRelationship) => update({ desiredRelationship })}
        />
      </FormField>

      <FormField
        id="desired-support-label"
        label="どんなサポートを求めていますか？"
        hint="いくつでも選べます。"
      >
        <ChoiceGroup
          labelledBy="desired-support-label"
          multiple
          variant="card"
          exclusiveValue={DESIRED_SUPPORT_UNSURE}
          options={DESIRED_SUPPORT}
          value={intake.desiredSupport}
          onChange={(desiredSupport) => update({ desiredSupport })}
        />
      </FormField>

      <FormField htmlFor="freeText" label="もう少し詳しく教えてください">
        {/* プライバシー注意 */}
        <div className="mb-3 flex items-start gap-2 rounded-xl border border-calm-200 bg-calm-50 p-3">
          <ShieldCheck size={17} className="mt-0.5 shrink-0 text-calm-700" />
          <p className="text-xs leading-relaxed text-calm-700">
            個人が特定できる情報（実名・住所・勤務先・SNSアカウントなど）は入力しないでください。
          </p>
        </div>
        <textarea
          id="freeText"
          value={intake.freeText}
          onChange={(e) => update({ freeText: e.target.value })}
          maxLength={FREE_TEXT_MAX}
          placeholder={placeholder}
          rows={7}
          className={`${inputClass} w-full resize-none rounded-2xl p-4 leading-relaxed shadow-inner`}
        />
        <p className="mt-1 text-right text-[11px] text-ink-faint">
          {intake.freeText.length} / {FREE_TEXT_MAX}
        </p>
      </FormField>
    </div>
  )
}
