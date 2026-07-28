'use client';

import { useCallback, type ReactNode } from 'react';
import { Icon } from './Icon';
import { trackEvent, type TrackEventName } from '@/lib/tracking';

type Props = {
  children: ReactNode;
  /** 計測イベント名 */
  event?: TrackEventName;
  className?: string;
  note?: string;
  variant?: 'solid' | 'ghost' | 'gold';
  full?: boolean;
};

/**
 * ページ内 CTA。すべて #entry-form（LP 最下部の申込フォーム）へ移動します。
 * 外部の求人媒体へは遷移しません。
 */
export function CtaLink({
  children,
  event = 'cta_click_inline',
  className,
  note,
  variant = 'solid',
  full,
}: Props) {
  const onClick = useCallback(() => {
    trackEvent(event, { location: typeof window !== 'undefined' ? window.location.hash : '' });
  }, [event]);

  const variantClass =
    variant === 'ghost' ? 'btn-ghost' : variant === 'gold' ? 'btn-gold' : '';

  return (
    <span className={full ? 'cta-block cta-block--full' : 'cta-block'}>
      <a
        href="#entry-form"
        className={['btn', variantClass, className].filter(Boolean).join(' ')}
        onClick={onClick}
      >
        {children}
        <Icon name="arrow-down" size={18} className="btn-arrow" />
      </a>
      {note ? <span className="btn-note">{note}</span> : null}
    </span>
  );
}
