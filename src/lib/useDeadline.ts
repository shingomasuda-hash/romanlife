'use client';

import { useEffect, useState } from 'react';
import { EVENT_DATES, isClosed } from '@/data/event';

export type ClosedMap = Record<string, boolean>;

function computeClosed(now: Date): ClosedMap {
  const map: ClosedMap = {};
  for (const d of EVENT_DATES) map[d.id] = isClosed(d, now);
  return map;
}

/**
 * 締切状態。
 *
 * ・締切は JST の絶対時刻（例：2026-08-11T00:00:00+09:00）として定義しているため、
 *   端末のタイムゾーン設定に関わらず同じ瞬間に締め切られます。
 * ・初回描画はビルド／サーバー時刻で行い、マウント後に再計算します
 *   （ハイドレーションの不一致を避けるため）。
 * ・これは表示制御にすぎません。実際の受付可否は送信 API 側で再検証します。
 */
export function useDeadline() {
  const [closed, setClosed] = useState<ClosedMap>(() => computeClosed(new Date()));

  useEffect(() => {
    const update = () => setClosed(computeClosed(new Date()));
    update();
    // 締切をまたいだまま画面を開き続けている場合にも追従する
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const allClosed = EVENT_DATES.every((d) => closed[d.id]);
  return { closed, allClosed };
}
