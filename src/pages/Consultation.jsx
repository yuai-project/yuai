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
import SelectField from '../components/intake/SelectField'
import StepProgress, { StepList } from '../components/intake/StepProgress'
import {
  CONCERNS,
  CONCERNS_OTHER_MAX,
  DESIRED_RELATIONSHIP,
  DESIRED_SUPPORT,
  DESIRED_SUPPORT_UNSURE,
  FREE_TEXT_MAX,
  RELATIONSHIPS,
  SUPPORT_PERSON,
  SUPPORT_PERSON_UNSURE,
  TOPICS,
  buildAdviceRequest,
  initialIntake,
  localizeOptions,
} from '../data/consultationIntake'
import { APP } from '../config'
import { getAdvice } from '../data/mockAdvice'
import { useI18n } from '../i18n/useI18n'

// iOSでフォーカス時にズームしないよう、入力欄の文字は16px（text-base）
const inputClass =
  'rounded-xl border border-control bg-surface text-base text-ink outline-none transition placeholder:text-ink-faint focus:border-brand-600 focus:ring-2 focus:ring-brand-100'

// 戻る・次へ。高さは中身に合わせ、長い文言は折り返す。色付きの影は付けない
const buttonBase =
  'flex min-h-12 min-w-0 items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-center font-bold leading-snug transition active:scale-[0.98]'
const primaryButton =
  'flex-[3_1_12rem] bg-brand text-brand-ink hover:bg-brand-400 lg:flex-[0_1_24rem]'

