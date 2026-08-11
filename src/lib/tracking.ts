'use client';

/**
 * 流入計測ユーティリティ。
 * ・UTM パラメータ / リファラー / LP の URL を取得します（ユーザーには表示しません）
 * ・計測イベントは window.dataLayer へ push するだけの薄い実装です。
 *   Google Analytics 等のタグは layout.tsx に後から追加できます。
 */

export type Tracking = {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  referrer: string;
  landingPage: string;
};

const EMPTY: Tracking = {
  utm_source: '',
  utm_medium: '',
  utm_campaign: '',
  utm_content: '',
  utm_term: '',
  referrer: '',
  landingPage: '',
};

const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const;

/** セッション中のみ保持（個人情報は含めない・長期保存しない） */
const STORAGE_KEY = 'rl_oc_tracking';

export function captureTracking(): Tracking {
  if (typeof window === 'undefined') return EMPTY;

  const params = new URLSearchParams(window.location.search);
  const fromUrl: Partial<Tracking> = {};
  let hasUtm = false;
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) {
      fromUrl[key] = value.slice(0, 120);
      hasUtm = true;
    }
  }

  let stored: Partial<Tracking> = {};
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (raw) stored = JSON.parse(raw) as Partial<Tracking>;
  } catch {
    /* sessionStorage が使えない環境でも動作を止めない */
  }

  const tracking: Tracking = {
    ...EMPTY,
    ...stored,
    ...fromUrl,
    referrer: stored.referrer || document.referrer.slice(0, 500),
    landingPage:
      stored.landingPage || `${window.location.origin}${window.location.pathname}`,
  };

  if (hasUtm || !stored.landingPage) {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tracking));
    } catch {
      /* noop */
    }
  }

  return tracking;
}

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export type TrackEventName =
  | 'cta_click_hero'
  | 'cta_click_inline'
  | 'schedule_card_click'
  | 'form_view'
  | 'form_start'
  | 'form_confirm_view'
  | 'entry_complete'
  | 'entry_error'
  | 'virtual_pageview';

export function trackEvent(name: TrackEventName, payload: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...payload });
}

/**
 * 仮想ページビュー。
 *
 * 入力→確認→完了は同じURLのまま画面だけが切り替わるため、
 * このままでは計測ツールから「別のページ」として見えません。
 * 各ステップで擬似的なページのアドレスとタイトルを通知し、
 * タグマネージャー側でページビューとして扱えるようにします。
 */
export function trackPageView(path: string, title: string) {
  if (typeof window === 'undefined') return;
  trackEvent('virtual_pageview', {
    pagePath: path,
    pageTitle: title,
    pageLocation: window.location.origin + path,
  });
}
