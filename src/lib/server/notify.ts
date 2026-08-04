import 'server-only';
import type { EntryRecord } from './storage';

/**
 * 管理者通知・申込者への自動返信。
 *
 * 環境変数が設定されている場合のみ実行し、未設定なら何もしません
 * （送信していないのに「送信しました」と表示しないため、結果を戻り値で返します）。
 *
 * 既定では Resend の HTTP API を利用します（追加パッケージ不要）。
 * 他のメール基盤を使う場合は `sendMail` の中身だけ差し替えてください。
 */

type Mail = {
  to: string | string[];
  subject: string;
  text: string;
  replyTo?: string;
};

function mailerConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.ENTRY_FROM_EMAIL);
}

async function sendMail(mail: Mail): Promise<boolean> {
  if (!mailerConfigured()) return false;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.ENTRY_FROM_EMAIL,
        to: Array.isArray(mail.to) ? mail.to : [mail.to],
        subject: mail.subject,
        text: mail.text,
        ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * 採用ご担当者への申込み内容の転送。
 *
 * 宛先は ENTRY_NOTIFICATION_EMAIL に設定します（カンマ区切りで複数指定可）。
 * 申込内容そのものを確認いただくための通知のため、入力項目をすべて記載します。
 * 宛先を増やすほど個人情報の届く範囲が広がるため、必要な方だけを設定してください。
 */
export async function notifyAdmin(record: EntryRecord): Promise<boolean> {
  const to = (process.env.ENTRY_NOTIFICATION_EMAIL ?? '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
  if (to.length === 0) return false;

  const text = [
    'オープン・カンパニーの参加申込みがありました。',
    '',
    `受付番号：${record.receiptNumber}`,
    `申込日時：${record.submittedAtJst}（日本時間）`,
    '',
    '── 参加希望 ──',
    `参加希望日：${record.eventDateDisplay}`,
    `参加希望時間：${record.sessionLabel} ${record.sessionTime}`,
    '',
    '── お申込者 ──',
    `氏名：${record.name}`,
    `フリガナ：${record.nameKana}`,
    `学校名：${record.school}`,
    `学部・学科：${record.faculty}`,
    `卒業予定年月：${record.graduation}`,
    `メールアドレス：${record.email}`,
    `電話番号：${record.phone}`,
    `本イベントを知ったきっかけ：${record.referral}`,
    '',
    '── ご質問・ご要望 ──',
    record.question || '（記載なし）',
    '',
    `個人情報の取り扱いへの同意：${record.privacyAgreed ? '同意済み' : '未同意'}（${record.privacyAgreedAt}）`,
  ].join('\n');

  return sendMail({
    to,
    subject: `【オープン・カンパニー】新規申込み ${record.receiptNumber}　${record.name} 様`,
    text,
    replyTo: record.email,
  });
}

/** 申込者への自動返信。ENTRY_AUTOREPLY_ENABLED=true かつメール設定済みのときだけ送信します。 */
export async function sendAutoReply(record: EntryRecord): Promise<boolean> {
  if (process.env.ENTRY_AUTOREPLY_ENABLED !== 'true') return false;

  const text = [
    `${record.name} 様`,
    '',
    'ロマンライフ オープン・カンパニーへのお申し込みを受け付けました。',
    '',
    `受付番号：${record.receiptNumber}`,
    `参加希望日：${record.eventDateDisplay}`,
    `参加希望時間：${record.sessionLabel} ${record.sessionTime}`,
    '会場：株式会社ロマンライフ 本社（マールブランシュ ロマンの森 2階）',
    '住所：京都府京都市山科区大塚北溝町30',
    '',
    '当日の詳細については、あらためてご案内いたします。',
    '',
    '株式会社ロマンライフ 採用担当',
  ].join('\n');

  return sendMail({
    to: record.email,
    subject: '【株式会社ロマンライフ】オープン・カンパニー参加申込みを受け付けました',
    text,
    replyTo: process.env.ENTRY_REPLY_TO_EMAIL,
  });
}

/**
 * 完了画面に表示する問い合わせ先。
 * 環境変数が未設定の場合は null を返し、架空の連絡先は表示しません。
 */
export function getContact(): { label: string; value: string } | null {
  const value = process.env.NEXT_PUBLIC_CONTACT_EMAIL || process.env.ENTRY_REPLY_TO_EMAIL;
  if (!value) return null;
  return { label: '株式会社ロマンライフ 採用担当', value };
}
