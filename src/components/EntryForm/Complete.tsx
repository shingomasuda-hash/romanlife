'use client';

import { useEffect, useRef } from 'react';
import { Icon } from '../Icon';
import { EVENT, getEventDate } from '@/data/event';
import styles from './EntryForm.module.css';

export type EntryResult = {
  eventDateId: string;
  sessionId: string;
  name: string;
  /** サーバーで採番した受付番号（発行できた場合のみ返る） */
  receiptNumber?: string;
  /** 自動返信メールを実際に送信した場合のみ true */
  autoReplySent: boolean;
  /** 運用側で問い合わせ先が設定されている場合のみ返る */
  contact?: { label: string; value: string } | null;
};

export function Complete({ result }: { result: EntryResult }) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const date = getEventDate(result.eventDateId);
  const session = date?.sessions.find((s) => s.id === result.sessionId);

  return (
    <div className={styles.complete}>
      <span className={styles.completeMark} aria-hidden="true">
        <Icon name="check" size={34} />
      </span>

      <h3 className={styles.completeTitle} ref={headingRef} tabIndex={-1}>
        お申し込みありがとうございます。
      </h3>
      <p className={styles.completeText}>
        {EVENT.name}への参加申込みを受け付けました。
        <br />
        {result.autoReplySent
          ? 'ご入力いただいたメールアドレス宛に受付完了のご案内をお送りしました。'
          : '当日の詳細については、株式会社ロマンライフの採用担当者よりご案内します。'}
      </p>

      <div className={styles.receipt}>
        <p className={styles.receiptHead}>お申し込み内容</p>
        <div className={styles.receiptBody}>
          <div className={styles.receiptRow}>
            <span className={styles.receiptLabel}>開催日</span>
            <span className={styles.receiptValue}>{date?.displayDate ?? '—'}</span>
          </div>
          <div className={styles.receiptRow}>
            <span className={styles.receiptLabel}>時間帯</span>
            <span className={styles.receiptValue}>
              {session ? `${session.label}　${session.time}` : '—'}
            </span>
          </div>
          <div className={styles.receiptRow}>
            <span className={styles.receiptLabel}>お名前</span>
            <span className={styles.receiptValue}>{result.name}</span>
          </div>
          <div className={styles.receiptRow}>
            <span className={styles.receiptLabel}>会場</span>
            <span className={styles.receiptValue}>
              {EVENT.venue.company}
              <br />
              {EVENT.venue.building}
            </span>
          </div>
          {result.receiptNumber ? (
            <div className={styles.receiptRow}>
              <span className={styles.receiptLabel}>受付番号</span>
              <span className={`${styles.receiptValue} ${styles.receiptNumber}`}>
                {result.receiptNumber}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      <p className={styles.completeFoot}>
        {result.contact ? (
          <>
            お問い合わせ：{result.contact.label} {result.contact.value}
            <br />
          </>
        ) : null}
        当日お会いできることを、社員一同楽しみにしています。
      </p>

      <div className={styles.completeActions}>
        <a href="#hero" className="btn btn-ghost">
          ページの先頭へ戻る
        </a>
      </div>
    </div>
  );
}
