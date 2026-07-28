import { NextResponse, type NextRequest } from 'next/server';
import { EVENT_DATES, getEventDate, isAllClosed, isClosed } from '@/data/event';
import { entrySchema } from '@/lib/schema';
import { getContact, notifyAdmin, sendAutoReply } from '@/lib/server/notify';
import { hit } from '@/lib/server/rateLimit';
import { createReceiptNumber, saveEntry, toJstString, type EntryRecord } from '@/lib/server/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** 二重送信対策：同じ submissionId は 1 度しか受け付けない（プロセス内メモリ） */
const processed = new Map<string, { at: number; result: unknown }>();
const PROCESSED_TTL = 30 * 60 * 1000;

function rememberSubmission(id: string, result: unknown) {
  const now = Date.now();
  for (const [k, v] of processed) {
    if (now - v.at > PROCESSED_TTL) processed.delete(k);
  }
  processed.set(id, { at: now, result });
}

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}

/** 同一オリジンからの送信のみ受け付ける（CSRF 対策） */
function isSameOrigin(req: NextRequest): boolean {
  const site = req.headers.get('sec-fetch-site');
  if (site && site !== 'same-origin' && site !== 'same-site' && site !== 'none') return false;

  const origin = req.headers.get('origin');
  if (!origin) return true;
  try {
    const host = req.headers.get('host');
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

const GENERIC_ERROR = '送信中に問題が発生しました。時間をおいて再度お試しください。';

function fail(status: number, message: string, fieldErrors?: Record<string, string>) {
  return NextResponse.json({ ok: false, message, fieldErrors }, { status });
}

/**
 * 本番環境では HTTPS 以外の送信を許可しない。
 * ローカル（localhost / 127.0.0.1）での本番ビルド検証は対象外にしています。
 */
function isInsecure(req: NextRequest): boolean {
  if (process.env.NODE_ENV !== 'production') return false;
  const host = (req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? '').split(':')[0];
  if (host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === '') return false;
  const proto = req.headers.get('x-forwarded-proto');
  return Boolean(proto) && proto !== 'https';
}

export async function POST(req: NextRequest) {
  if (isInsecure(req)) {
    return fail(400, GENERIC_ERROR);
  }

  if (!isSameOrigin(req)) {
    return fail(403, GENERIC_ERROR);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail(400, GENERIC_ERROR);
  }

  const raw = body as Record<string, unknown>;
  const submissionId = String(raw?.submissionId ?? req.headers.get('x-submission-id') ?? '').slice(
    0,
    64,
  );

  // 既に受け付けた申込みは、同じ結果を返して重複登録しない
  if (submissionId && processed.has(submissionId)) {
    return NextResponse.json({ ok: true, result: processed.get(submissionId)!.result });
  }

  // ボット判定：ハニーポット、および表示から極端に早い送信。
  // 送信回数制限より前に判定し、明らかなボットが正規利用者の送信枠を消費しないようにする。
  if (typeof raw?.company === 'string' && raw.company.trim() !== '') {
    return fail(400, GENERIC_ERROR);
  }
  const renderedAt = typeof raw?.renderedAt === 'number' ? raw.renderedAt : 0;
  if (renderedAt > 0 && Date.now() - renderedAt < 3000) {
    return fail(400, GENERIC_ERROR);
  }

  // 送信回数制限
  const rate = hit(clientIp(req));
  if (!rate.ok) {
    return fail(
      429,
      rate.reason === 'too_fast'
        ? '送信間隔が短すぎます。数秒おいてから、もう一度お試しください。'
        : '送信回数の上限に達しました。しばらく時間をおいてからお試しください。',
    );
  }

  // 全日程が締切済みなら受け付けない
  const now = new Date();
  if (isAllClosed(now)) {
    return fail(410, '本イベントの参加申込み受付は終了しました。');
  }

  // クライアントの値を信用せず、サーバー側でも同じスキーマで再検証する
  const parsed = entrySchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form');
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return fail(422, '入力内容をご確認ください。', fieldErrors);
  }

  const data = parsed.data;

  // 締切の再確認：ブラウザ側のコードを書き換えても締切後は受け付けない
  const eventDate = getEventDate(data.eventDateId);
  if (!eventDate) {
    return fail(422, '入力内容をご確認ください。', {
      eventDateId: '参加希望日を選択してください。',
    });
  }
  if (isClosed(eventDate, now)) {
    return fail(410, `${eventDate.displayDate}開催分の受付は終了しました。`, {
      eventDateId: 'この日程は受付を終了しました。別の日程を選択してください。',
    });
  }

  const session = eventDate.sessions.find((s) => s.id === data.sessionId);
  if (!session) {
    return fail(422, '入力内容をご確認ください。', {
      sessionId: '参加希望時間を選択してください。',
    });
  }

  const tracking = data.tracking ?? {
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    utm_content: '',
    utm_term: '',
    referrer: '',
    landingPage: '',
  };

  const record: EntryRecord = {
    receiptNumber: createReceiptNumber(now),
    submissionId: submissionId || createReceiptNumber(now),
    submittedAt: now.toISOString(),
    submittedAtJst: toJstString(now),
    eventDateId: eventDate.id,
    eventDateDisplay: eventDate.displayDate,
    sessionId: session.id,
    sessionLabel: session.label,
    sessionTime: session.time,
    name: data.name,
    nameKana: data.nameKana,
    school: data.school,
    faculty: data.faculty,
    graduation:
      data.graduation === 'その他'
        ? `その他（${data.graduationOther ?? ''}）`
        : data.graduation,
    email: data.email,
    phone: data.phone,
    referral:
      data.referral === 'その他'
        ? `その他（${data.referralOther ?? ''}）`
        : (data.referral ?? ''),
    question: data.question ?? '',
    privacyAgreed: true,
    privacyAgreedAt: now.toISOString(),
    source: {
      utm_source: tracking.utm_source ?? '',
      utm_medium: tracking.utm_medium ?? '',
      utm_campaign: tracking.utm_campaign ?? '',
      utm_content: tracking.utm_content ?? '',
      utm_term: tracking.utm_term ?? '',
      referrer: tracking.referrer ?? '',
      landingPage: tracking.landingPage ?? '',
      entryPageUrl: req.headers.get('referer') ?? '',
    },
  };

  try {
    await saveEntry(record);
  } catch {
    // 内部情報（保存先・スタックトレース等）は利用者へ返さない
    console.error('[event-entry] failed to persist an entry');
    return fail(500, GENERIC_ERROR);
  }

  // 通知は保存後に実施。失敗しても申込み自体は成立させる。
  const [, autoReplySent] = await Promise.all([
    notifyAdmin(record).catch(() => false),
    sendAutoReply(record).catch(() => false),
  ]);

  const result = {
    eventDateId: record.eventDateId,
    sessionId: record.sessionId,
    name: record.name,
    receiptNumber: record.receiptNumber,
    autoReplySent,
    contact: getContact(),
  };

  if (submissionId) rememberSubmission(submissionId, result);

  return NextResponse.json({ ok: true, result });
}

/** 締切状態の確認用（フロントの表示はあくまで補助で、判定の正はサーバー側です） */
export async function GET() {
  const now = new Date();
  return NextResponse.json(
    {
      now: now.toISOString(),
      nowJst: toJstString(now),
      dates: EVENT_DATES.map((d) => ({
        id: d.id,
        displayDate: d.displayDate,
        deadline: d.deadline,
        deadlineDisplay: d.deadlineDisplay,
        closed: isClosed(d, now),
      })),
      allClosed: isAllClosed(now),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
