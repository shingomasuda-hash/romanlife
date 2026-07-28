'use client';

import { Icon } from './Icon';
import { EVENT_DATES } from '@/data/event';
import { scrollToId } from '@/lib/scroll';
import { trackEvent } from '@/lib/tracking';
import { useDeadline } from '@/lib/useDeadline';
import styles from './FinalCta.module.css';

export function FinalCta() {
  const { closed, allClosed } = useDeadline();

  return (
    <section className={`section ${styles.section}`} aria-labelledby="final-cta-title">
      <div className="container">
        <div className={styles.inner} data-reveal>
          <p className={`eyebrow ${styles.eyebrow}`}>Entry</p>
          <h2 id="final-cta-title" className={styles.title}>
            <span className="phrase">Webサイトだけでは</span>
            <span className="phrase">分からない、</span>
            <br />
            <span className="phrase">ロマンライフの仕事と人に</span>
            <span className="phrase">会いに来ませんか。</span>
          </h2>
          <p className={styles.lead}>
            商品やブランドのことだけでなく、実際に働く社員の考え方や、会社の空気を体験できる3時間です。
            参加を希望される方は、下記のフォームへ必要事項をご入力ください。
          </p>

          <ul className={styles.dates}>
            {EVENT_DATES.map((d) => (
              <li className={styles.date} key={d.id}>
                <span className={`${styles.dateEn} ${closed[d.id] ? styles.closed : ''}`}>
                  {d.shortDate} <span className="visually-hidden">{d.readableDate}</span>
                  <span aria-hidden="true"> {d.weekday}</span>
                </span>
                <span className={styles.dateJa} aria-hidden="true">
                  {d.displayDate}
                </span>
                <span className={styles.dateDeadline}>
                  {closed[d.id] ? (
                    <span className={styles.closedBadge}>受付終了</span>
                  ) : (
                    <>{d.deadlineDisplayShort}締切</>
                  )}
                </span>
              </li>
            ))}
          </ul>

          <p className={styles.note}>
            開催日になった時点で受付終了となります。開催日前日の深夜までにお申し込みください。
          </p>

          {allClosed ? (
            <p className={styles.allClosed}>
              <Icon name="alert" size={20} />
              本イベントの参加申込み受付は終了しました。
            </p>
          ) : (
            <span className={styles.ctaWrap}>
              <a
                href="#entry-form"
                className={`btn ${styles.cta}`}
                onClick={() => {
                  trackEvent('cta_click_inline', { location: 'final' });
                  scrollToId('entry-form');
                }}
              >
                申込フォームへ進む
                <Icon name="arrow-down" size={18} className="btn-arrow" />
              </a>
              <span className={styles.ctaNote}>このページ下部のフォームで申込みが完了します。</span>
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
