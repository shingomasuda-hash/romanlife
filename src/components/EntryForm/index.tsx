'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Field, FieldGroup, SelectCard } from './Field';
import { Confirm } from './Confirm';
import { Complete, type EntryResult } from './Complete';
import { Icon } from '../Icon';
import { EVENT_DATES, GRADUATION_OPTIONS, REFERRAL_OPTIONS, getEventDate } from '@/data/event';
import { EMPTY_FORM, FIELD_LABELS, FIELD_ORDER, entrySchema, type EntryFormState } from '@/lib/schema';
import { useEntryStore } from '@/lib/entryStore';
import { useDeadline } from '@/lib/useDeadline';
import { prefersReducedMotion } from '@/lib/scroll';
import { captureTracking, trackEvent, type Tracking } from '@/lib/tracking';
import styles from './EntryForm.module.css';

type Step = 'input' | 'confirm' | 'complete';

const PRIVACY_POLICY_URL = process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL ?? '';
const QUESTION_MAX = 500;

export function EntryForm() {
  const { closed, allClosed } = useDeadline();
  const store = useEntryStore();

  const [step, setStep] = useState<Step>('input');
  const [form, setForm] = useState<EntryFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [result, setResult] = useState<EntryResult | null>(null);

  const trackingRef = useRef<Tracking | null>(null);
  const renderedAtRef = useRef<number>(0);
  const submissionIdRef = useRef<string>('');
  const inFlightRef = useRef(false);
  const startedRef = useRef(false);
  const sessionGroupRef = useRef<HTMLFieldSetElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  /* --- 初期化：UTM・リファラーの取得（画面には表示しない） --- */
  useEffect(() => {
    trackingRef.current = captureTracking();
    renderedAtRef.current = Date.now();
    trackEvent('form_view');
  }, []);

  /* --- 日程カードからの選択を反映し、時間帯へ視線を誘導 --- */
  useEffect(() => {
    if (!store.eventDateId) return;
    setForm((prev) => ({ ...prev, eventDateId: store.eventDateId }));
    setErrors((prev) => {
      if (!prev.eventDateId) return prev;
      const next = { ...prev };
      delete next.eventDateId;
      return next;
    });
    // フォームへスクロールが終わるころに、参加希望時間へ視線を移す
    const timer = window.setTimeout(() => {
      sessionGroupRef.current?.scrollIntoView({
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        block: 'center',
      });
      sessionGroupRef.current?.querySelector<HTMLInputElement>('input:not(:disabled)')?.focus({
        preventScroll: true,
      });
    }, 650);
    return () => window.clearTimeout(timer);
  }, [store.eventDateId, store.focusSessionNonce]);

  const update = useCallback(
    <K extends keyof EntryFormState>(key: K, value: EntryFormState[K]) => {
      if (!startedRef.current) {
        startedRef.current = true;
        trackEvent('form_start');
      }
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        if (!prev[key as string]) return prev;
        const next = { ...prev };
        delete next[key as string];
        return next;
      });
    },
    [],
  );

  const payload = useMemo(
    () => ({
      ...form,
      privacyAgreed: form.privacyAgreed,
      renderedAt: renderedAtRef.current,
      tracking: trackingRef.current ?? undefined,
    }),
    [form],
  );

  const focusField = useCallback((key: string) => {
    const wrapper = document.getElementById(`field-${key}`);
    const el =
      wrapper?.querySelector<HTMLElement>(
        'input:not([type="hidden"]):not(:disabled), select, textarea',
      ) ?? wrapper;
    if (!el) return;
    el.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'center',
    });
    window.setTimeout(() => el.focus({ preventScroll: true }), 150);
  }, []);

  /* --- 「入力内容を確認する」 --- */
  const handleConfirm = () => {
    const parsed = entrySchema.safeParse(payload);
    const nextErrors: Record<string, string> = {};

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? 'form');
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      }
    }

    // 締切済みの日程は選択できない（送信 API 側でも再検証します）
    if (form.eventDateId && closed[form.eventDateId]) {
      nextErrors.eventDateId = 'この日程は受付を終了しました。別の日程を選択してください。';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      const first = FIELD_ORDER.find((k) => nextErrors[k]);
      window.setTimeout(() => {
        summaryRef.current?.scrollIntoView({
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
          block: 'center',
        });
        if (first) focusField(first);
      }, 60);
      return;
    }

    setErrors({});
    setSendError(null);
    // 同じ申込みを一意に識別する ID（再送しても重複登録されないようにする）
    submissionIdRef.current =
      globalThis.crypto?.randomUUID?.() ??
      `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    setStep('confirm');
    trackEvent('form_confirm_view');
    window.setTimeout(() => scrollFormTop(), 40);
  };

  /* --- 「この内容で申し込む」 --- */
  const handleSubmit = async () => {
    // 二重送信防止：連打・戻る操作・通信遅延でも 1 度しか送らない
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setSubmitting(true);
    setSendError(null);

    try {
      const res = await fetch('/api/event-entry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Submission-Id': submissionIdRef.current,
        },
        body: JSON.stringify({ ...payload, submissionId: submissionIdRef.current }),
      });

      const data = (await res.json().catch(() => null)) as
        | { ok: true; result: EntryResult }
        | { ok: false; message?: string; fieldErrors?: Record<string, string> }
        | null;

      if (!res.ok || !data || data.ok !== true) {
        // サーバー側バリデーションで弾かれた場合は入力画面へ戻して該当項目を示す
        if (data && data.ok === false && data.fieldErrors) {
          setErrors(data.fieldErrors);
          setStep('input');
          const first = FIELD_ORDER.find((k) => data.fieldErrors?.[k]);
          window.setTimeout(() => first && focusField(first), 120);
        }
        setSendError(
          (data && data.ok === false && data.message) ||
            '送信中に問題が発生しました。時間をおいて再度お試しください。',
        );
        trackEvent('entry_error', { status: res.status });
        return;
      }

      setResult(data.result);
      setStep('complete');
      trackEvent('entry_complete', {
        eventDateId: data.result.eventDateId,
        sessionId: data.result.sessionId,
      });
      window.setTimeout(() => scrollFormTop(), 40);
    } catch {
      setSendError('送信中に問題が発生しました。時間をおいて再度お試しください。');
      trackEvent('entry_error', { status: 0 });
    } finally {
      setSubmitting(false);
      inFlightRef.current = false;
    }
  };

  const handleBackToInput = () => {
    // 入力済みの内容は保持したまま入力画面へ戻す
    setStep('input');
    setSendError(null);
    window.setTimeout(() => scrollFormTop(), 40);
  };

  const errorList = FIELD_ORDER.filter((k) => errors[k]).map((k) => ({
    key: k,
    label: FIELD_LABELS[k] ?? k,
    message: errors[k],
  }));

  const selectedDate = getEventDate(form.eventDateId);

  return (
    <section
      className={`section ${styles.section}`}
      id="entry-form"
      aria-labelledby="entry-form-title"
      data-form-step={step}
    >
      <div className="container">
        <div className={styles.head}>
          <p className="eyebrow">Section 12 — Entry</p>
          <h2 id="entry-form-title" className={`section-title ${styles.title}`}>
            <span className="phrase">オープン・カンパニー</span>
            <span className="phrase">参加申込み</span>
          </h2>
          <p className={styles.headNote}>
            必要事項をご入力のうえ、内容を確認してお申し込みください。
          </p>
        </div>

        <div className={styles.shell}>
          {/* --- 進行ステップ --- */}
          <ol className={styles.steps} aria-label="申込みの進行状況">
            {(
              [
                ['input', '入力'],
                ['confirm', '確認'],
                ['complete', '完了'],
              ] as const
            ).map(([key, label], i, arr) => {
              const order = arr.findIndex(([k]) => k === step);
              const state = i === order ? 'current' : i < order ? 'done' : 'todo';
              return (
                <li key={key} style={{ display: 'contents' }}>
                  <span
                    className={`${styles.step} ${
                      state === 'current'
                        ? styles.stepCurrent
                        : state === 'done'
                          ? styles.stepDone
                          : ''
                    }`}
                    aria-current={state === 'current' ? 'step' : undefined}
                  >
                    <span className={styles.stepMark} aria-hidden="true">
                      {state === 'done' ? <Icon name="check" size={13} /> : i + 1}
                    </span>
                    <span>{label}</span>
                  </span>
                  {i < arr.length - 1 ? <span className={styles.stepBar} aria-hidden="true" /> : null}
                </li>
              );
            })}
          </ol>

          {/* 送信中・完了を支援技術へ伝える */}
          <p className="visually-hidden" role="status" aria-live="polite">
            {submitting
              ? '送信しています。しばらくお待ちください。'
              : step === 'complete'
                ? '申込みが完了しました。'
                : ''}
          </p>

          {allClosed ? (
            <div className={styles.closedBox}>
              <Icon name="alert" size={40} className={styles.closedIcon} />
              <h3 className={styles.closedTitle}>本イベントの参加申込み受付は終了しました。</h3>
              <p className={styles.closedText}>
                たくさんのお申し込みをありがとうございました。
                <br />
                今後の採用情報は、株式会社ロマンライフの採用サイトをご確認ください。
              </p>
            </div>
          ) : step === 'complete' && result ? (
            <Complete result={result} />
          ) : step === 'confirm' ? (
            <Confirm
              form={form}
              submitting={submitting}
              sendError={sendError}
              onBack={handleBackToInput}
              onSubmit={handleSubmit}
            />
          ) : (
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                handleConfirm();
              }}
            >
              {/* --- エラーサマリー --- */}
              {errorList.length > 0 ? (
                <div className={styles.summary} ref={summaryRef} role="alert" tabIndex={-1}>
                  <Icon name="alert" size={20} className={styles.summaryIcon} />
                  <div>
                    <p className={styles.summaryTitle}>
                      入力内容に{errorList.length}件の確認が必要な項目があります
                    </p>
                    <div className={styles.summaryList}>
                      {errorList.map((e) => (
                        <a
                          key={e.key}
                          href={`#field-${e.key}`}
                          className={styles.summaryLink}
                          onClick={(ev) => {
                            ev.preventDefault();
                            focusField(e.key);
                          }}
                        >
                          {e.label}：{e.message}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {sendError ? (
                <div className={styles.summary} role="alert">
                  <Icon name="alert" size={20} className={styles.summaryIcon} />
                  <div>
                    <p className={styles.summaryTitle}>{sendError}</p>
                  </div>
                </div>
              ) : null}

              <div className={styles.fields}>
                {/* 1｜参加希望日 */}
                <FieldGroup
                  id="eventDateId"
                  legend="参加希望日"
                  required
                  error={errors.eventDateId}
                  help="どちらの日程もプログラム内容は同じです。"
                >
                  <div className={styles.cards}>
                    {EVENT_DATES.map((d) => (
                      <SelectCard
                        key={d.id}
                        name="eventDateId"
                        value={d.id}
                        checked={form.eventDateId === d.id}
                        disabled={closed[d.id]}
                        onChange={(v) => update('eventDateId', v)}
                        title={d.displayDate}
                        meta={`${d.shortDate} ${d.weekday}`}
                        sub={closed[d.id] ? undefined : `${d.deadlineDisplayShort}締切`}
                        closedLabel={closed[d.id] ? '受付終了' : undefined}
                      />
                    ))}
                  </div>
                </FieldGroup>

                {/* 2｜参加希望時間 */}
                <fieldset
                  className={`${styles.field} ${errors.sessionId ? styles.hasError : ''}`}
                  id="field-sessionId"
                  ref={sessionGroupRef}
                  aria-describedby={errors.sessionId ? 'sessionId-error' : undefined}
                  aria-invalid={errors.sessionId ? true : undefined}
                >
                  <div className={styles.labelRow}>
                    <legend className={styles.label}>参加希望時間</legend>
                    <span className={styles.req}>必須</span>
                  </div>
                  <div className={styles.cards}>
                    {EVENT_DATES[0].sessions.map((s) => (
                      <SelectCard
                        key={s.id}
                        name="sessionId"
                        value={s.id}
                        checked={form.sessionId === s.id}
                        onChange={(v) => update('sessionId', v)}
                        title={s.label}
                        meta={s.time}
                      />
                    ))}
                  </div>
                  {errors.sessionId ? (
                    <p className={styles.error} id="sessionId-error">
                      <Icon name="alert" size={15} className={styles.errorIcon} />
                      <span>{errors.sessionId}</span>
                    </p>
                  ) : null}
                </fieldset>

                {/* 3｜氏名 */}
                <Field id="name" label="氏名" required error={errors.name}>
                  {({ describedBy, invalid }) => (
                    <input
                      id="name"
                      name="name"
                      className={styles.input}
                      type="text"
                      autoComplete="name"
                      placeholder="例：山田 花子"
                      value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                      aria-describedby={describedBy}
                      aria-invalid={invalid || undefined}
                      aria-required="true"
                    />
                  )}
                </Field>

                {/* 4｜氏名フリガナ */}
                <Field
                  id="nameKana"
                  label="氏名フリガナ"
                  required
                  help="全角カタカナでご入力ください。"
                  error={errors.nameKana}
                >
                  {({ describedBy, invalid }) => (
                    <input
                      id="nameKana"
                      name="nameKana"
                      className={styles.input}
                      type="text"
                      placeholder="例：ヤマダ ハナコ"
                      value={form.nameKana}
                      onChange={(e) => update('nameKana', e.target.value)}
                      aria-describedby={describedBy}
                      aria-invalid={invalid || undefined}
                      aria-required="true"
                    />
                  )}
                </Field>

                {/* 5｜学校名 */}
                <Field id="school" label="大学・大学院・学校名" required error={errors.school}>
                  {({ describedBy, invalid }) => (
                    <input
                      id="school"
                      name="school"
                      className={styles.input}
                      type="text"
                      autoComplete="organization"
                      placeholder="例：〇〇大学"
                      value={form.school}
                      onChange={(e) => update('school', e.target.value)}
                      aria-describedby={describedBy}
                      aria-invalid={invalid || undefined}
                      aria-required="true"
                    />
                  )}
                </Field>

                {/* 6｜学部・学科・研究科 */}
                <Field id="faculty" label="学部・学科・研究科" required error={errors.faculty}>
                  {({ describedBy, invalid }) => (
                    <input
                      id="faculty"
                      name="faculty"
                      className={styles.input}
                      type="text"
                      placeholder="例：経営学部 経営学科"
                      value={form.faculty}
                      onChange={(e) => update('faculty', e.target.value)}
                      aria-describedby={describedBy}
                      aria-invalid={invalid || undefined}
                      aria-required="true"
                    />
                  )}
                </Field>

                {/* 7｜卒業予定年月 */}
                <Field
                  id="graduation"
                  label="卒業予定年月"
                  required
                  error={errors.graduation}
                >
                  {({ describedBy, invalid }) => (
                    <select
                      id="graduation"
                      name="graduation"
                      className={styles.select}
                      value={form.graduation}
                      onChange={(e) => update('graduation', e.target.value)}
                      aria-describedby={describedBy}
                      aria-invalid={invalid || undefined}
                      aria-required="true"
                    >
                      {GRADUATION_OPTIONS.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>

                {form.graduation === 'その他' ? (
                  <Field
                    id="graduationOther"
                    label="卒業予定年月（その他）"
                    required
                    error={errors.graduationOther}
                  >
                    {({ describedBy, invalid }) => (
                      <input
                        id="graduationOther"
                        name="graduationOther"
                        className={styles.input}
                        type="text"
                        placeholder="例：2029年3月卒業予定"
                        value={form.graduationOther}
                        onChange={(e) => update('graduationOther', e.target.value)}
                        aria-describedby={describedBy}
                        aria-invalid={invalid || undefined}
                        aria-required="true"
                      />
                    )}
                  </Field>
                ) : null}

                {/* 8｜メールアドレス */}
                <Field id="email" label="メールアドレス" required error={errors.email}>
                  {({ describedBy, invalid }) => (
                    <input
                      id="email"
                      name="email"
                      className={styles.input}
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="example@email.com"
                      value={form.email}
                      onChange={(e) => update('email', e.target.value)}
                      aria-describedby={describedBy}
                      aria-invalid={invalid || undefined}
                      aria-required="true"
                    />
                  )}
                </Field>

                {/* 9｜電話番号 */}
                <Field
                  id="phone"
                  label="電話番号"
                  required
                  help="ハイフンはあってもなくても構いません。"
                  error={errors.phone}
                >
                  {({ describedBy, invalid }) => (
                    <input
                      id="phone"
                      name="phone"
                      className={styles.input}
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="例：09012345678"
                      value={form.phone}
                      onChange={(e) => update('phone', e.target.value)}
                      aria-describedby={describedBy}
                      aria-invalid={invalid || undefined}
                      aria-required="true"
                    />
                  )}
                </Field>

                {/* 10｜きっかけ */}
                <Field
                  id="referral"
                  label="このイベントを知ったきっかけ"
                  error={errors.referral}
                >
                  {({ describedBy }) => (
                    <select
                      id="referral"
                      name="referral"
                      className={styles.select}
                      value={form.referral}
                      onChange={(e) => update('referral', e.target.value)}
                      aria-describedby={describedBy}
                    >
                      <option value="">選択してください</option>
                      {REFERRAL_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>

                {form.referral === 'その他' ? (
                  <Field
                    id="referralOther"
                    label="きっかけ（その他）"
                    required
                    error={errors.referralOther}
                  >
                    {({ describedBy, invalid }) => (
                      <input
                        id="referralOther"
                        name="referralOther"
                        className={styles.input}
                        type="text"
                        placeholder="例：大学の掲示板で見かけた"
                        value={form.referralOther}
                        onChange={(e) => update('referralOther', e.target.value)}
                        aria-describedby={describedBy}
                        aria-invalid={invalid || undefined}
                      />
                    )}
                  </Field>
                ) : null}

                {/* 11｜当日聞いてみたいこと */}
                <Field
                  id="question"
                  label="当日聞いてみたいこと・質問"
                  help={`${QUESTION_MAX}文字以内でご記入ください。座談会の参考にさせていただきます。`}
                  error={errors.question}
                >
                  {({ describedBy, invalid }) => (
                    <>
                      <textarea
                        id="question"
                        name="question"
                        className={styles.textarea}
                        placeholder="仕事内容や働き方など、当日聞いてみたいことがあればご記入ください。"
                        value={form.question}
                        maxLength={QUESTION_MAX + 100}
                        onChange={(e) => update('question', e.target.value)}
                        aria-describedby={describedBy}
                        aria-invalid={invalid || undefined}
                      />
                      <p
                        className={`${styles.counter} ${
                          form.question.length > QUESTION_MAX ? styles.counterOver : ''
                        }`}
                      >
                        {form.question.length} / {QUESTION_MAX}文字
                      </p>
                    </>
                  )}
                </Field>

                {/* 12｜個人情報の取り扱いへの同意 */}
                <div
                  className={`${styles.field} ${errors.privacyAgreed ? styles.hasError : ''}`}
                  id="field-privacyAgreed"
                >
                  <label className={styles.consent}>
                    <input
                      className={styles.consentInput}
                      type="checkbox"
                      name="privacyAgreed"
                      checked={form.privacyAgreed}
                      onChange={(e) => update('privacyAgreed', e.target.checked)}
                      aria-describedby={
                        errors.privacyAgreed ? 'privacyAgreed-error' : undefined
                      }
                      aria-invalid={errors.privacyAgreed ? true : undefined}
                      aria-required="true"
                    />
                    <span className={styles.consentMark} aria-hidden="true">
                      <Icon name="check" size={16} />
                    </span>
                    <span className={styles.consentText}>
                      {PRIVACY_POLICY_URL ? (
                        <a href={PRIVACY_POLICY_URL} target="_blank" rel="noopener noreferrer">
                          個人情報の取り扱いについて
                        </a>
                      ) : (
                        <span>個人情報の取り扱いについて</span>
                      )}
                      確認し、同意します。
                      <span className={styles.req} style={{ marginLeft: 8 }}>
                        必須
                      </span>
                      {!PRIVACY_POLICY_URL ? (
                        <span className={styles.policyMissing}>
                          ※「個人情報の取り扱いについて」のリンク先URLは未設定です。公開前に環境変数
                          NEXT_PUBLIC_PRIVACY_POLICY_URL を設定してください。
                        </span>
                      ) : null}
                    </span>
                  </label>
                  {errors.privacyAgreed ? (
                    <p className={styles.error} id="privacyAgreed-error">
                      <Icon name="alert" size={15} className={styles.errorIcon} />
                      <span>{errors.privacyAgreed}</span>
                    </p>
                  ) : null}
                </div>

                {/* ハニーポット：人には見えない項目。入力があればボットとみなす */}
                <div className={styles.honeypot} aria-hidden="true">
                  <label htmlFor="company">会社名（入力しないでください）</label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.company}
                    onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
                  />
                </div>
              </div>

              <div className={styles.actions}>
                <button type="submit" className={`btn ${styles.submit}`}>
                  入力内容を確認する
                  <Icon name="arrow-right" size={18} className="btn-arrow" />
                </button>
                <p className={styles.actionNote}>
                  この時点ではまだ送信されません。次の画面で内容をご確認ください。
                  {selectedDate ? (
                    <>
                      <br />
                      選択中の日程：{selectedDate.displayDate}（
                      {selectedDate.deadlineDisplayShort}締切）
                    </>
                  ) : null}
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function scrollFormTop() {
  const el = document.getElementById('entry-form');
  el?.scrollIntoView({
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    block: 'start',
  });
}
