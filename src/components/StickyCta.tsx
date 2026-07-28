'use client';

import { useEffect, useState } from 'react';
import { Icon } from './Icon';
import { scrollToId } from '@/lib/scroll';
import { trackEvent } from '@/lib/tracking';
import { useDeadline } from '@/lib/useDeadline';
import styles from './StickyCta.module.css';

/**
 * スマートフォン用の固定 CTA。
 * 次の状態では非表示にして、入力・確認・完了の操作を妨げないようにします。
 *   ・申込フォームが画面内に表示されている
 *   ・入力欄へフォーカスしている（＝キーボード表示中）
 *   ・確認画面／完了画面を表示している
 */
export function StickyCta() {
  const { allClosed } = useDeadline();
  const [formVisible, setFormVisible] = useState(false);
  const [typing, setTyping] = useState(false);
  const [step, setStep] = useState<string>('input');

  useEffect(() => {
    const form = document.getElementById('entry-form');
    if (!form) return;

    const io = new IntersectionObserver(
      ([entry]) => setFormVisible(entry.isIntersecting),
      { rootMargin: '-10% 0px -10% 0px', threshold: 0 },
    );
    io.observe(form);

    const mo = new MutationObserver(() => {
      setStep(form.getAttribute('data-form-step') ?? 'input');
    });
    mo.observe(form, { attributes: true, attributeFilter: ['data-form-step'] });
    setStep(form.getAttribute('data-form-step') ?? 'input');

    const onFocusIn = (e: FocusEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && t.matches('input, textarea, select')) setTyping(true);
    };
    const onFocusOut = () => setTyping(false);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);

    // ソフトキーボード表示時（visualViewport が縮む）も隠す
    const vv = window.visualViewport;
    const onResize = () => {
      if (!vv) return;
      setTyping(vv.height < window.innerHeight * 0.75);
    };
    vv?.addEventListener('resize', onResize);

    return () => {
      io.disconnect();
      mo.disconnect();
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
      vv?.removeEventListener('resize', onResize);
    };
  }, []);

  const hidden = formVisible || typing || step === 'confirm' || step === 'complete';

  return (
    <div
      className={`${styles.bar} ${hidden ? styles.hidden : ''}`}
      aria-hidden={hidden || undefined}
    >
      <p className={styles.info}>
        <span className={styles.infoEn}>8/11・8/31</span>
        <span className={styles.infoJa}>京都本社開催</span>
      </p>
      {allClosed ? (
        <p className={styles.closed}>受付終了</p>
      ) : (
        <a
          href="#entry-form"
          className={`btn ${styles.cta}`}
          tabIndex={hidden ? -1 : undefined}
          onClick={() => {
            trackEvent('cta_click_inline', { location: 'sticky' });
            scrollToId('entry-form');
          }}
        >
          参加申込みはこちら
          <Icon name="arrow-down" size={16} className="btn-arrow" />
        </a>
      )}
    </div>
  );
}
