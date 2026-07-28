'use client';

import { useEffect, useRef } from 'react';
import { Icon } from '../Icon';
import { getEventDate } from '@/data/event';
import { normalizePhone, type EntryFormState } from '@/lib/schema';
import styles from './EntryForm.module.css';

type Props = {
  form: EntryFormState;
  submitting: boolean;
  sendError: string | null;
  onBack: () => void;
  onSubmit: () => void;
};

export function Confirm({ form, submitting, sendError, onBack, onSubmit }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const date = getEventDate(form.eventDateId);
  const session = date?.sessions.find((s) => s.id === form.sessionId);

  const rows: { label: string; value: string; empty?: boolean }[] = [
    { label: '参加希望日', value: date?.displayDate ?? '' },
    { label: '参加希望時間', value: session ? `${session.label}　${session.time}` : '' },
    { label: '氏名', value: form.name },
    { label: '氏名フリガナ', value: form.nameKana },
    { label: '大学・大学院・学校名', value: form.school },
    { label: '学部・学科・研究科', value: form.faculty },
    {
      label: '卒業予定年月',
      value:
        form.graduation === 'その他'
          ? `その他（${form.graduationOther}）`
          : form.graduation,
    },
    { label: 'メールアドレス', value: form.email },
    // 実際に登録される形（ハイフンなし）を表示する
    { label: '電話番号', value: normalizePhone(form.phone) },
    {
      label: 'このイベントを知ったきっかけ',
      value:
        form.referral === 'その他'
          ? `その他（${form.referralOther}）`
          : form.referral,
      empty: !form.referral,
    },
    {
      label: '当日聞いてみたいこと・質問',
      value: form.question,
      empty: !form.question.trim(),
    },
    {
      label: '個人情報の取り扱いへの同意',
      value: form.privacyAgreed ? '同意する' : '未同意',
    },
  ];

  return (
    <div>
      <h3 className={styles.completeTitle} ref={headingRef} tabIndex={-1}>
        入力内容の確認
      </h3>
      <p className={styles.confirmLead}>
        まだお申し込みは完了していません。内容をご確認のうえ、「この内容で申し込む」を押してください。
      </p>

      <dl className={styles.review}>
        {rows.map((r) => (
          <div className={styles.reviewRow} key={r.label}>
            <dt className={styles.reviewLabel}>{r.label}</dt>
            <dd className={`${styles.reviewValue} ${r.empty ? styles.reviewEmpty : ''}`}>
              {r.empty ? '（未入力）' : r.value}
            </dd>
          </div>
        ))}
      </dl>

      {date ? (
        <p className={styles.confirmLead} style={{ marginTop: 24, marginBottom: 0 }}>
          {date.displayDate}開催分の申込締切は {date.deadlineDisplay} です。
          開催日になった時点で受付終了となります。
        </p>
      ) : null}

      {sendError ? (
        <div className={styles.sendError} role="alert">
          <Icon name="alert" size={20} className={styles.summaryIcon} />
          <span>
            {sendError}
            <br />
            入力内容は保持されていますので、そのまま再度お試しいただけます。
          </span>
        </div>
      ) : null}

      <div className={styles.actions}>
        <div className={styles.actionsRow}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onBack}
            disabled={submitting}
          >
            入力内容を修正する
          </button>
          <button
            type="button"
            className="btn"
            onClick={onSubmit}
            disabled={submitting}
            aria-disabled={submitting}
          >
            {submitting ? '送信しています…' : 'この内容で申し込む'}
            {submitting ? null : <Icon name="arrow-right" size={18} className="btn-arrow" />}
          </button>
        </div>
        <p className={styles.actionNote}>
          「この内容で申し込む」を押すと、入力内容が送信されます。
        </p>
      </div>
    </div>
  );
}
