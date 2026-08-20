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

/**
 * 受け口へ1回だけ送信する。
 *
 * HTTPステータスが 200 でも成功とは限りません。
 * Google Apps Script は合言葉が違うときや処理に失敗したときでも
 * 200 で {"ok":false,...} を返し、アクセス権の設定が「全員」でない場合は
 * ログイン用のHTMLを 200 で返します。ステータスだけを見ていると、
 * 実際には1件も記録されていないのに成功として扱われてしまいます。
 */
async function postWebhookOnce(
  url: string,
  record: EntryRecord,
): Promise<{ ok: boolean; reason: string }> {
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

  if (!res.ok) return { ok: false, reason: `http_${res.status}` };

  const text = (await res.text()).slice(0, 500);
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    // JSON以外が返るのは、ログイン画面やエラーページが返っている場合。
    // 受け口のURLとアクセス権（「全員」になっているか）を確認してください。
    return { ok: false, reason: 'not_json' };
  }

  const parsed = body as { ok?: unknown; message?: unknown };
  if (parsed?.ok !== true) {
    // 受け口が理由を返している場合はそのまま記録する（個人情報は含まれません）
    const message = typeof parsed?.message === 'string' ? parsed.message : 'unknown';
    return { ok: false, reason: `rejected:${message}` };
  }
  return { ok: true, reason: 'ok' };
}

/**
 * ひとつの受け口へ送る。一時的な失敗に備えて1度だけ再送する。
 * label は本番／予備のどちらで失敗したかをログで見分けるためのものです。
 */
async function postWebhook(url: string, label: string, record: EntryRecord): Promise<boolean> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const result = await postWebhookOnce(url, record);
      if (result.ok) return true;
      console.error(
        `[event-entry] ${label} webhook rejected the entry (attempt ${attempt}): ${result.reason}`,
      );
    } catch {
      console.error(`[event-entry] ${label} webhook request failed (attempt ${attempt})`);
    }
    if (attempt === 1) await new Promise((r) => setTimeout(r, 400));
  }
  return false;
}

/**
 * 保存に失敗した申込内容を、復旧できる形でサーバーログへ残す。
 *
 * 個人情報をログに出すのは本意ではありませんが、受け口へ届かなかった申込みが
 * どこにも残らず失われる事故が実際に起きたため、失われるよりは残すという判断です。
 * 成功した申込みは出力しません（失敗したものだけ）。
 *
 * ・出力先は Vercel の Runtime Logs で、プロジェクトのメンバーのみ閲覧できます
 * ・保存期間には上限があります。恒久的な控えではなく、
 *   気づいてから手作業で拾い上げるための最後の手段です
 */
function logRescueRecord(record: EntryRecord): void {
  console.error(
    '[event-entry][RESCUE] 保存に失敗しました。以下は復旧用の申込内容です。' +
      `受付番号=${record.receiptNumber} ` +
      JSON.stringify(record),
  );
}

export async function saveEntry(record: EntryRecord): Promise<void> {
  const primaryUrl = process.env.ENTRY_WEBHOOK_URL;
  const backupUrl = process.env.ENTRY_WEBHOOK_URL_BACKUP;

  // 本番で受け口が未設定なのは設定漏れです。
  // このまま進めると JSONL への書き込みだけが成功し、申込者には完了と
  // 表示されたまま、記録は再デプロイで消えて誰にも気づかれません。
  // 実際にこの状態で申込みを失ったため、はっきりエラーにします。
  if (process.env.NODE_ENV === 'production' && !primaryUrl && !backupUrl) {
    console.error(
      '[event-entry] ENTRY_WEBHOOK_URL is not configured. ' +
        'Vercel の環境変数を Production に設定して再デプロイしてください。',
    );
    logRescueRecord(record);
    throw new Error('entry_webhook_not_configured');
  }

  // 本番と予備へ同時に送ります。両方に同じ内容が残るため、
  // 片方の受け口が止まっても申込みは失われません。
  const [primaryOk, backupOk, fileOk] = await Promise.all([
    primaryUrl ? postWebhook(primaryUrl, 'primary', record) : Promise.resolve(false),
    backupUrl ? postWebhook(backupUrl, 'backup', record) : Promise.resolve(false),
    writeJsonl(record),
  ]);

  // どちらか一方でも記録できていれば、申込みとしては成立させます。
  // ただし片方が落ちている状態は放置できないため、ログに残します。
  if (primaryUrl && !primaryOk && backupOk) {
    console.error(
      '[event-entry] 本番の受け口が失敗し、予備の受け口にだけ記録しました。' +
        '本番側の設定を確認してください。',
    );
  }
  if (backupUrl && !backupOk && primaryOk) {
    console.error('[event-entry] 予備の受け口が失敗しました。予備側の設定を確認してください。');
  }
  if (primaryOk || backupOk) return;

  // ここに来たら、どの受け口にも届いていません。
  // JSONL は再デプロイで消えるため控えとして当てにできないので、
  // 申込内容をログへ残したうえでエラーにし、申込者に再送信を促します。
  logRescueRecord(record);
  if (primaryUrl || backupUrl) {
    throw new Error('entry_webhook_failed');
  }
  if (!fileOk) {
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
