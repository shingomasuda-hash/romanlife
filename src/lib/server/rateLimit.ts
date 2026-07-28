import 'server-only';

/**
 * 最低限の送信回数制限（プロセス内メモリ）。
 *
 * 注意：サーバーレス環境ではインスタンスごとに独立します。
 * 本格運用では Upstash Redis / Vercel KV 等の共有ストアへ差し替えてください
 * （`hit()` のインターフェースはそのまま使えます）。
 */
/**
 * 大学のキャリアセンターや PC 教室など、複数の学生が同一 IP から申し込む
 * ケースを想定して上限に余裕を持たせています。
 * ・MIN_INTERVAL_MS … 連打・二重送信の抑止
 * ・MAX_PER_WINDOW  … 明らかな自動送信の抑止
 */
const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_WINDOW = 15;
const MIN_INTERVAL_MS = 4 * 1000;

type Bucket = { times: number[] };
const buckets = new Map<string, Bucket>();

export type RateResult = { ok: true } | { ok: false; reason: 'too_many' | 'too_fast' };

export function hit(key: string, now = Date.now()): RateResult {
  const bucket = buckets.get(key) ?? { times: [] };
  bucket.times = bucket.times.filter((t) => now - t < WINDOW_MS);

  const last = bucket.times[bucket.times.length - 1];
  if (last !== undefined && now - last < MIN_INTERVAL_MS) {
    buckets.set(key, bucket);
    return { ok: false, reason: 'too_fast' };
  }

  if (bucket.times.length >= MAX_PER_WINDOW) {
    buckets.set(key, bucket);
    return { ok: false, reason: 'too_many' };
  }

  bucket.times.push(now);
  buckets.set(key, bucket);

  // 肥大化防止
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (v.times.every((t) => now - t >= WINDOW_MS)) buckets.delete(k);
    }
  }

  return { ok: true };
}
