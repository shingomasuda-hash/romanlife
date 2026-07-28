import 'server-only';
import { appendFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

/**
 * 申込データの保存。
 *
 * 送信先が指定されるまでは、次の 2 経路を用意しています。
 *   1) ENTRY_WEBHOOK_URL … 任意の受け口（Google Apps Script / CRM / Zapier など）へ POST
 *   2) JSONL ファイル      … ローカル／サーバーのファイルへ追記（既定）
 *
 * どちらにも保存できなかった場合はエラーを投げ、利用者へ「成功」を返しません。
 * データベースへ保存する場合は `saveEntry` の中に adapter を追加してください。
 */

export type EntryRecord = {
  receiptNumber: string;
  submissionId: string;
  submittedAt: string;
  submittedAtJst: string;
  eventDateId: string;
  eventDateDisplay: string;
  sessionId: string;
  sessionLabel: string;
  sessionTime: string;
  name: string;
  nameKana: string;
  school: string;
  faculty: string;
  graduation: string;
  email: string;
  phone: string;
  referral: string;
  question: string;
  privacyAgreed: boolean;
  privacyAgreedAt: string;
  source: {
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
    utm_content: string;
    utm_term: string;
    referrer: string;
    landingPage: string;
    entryPageUrl: string;
  };
};

function resolveFilePath(): string {
  const configured = process.env.ENTRIES_FILE;
  if (configured) return path.resolve(configured);
  return path.join(process.cwd(), 'data', 'entries.jsonl');
}

async function writeJsonl(record: EntryRecord): Promise<boolean> {
  const line = `${JSON.stringify(record)}\n`;
  const primary = resolveFilePath();
  try {
    await mkdir(path.dirname(primary), { recursive: true });
    await appendFile(primary, line, 'utf8');
    return true;
  } catch {
    // 読み取り専用ファイルシステム（サーバーレス等）では一時領域へ退避する
    try {
      const fallback = path.join(tmpdir(), 'romanlife-entries.jsonl');
      await appendFile(fallback, line, 'utf8');
      return true;
    } catch {
      return false;
    }
  }
}

async function postWebhook(record: EntryRecord): Promise<boolean> {
  const url = process.env.ENTRY_WEBHOOK_URL;
  if (!url) return false;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.ENTRY_WEBHOOK_SECRET
          ? { Authorization: `Bearer ${process.env.ENTRY_WEBHOOK_SECRET}` }
          : {}),
      },
      body: JSON.stringify(record),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function saveEntry(record: EntryRecord): Promise<void> {
  const results = await Promise.all([postWebhook(record), writeJsonl(record)]);
  if (!results.some(Boolean)) {
    throw new Error('entry_persistence_failed');
  }
}

/** 受付番号の採番（例：OC-260728-K3F9QP） */
export function createReceiptNumber(now: Date): string {
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const ymd = jst.toISOString().slice(2, 10).replace(/-/g, '');
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  const code = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
  return `OC-${ymd}-${code}`;
}

/** 日本時間の表示用文字列 */
export function toJstString(date: Date): string {
  return new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}