// AI相談の入力フォーム（3ステップ）。送信内容は buildAdviceRequest() の形で getAdvice() に渡す。
export default function Consultation() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t, lang } = useI18n()
  const STEP_TITLES = t('consult.steps')
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
    const advice = await getAdvice(request, lang)
    // adviceLang: どの言語で組み立てた回答か（結果画面で言語を切り替えたら組み立て直すため）
    navigate('/consult/result', { state: { intake, request, advice, adviceLang: lang } })
  }

  return (
    <div>
      <Header title={t('consult.title')} back onBack={goBack} tone="brand" />

      {/* ブランド色の帯。スマホはステップ名と進捗、PCは注意書き（進捗は左列とパネルに出す） */}
      <div className="bg-brand px-5 pb-6 pt-1 text-brand-ink lg:pb-9 lg:pt-0">
        <div className="lg:mx-auto lg:max-w-page lg:px-8 lg:pl-[5.25rem]">
          <div className="lg:hidden">
            <StepProgress current={step + 1} steps={STEP_TITLES} onBrand />
          </div>
          <p className="hidden text-base leading-relaxed lg:block">
            {t('common.notDiagnosisSkip')}
          </p>
        </div>
      </div>

      <div className="px-5 pb-10 pt-6 lg:mx-auto lg:grid lg:max-w-page lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start lg:gap-10 lg:px-8 lg:pb-16 lg:pt-10">
        {/* 全ステップの一覧（PCだけ。左列に固定） */}
        <aside className="hidden lg:sticky lg:top-24 lg:block">
          <StepList current={step + 1} steps={STEP_TITLES} />
        </aside>

        {/* フォーム本体（PCでは白いパネル） */}
        <div className="lg:rounded-xl lg:border lg:border-line lg:bg-surface lg:p-10">
          <div className="hidden lg:block">
            <StepProgress current={step + 1} steps={STEP_TITLES} />
          </div>
          <div key={step} className="animate-fade-up lg:mt-6">
            {step === 0 && (
              <StepAboutYou
                intake={intake}
                update={update}
                relationshipRef={relationshipRef}
                relationshipError={
                  showErrors && !intake.relationship
                    ? t('consult.relationshipError')
                    : null
                }
              />
            )}
            {step === 1 && <StepConcerns intake={intake} update={update} />}
            {step === 2 && <StepHopes intake={intake} update={update} />}
          </div>

          {/* 戻る / 次へ */}
          {/* 幅が足りないときは「次へ」が上の段、「戻る」が下の段に分かれる（wrap-reverse） */}
          <div className="mt-9 flex flex-wrap-reverse gap-3 lg:mt-10 lg:justify-end">
            {step > 0 && !loading && (
              <button
                type="button"
                onClick={goBack}
                className={`${buttonBase} flex-[1_1_6rem] border border-brand bg-surface text-brand-700 hover:bg-brand-50 lg:flex-[0_1_9rem]`}
              >
                <ArrowLeft size={18} className="shrink-0" />
                <span className="min-w-0">{t('common.back')}</span>
              </button>
            )}
            {isLast ? (
              <button
                type="button"
                onClick={submit}
                disabled={loading}
                className={`${buttonBase} ${primaryButton} disabled:opacity-90`}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="shrink-0 animate-spin" />
                    <span className="min-w-0">{t('consult.loading')}</span>
                  </>
                ) : (
                  <>
                    <MessageCircleHeart size={20} className="shrink-0" />
                    <span className="min-w-0">{t('consult.submit')}</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={goNext}
                className={`${buttonBase} ${primaryButton}`}
              >
                <span className="min-w-0">{t('consult.next')}</span>
                <ArrowRight size={18} className="shrink-0" />
              </button>
            )}
          </div>

          <p className="mt-4 text-center text-xs leading-relaxed text-ink-faint [word-break:auto-phrase] lg:text-right">
            {isLast ? (
              <>
                {APP.name}{t('consult.notDebateAfterName')}<br />
                {t('consult.gentleSupport')}
              </>
            ) : (
              t('common.skipOk')
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

/* ---------- Step 1：あなたと相手について ---------- */
function StepAboutYou({ intake, update, relationshipRef, relationshipError }) {
  const { t, lang } = useI18n()
  return (
    <div className="space-y-7">
      <div className="rounded-xl bg-brand-50 p-4">
        <p className="text-sm leading-relaxed text-ink-soft">
          {t('consult.intro')}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-ink-faint lg:hidden">
          {t('consult.introNote')}
        </p>
      </div>

      <div ref={relationshipRef} className="scroll-mt-24 lg:max-w-md">
        <FormField
          htmlFor="relationship"
          label={t('consult.relationship')}
          required
          error={relationshipError}
        >
          <SelectField
            id="relationship"
            required
            invalid={!!relationshipError}
            options={localizeOptions(RELATIONSHIPS, lang)}
            value={intake.relationship}
            onChange={(relationship) => update({ relationship })}
          />
        </FormField>
      </div>
    </div>
  )
}

/* ---------- Step 2：いま困っていること ---------- */
function StepConcerns({ intake, update }) {
  const { t, lang } = useI18n()
  const otherSelected = intake.concerns.includes('other')
  return (
    <div className="space-y-7">
      <FormField
        id="topics-label"
        label={t('consult.topics')}
        hint={t('consult.topicsHint')}
      >
        <ChoiceGroup
          labelledBy="topics-label"
          multiple
          options={localizeOptions(TOPICS, lang)}
          value={intake.topics}
          onChange={(topics) => update({ topics })}
        />
      </FormField>

      <FormField
        id="concerns-label"
        label={t('consult.concerns')}
        hint={t('common.chooseAny')}
      >
        <ChoiceGroup
          labelledBy="concerns-label"
          multiple
          variant="card"
          options={localizeOptions(CONCERNS, lang)}
          value={intake.concerns}
          onChange={(concerns) => update({ concerns })}
        />
        {otherSelected && (
          <div className="mt-3 animate-fade-up">
            <textarea
              aria-label={t('consult.concernsOtherLabel')}
              value={intake.concernsOther}
              onChange={(e) => update({ concernsOther: e.target.value })}
              maxLength={CONCERNS_OTHER_MAX}
              rows={2}
              placeholder={t('consult.concernsOtherPlaceholder')}
              className={`${inputClass} w-full resize-none p-3.5 leading-relaxed`}
            />
          </div>
        )}
      </FormField>

      <FormField id="support-person-label" label={t('consult.supportPerson')}>
        <div className="lg:max-w-md">
          <ChoiceGroup
            labelledBy="support-person-label"
            variant="grid"
            subtleValues={[SUPPORT_PERSON_UNSURE]}
            options={localizeOptions(SUPPORT_PERSON, lang)}
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
  const { t, lang } = useI18n()
  return (
    <div className="space-y-7">
      <FormField
        id="desired-relationship-label"
        label={t('consult.desiredRelationship')}
        hint={t('consult.desiredRelationshipHint')}
      >
        <ChoiceGroup
          labelledBy="desired-relationship-label"
          options={localizeOptions(DESIRED_RELATIONSHIP, lang)}
          value={intake.desiredRelationship}
          onChange={(desiredRelationship) => update({ desiredRelationship })}
        />
      </FormField>

      <FormField
        id="desired-support-label"
        label={t('consult.desiredSupport')}
        hint={t('common.chooseAny')}
      >
        <ChoiceGroup
          labelledBy="desired-support-label"
          multiple
          variant="card"
          exclusiveValue={DESIRED_SUPPORT_UNSURE}
          options={localizeOptions(DESIRED_SUPPORT, lang)}
          value={intake.desiredSupport}
          onChange={(desiredSupport) => update({ desiredSupport })}
        />
      </FormField>

      <FormField htmlFor="freeText" label={t('consult.freeText')}>
        {/* プライバシー注意 */}
        <div className="mb-3 flex items-start gap-2 rounded-xl bg-cream p-3">
          <ShieldCheck size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-brand-700" />
          <p className="text-xs leading-relaxed text-ink-soft">
            {t('consult.privacyNote')}
          </p>
        </div>
        <textarea
          id="freeText"
          value={intake.freeText}
          onChange={(e) => update({ freeText: e.target.value })}
          maxLength={FREE_TEXT_MAX}
          placeholder={t('consult.freeTextPlaceholder')}
          rows={7}
          className={`${inputClass} w-full resize-none p-4 leading-relaxed`}
        />
        <p className="mt-1 text-right text-[11px] text-ink-faint">
          {intake.freeText.length} / {FREE_TEXT_MAX}
        </p>
      </FormField>
    </div>
  )
}
