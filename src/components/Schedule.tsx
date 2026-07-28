'use client';

import { DeadlineNote } from './DeadlineNote';
import { Icon } from './Icon';
import { EVENT_DATES } from '@/data/event';
import { selectEventDate } from '@/lib/entryStore';
import { scrollToId } from '@/lib/scroll';
import { trackEvent } from '@/lib/tracking';
import { useDeadline } from '@/lib/useDeadline';
import styles from './Schedule.module.css';

export function Schedule() {
  const { closed, allClosed } = useDeadline();

  const handleSelect = (id: string) => {
    // 1. フォームの参加希望日へ反映し、2. 参加希望時間へ視線を誘導する
    selectEventDate(id);
    trackEvent('schedule_card_click', { eventDateId: id });
    // 3. 申込フォームまでスムーズスクロール
    scrollToId('entry-form');
  };

  return (
    <section className={`section ${styles.section}`} id="schedule" aria-labelledby="schedule-title">
      <div className="container">
        <div className={styles.head} data-reveal>
          <p className="eyebrow">Section 09 — Schedule</p>
          <h2 id="schedule-title" className={`section-title ${styles.title}`}>
            <span className="phrase">開催概要・</span>
            <span className="phrase">日程を選ぶ</span>
          </h2>
          <p className={`section-lead ${styles.lead}`}>
            午前・午後の2部制で、どちらの日程・時間帯もプログラム内容は同じです。
            都合の良い日を選んで、そのまま申込フォームへお進みください。
          </p>
        </div>

        <div className={styles.cards}>
          {EVENT_DATES.map((d) => {
            const isCardClosed = closed[d.id];
            return (
              <article
                className={`${styles.card} ${isCardClosed ? styles.cardClosed : ''}`}
                key={d.id}
                data-reveal
                aria-labelledby={`schedule-${d.id}`}
              >
                {isCardClosed ? (
                  <p className={styles.closedTag}>
                    <Icon name="alert" size={13} />
                    受付終了
                  </p>
                ) : null}

                <p className={styles.dateEn} aria-hidden="true">
                  <span className={styles.dateEnNum}>2026.{d.shortDate}</span>
                  <span className={styles.dateEnWeek}>{d.weekday}</span>
                </p>
                <h3 className={styles.dateJa} id={`schedule-${d.id}`}>
                  {d.displayDate}
                </h3>

                <hr className={styles.rule} />

                <ul className={styles.sessions}>
                  {d.sessions.map((s) => (
                    <li className={styles.session} key={s.id}>
                      <Icon name="clock" size={17} className={styles.sessionIcon} />
                      <span className={styles.sessionLabel}>{s.label}</span>
                      <span className={styles.sessionTime}>{s.time}</span>
                    </li>
                  ))}
                </ul>

                <div className={styles.deadlineWrap}>
                  <DeadlineNote dateId={d.id} />
                  <p className="visually-hidden">{d.deadlineNote}</p>
                </div>

                {isCardClosed ? (
                  <p className={styles.closedMsg}>
                    <Icon name="alert" size={18} />
                    受付終了
                  </p>
                ) : (
                  <div className={styles.action}>
                    <button
                      type="button"
                      className={`btn ${styles.button}`}
                      onClick={() => handleSelect(d.id)}
                    >
                      {d.monthDay}の日程を選択する
                      <Icon name="arrow-down" size={18} className="btn-arrow" />
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {allClosed ? (
          <p className={styles.allClosed}>
            <Icon name="alert" size={20} className={styles.allClosedIcon} />
            本イベントの参加申込み受付は終了しました。
          </p>
        ) : (
          <p className={styles.hint}>
            日程を選ぶと、申込フォームの「参加希望日」に自動で反映されます。フォーム内で別の日程へ変更することもできます。
            <br />
            開催直前は申込みが集中する可能性があります。興味をお持ちの方は、締切前にお申し込みください。
          </p>
        )}
      </div>
    </section>
  );
}
