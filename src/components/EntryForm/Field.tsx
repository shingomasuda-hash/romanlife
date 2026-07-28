'use client';

import type { ReactNode } from 'react';
import { Icon } from '../Icon';
import styles from './EntryForm.module.css';

type FieldProps = {
  id: string;
  label: string;
  required?: boolean;
  help?: string;
  error?: string;
  children: (a: { describedBy: string | undefined; invalid: boolean }) => ReactNode;
};

/**
 * ラベル・補足・エラーを 1 セットで扱うラッパー。
 * ・ラベルは常に表示（プレースホルダーで代用しない）
 * ・必須は色ではなく「必須」の文字で明示
 * ・エラーは文章＋アイコン＋色の 3 点セットで伝える
 */
export function Field({ id, label, required, help, error, children }: FieldProps) {
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`${styles.field} ${error ? styles.hasError : ''}`} id={`field-${id}`}>
      <div className={styles.labelRow}>
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
        {required ? (
          <span className={styles.req}>必須</span>
        ) : (
          <span className={styles.opt}>任意</span>
        )}
      </div>
      {help ? (
        <p className={styles.help} id={helpId}>
          {help}
        </p>
      ) : null}
      {children({ describedBy, invalid: Boolean(error) })}
      {error ? <ErrorText id={errorId!}>{error}</ErrorText> : null}
    </div>
  );
}

type GroupProps = {
  id: string;
  legend: string;
  required?: boolean;
  help?: string;
  error?: string;
  children: ReactNode;
};

/** ラジオボタン群は fieldset / legend でグループ化する */
export function FieldGroup({ id, legend, required, help, error, children }: GroupProps) {
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <fieldset
      className={`${styles.field} ${error ? styles.hasError : ''}`}
      aria-describedby={describedBy}
      aria-invalid={error ? true : undefined}
      id={`field-${id}`}
    >
      <div className={styles.labelRow}>
        <legend className={styles.label}>{legend}</legend>
        {required ? (
          <span className={styles.req}>必須</span>
        ) : (
          <span className={styles.opt}>任意</span>
        )}
      </div>
      {help ? (
        <p className={styles.help} id={helpId}>
          {help}
        </p>
      ) : null}
      {children}
      {error ? <ErrorText id={errorId!}>{error}</ErrorText> : null}
    </fieldset>
  );
}

export function ErrorText({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p className={styles.error} id={id}>
      <Icon name="alert" size={15} className={styles.errorIcon} />
      <span>{children}</span>
    </p>
  );
}

type CardProps = {
  name: string;
  value: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
  title: string;
  meta?: string;
  sub?: string;
  closedLabel?: string;
  inputRef?: React.Ref<HTMLInputElement>;
};

/** タップしやすい選択カード（ラジオボタン） */
export function SelectCard({
  name,
  value,
  checked,
  disabled,
  onChange,
  title,
  meta,
  sub,
  closedLabel,
  inputRef,
}: CardProps) {
  return (
    <label className={`${styles.card} ${disabled ? styles.cardDisabled : ''}`}>
      <input
        ref={inputRef}
        className={styles.cardInput}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(value)}
      />
      <span className={styles.cardMark} aria-hidden="true">
        <Icon name="check" size={14} />
      </span>
      <span className={styles.cardBody}>
        <span className={styles.cardTitle}>{title}</span>
        {meta ? <span className={styles.cardMeta}>{meta}</span> : null}
        {sub ? <span className={styles.cardSub}>{sub}</span> : null}
        {closedLabel ? (
          <span className={styles.cardClosedTag}>
            <Icon name="alert" size={12} />
            {closedLabel}
          </span>
        ) : null}
      </span>
    </label>
  );
}
