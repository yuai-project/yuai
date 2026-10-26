import { Loader2, Lock } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import ChoiceList from '../components/intake/ChoiceList'
import { QuestionBar, QuestionCount, QuestionList } from '../components/intake/QuestionProgress'
import {
  CONCERNS,
  CONCERNS_OTHER_MAX,
  DESIRED_RELATIONSHIP,
  DESIRED_SUPPORT,
  DESIRED_SUPPORT_UNSURE,
  FREE_TEXT_MAX,
  RELATIONSHIPS,
  SUPPORT_PERSON,
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

// 「答えずに次へ」で、その問いの答えを空に戻す（1問目は必須なので無い）
const CLEAR = [
  null,
  { topics: [] },
  { concerns: [], concernsOther: '' },
  { hasSupportPerson: null },
  { desiredRelationship: null },
  { desiredSupport: [] },
  { freeText: '' },
]
const TOTAL = CLEAR.length

// AI相談の入力フォーム（1画面に1問、全7問）。送信内容は buildAdviceRequest() の形で getAdvice() に渡す。
// 選んでも自動では進まない。下の「次へ」で進み、1問目以外は「答えずに次へ」でとばせる。
export default function Consultation() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t, lang } = useI18n()
  // 結果画面の「内容を修正する」やブラウザの戻るで来た場合は、入力内容と何問目かを復元する
  const [intake, setIntake] = useState(() => ({
    ...initialIntake,
    ...location.state?.intake,
  }))
  const [step, setStep] = useState(() =>
    Math.min(Math.max(location.state?.step ?? 0, 0), TOTAL - 1),
  )
  const [loading, setLoading] = useState(false)
  const [showErrors, setShowErrors] = useState(false)
  const headingRef = useRef(null)
  const listRef = useRef(null)
  const firstRender = useRef(true)

  const update = (patch) => setIntake((s) => ({ ...s, ...patch }))
  const isLast = step === TOTAL - 1

  // 問いが変わったら上に戻し、読み上げ・キーボードの位置を新しい問いの見出しに移す
  useEffect(() => {
    window.scrollTo({ top: 0 })
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    headingRef.current?.focus({ preventScroll: true })
  }, [step])

  const goNext = () => {
    if (step === 0 && !intake.relationship) {
      setShowErrors(true)
      // エラーが見えるよう上に戻してから、最初の選択肢にフォーカスする
      window.scrollTo({ top: 0, behavior: 'smooth' })
      listRef.current?.querySelector('input')?.focus({ preventScroll: true })
      return
    }
    setStep((s) => s + 1)
  }

  const skip = () => {
    update(CLEAR[step])
    setStep((s) => s + 1)
  }

  const goBack = () => (step === 0 ? navigate(-1) : setStep((s) => s - 1))

  const submit = async (patch = {}) => {
    if (loading) return
    setLoading(true)
    const final = { ...intake, ...patch }
    setIntake(final)
    // ブラウザの「戻る」で結果画面から戻ったとき、入力内容が残るようにする
    navigate(location.pathname, { replace: true, state: { intake: final, step } })
    const request = buildAdviceRequest(final)
    // ここが将来のLLM API呼び出しポイント
    const advice = await getAdvice(request, lang)
    // adviceLang: どの言語で組み立てた回答か（結果画面で言語を切り替えたら組み立て直すため）
    navigate('/consult/result', { state: { intake: final, request, advice, adviceLang: lang } })
  }

  const relationshipError =
    showErrors && !intake.relationship ? t('consult.relationshipError') : null
  const q = { intake, update, headingRef, listRef, relationshipError }

  // スマホでは画面の高さいっぱいに広げ、短い問いでも「次へ」を画面の下に置く
  return (
    <div className="flex min-h-dvh flex-col lg:block lg:min-h-0">
      <Header
        title={t('consult.title')}
        back
        onBack={goBack}
        tone="plain"
        trailing={<QuestionCount current={step + 1} total={TOTAL} />}
      >
        <QuestionBar current={step + 1} total={TOTAL} />
      </Header>

      <div className="flex flex-1 flex-col px-5 pt-7 lg:mx-auto lg:grid lg:max-w-page lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start lg:gap-10 lg:px-8 lg:pb-16 lg:pt-8">
        {/* 全問の一覧（PCだけ。左列に固定） */}
        <aside className="hidden lg:sticky lg:top-24 lg:block">
          <QuestionList current={step + 1} names={t('consult.questionNames')} />
        </aside>

        {/* フォーム本体（PCでは白いパネル） */}
        <div className="flex flex-1 flex-col lg:rounded-xl lg:border lg:border-line lg:bg-surface lg:p-10">
          <div key={step} className="mb-8 animate-fade-up lg:mb-0">
            {step === 0 && <QuestionRelationship {...q} />}
            {step === 1 && <QuestionTopics {...q} />}
            {step === 2 && <QuestionConcerns {...q} />}
            {step === 3 && <QuestionSupportPerson {...q} />}
            {step === 4 && <QuestionDesiredRelationship {...q} />}
            {step === 5 && <QuestionDesiredSupport {...q} />}
            {step === 6 && <QuestionFreeText {...q} />}
          </div>

          {/* 次へ / 答えずに次へ。スマホでは画面の下に固定する */}
          <div className="sticky bottom-0 z-10 -mx-5 mt-auto flex flex-col gap-1 border-t border-line bg-surface px-5 pb-5 pt-3 lg:static lg:mx-0 lg:mt-10 lg:ml-auto lg:w-full lg:max-w-sm lg:border-0 lg:p-0">
            <button
              type="button"
              onClick={isLast ? () => submit() : goNext}
              disabled={loading}
              className="flex min-h-14 w-full items-center justify-center gap-1.5 rounded-xl bg-brand px-4 py-3 text-center text-base font-bold leading-snug text-brand-ink transition hover:bg-brand-400 active:scale-[0.98] disabled:opacity-90"
            >
              {loading && <Loader2 size={20} className="shrink-0 animate-spin" />}
              <span className="min-w-0">
                {loading ? t('consult.loading') : isLast ? t('consult.submit') : t('consult.next')}
              </span>
            </button>
            {step > 0 && !loading && (
              <button
                type="button"
                onClick={isLast ? () => submit(CLEAR[step]) : skip}
                className="min-h-11 w-full rounded-xl px-4 py-2 text-center text-base leading-snug text-brand-700 underline underline-offset-3 transition hover:bg-brand-50"
              >
                {isLast ? t('consult.submitWithoutText') : t('consult.skip')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- 1問分の見出し・補足・エラー ---------- */
// 見出しは問いが変わったときにフォーカスを移すので tabIndex=-1
function Question({ id, headingRef, title, hint, error, children }) {
  return (
    <section>
      <h2
        id={id}
        ref={headingRef}
        tabIndex={-1}
        className="text-xl font-bold leading-normal text-ink outline-none [word-break:auto-phrase] lg:text-2xl"
      >
        {title}
      </h2>
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-sm leading-relaxed text-ink-soft">
          {hint}
        </p>
      )}
      {/* エラーはリストの上に出す（下に出すと、画面の下に固定した「次へ」に隠れる） */}
      {error && (
        <p role="alert" className="mt-2 text-sm font-bold text-notice-700">
          {error}
        </p>
      )}
      <div className="mt-5">{children}</div>
    </section>
  )
}

/* ---------- 1問目：相手との関係（必須） ---------- */
function QuestionRelationship({ intake, update, headingRef, listRef, relationshipError }) {
  const { t, lang } = useI18n()
  return (
    <>
      <div className="mb-6 space-y-1">
        <p className="text-sm leading-relaxed text-ink-soft">{t('consult.intro')}</p>
        <p className="text-xs leading-relaxed text-ink-faint">{t('consult.introNote')}</p>
      </div>
      <Question
        id="q-relationship"
        headingRef={headingRef}
        title={t('consult.relationship')}
        hint={t('consult.chooseOne')}
        error={relationshipError}
      >
        <div ref={listRef}>
          <ChoiceList
            name="relationship"
            labelledBy="q-relationship"
            describedBy="q-relationship-hint"
            invalid={!!relationshipError}
            options={localizeOptions(RELATIONSHIPS, lang)}
            value={intake.relationship}
            onChange={(relationship) => update({ relationship })}
          />
        </div>
      </Question>
    </>
  )
}

/* ---------- 2問目：どんな内容か ---------- */
function QuestionTopics({ intake, update, headingRef }) {
  const { t, lang } = useI18n()
  return (
    <Question id="q-topics" headingRef={headingRef} title={t('consult.topics')} hint={t('consult.topicsHint')}>
      <ChoiceList
        name="topics"
        multiple
        labelledBy="q-topics"
        describedBy="q-topics-hint"
        options={localizeOptions(TOPICS, lang)}
        value={intake.topics}
        onChange={(topics) => update({ topics })}
      />
    </Question>
  )
}

/* ---------- 3問目：困っていること ---------- */
function QuestionConcerns({ intake, update, headingRef }) {
  const { t, lang } = useI18n()
  const otherSelected = intake.concerns.includes('other')
  return (
    <Question id="q-concerns" headingRef={headingRef} title={t('consult.concerns')} hint={t('common.chooseAny')}>
      <ChoiceList
        name="concerns"
        multiple
        labelledBy="q-concerns"
        describedBy="q-concerns-hint"
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
    </Question>
  )
}

/* ---------- 4問目：周囲に相談できる人 ---------- */
function QuestionSupportPerson({ intake, update, headingRef }) {
  const { t, lang } = useI18n()
  return (
    <Question id="q-support-person" headingRef={headingRef} title={t('consult.supportPerson')}>
      <ChoiceList
        name="hasSupportPerson"
        labelledBy="q-support-person"
        options={localizeOptions(SUPPORT_PERSON, lang)}
        value={intake.hasSupportPerson}
        onChange={(hasSupportPerson) => update({ hasSupportPerson })}
      />
    </Question>
  )
}

/* ---------- 5問目：これからの関係 ---------- */
function QuestionDesiredRelationship({ intake, update, headingRef }) {
  const { t, lang } = useI18n()
  return (
    <Question
      id="q-desired-relationship"
      headingRef={headingRef}
      title={t('consult.desiredRelationship')}
      hint={t('consult.desiredRelationshipHint')}
    >
      <ChoiceList
        name="desiredRelationship"
        labelledBy="q-desired-relationship"
        describedBy="q-desired-relationship-hint"
        options={localizeOptions(DESIRED_RELATIONSHIP, lang)}
        value={intake.desiredRelationship}
        onChange={(desiredRelationship) => update({ desiredRelationship })}
      />
    </Question>
  )
}

/* ---------- 6問目：求めるサポート（「わからない」は「または」の下） ---------- */
function QuestionDesiredSupport({ intake, update, headingRef }) {
  const { t, lang } = useI18n()
  return (
    <Question
      id="q-desired-support"
      headingRef={headingRef}
      title={t('consult.desiredSupport')}
      hint={t('common.chooseAny')}
    >
      <ChoiceList
        name="desiredSupport"
        multiple
        separateValue={DESIRED_SUPPORT_UNSURE}
        labelledBy="q-desired-support"
        describedBy="q-desired-support-hint"
        options={localizeOptions(DESIRED_SUPPORT, lang)}
        value={intake.desiredSupport}
        onChange={(desiredSupport) => update({ desiredSupport })}
      />
    </Question>
  )
}

/* ---------- 7問目：詳しい内容（自由記述） ---------- */
function QuestionFreeText({ intake, update, headingRef }) {
  const { t } = useI18n()
  return (
    <Question
      id="q-free-text"
      headingRef={headingRef}
      title={t('consult.freeText')}
      hint={t('consult.freeTextOptional')}
    >
      {/* 個人情報を書かないでほしいという注意（警告ではないので calm の面） */}
      <div id="q-free-text-privacy" className="mb-3 flex items-start gap-2 rounded-xl bg-calm-50 px-3.5 py-3">
        <Lock size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-calm-700" />
        <p className="text-[13px] leading-relaxed text-calm-700">{t('consult.privacyNote')}</p>
      </div>
      <textarea
        id="freeText"
        aria-labelledby="q-free-text"
        aria-describedby="q-free-text-hint q-free-text-privacy"
        value={intake.freeText}
        onChange={(e) => update({ freeText: e.target.value })}
        maxLength={FREE_TEXT_MAX}
        placeholder={t('consult.freeTextPlaceholder')}
        rows={8}
        className={`${inputClass} w-full resize-none p-3.5 leading-relaxed`}
      />
      <p className="mt-1 text-right text-xs text-ink-faint">
        {intake.freeText.length} / {FREE_TEXT_MAX}
      </p>
      <p className="mt-6 text-center text-xs leading-relaxed text-ink-faint [word-break:auto-phrase]">
        {APP.name}{t('consult.notDebateAfterName')}<br />
        {t('consult.gentleSupport')}
      </p>
    </Question>
  )
}
