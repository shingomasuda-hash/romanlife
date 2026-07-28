import { CtaLink } from './CtaLink';
import { Figure } from './Figure';
import { Icon } from './Icon';
import { EVENT } from '@/data/event';
import styles from './Access.module.css';

export function Access() {
  const { venue } = EVENT;

  return (
    <section className={`section ${styles.section}`} id="access" aria-labelledby="access-title">
      <div className="container">
        <div className={styles.head} data-reveal>
          <p className="eyebrow">Section 10 — Access</p>
          <h2 id="access-title" className={`section-title ${styles.title}`}>
            会場アクセス
          </h2>
        </div>

        <div className={styles.grid}>
          <div className={styles.media} data-reveal>
            <Figure name="access" sizes="(max-width: 940px) 100vw, 58vw" />
            <p className={styles.mediaCaption}>
              会場は、ショップ・カフェ・工房と本社機能をあわせ持つ「マールブランシュ ロマンの森」です。
            </p>
          </div>

          <div data-reveal style={{ ['--reveal-delay' as string]: '110ms' }}>
            <h3 className={styles.venueName}>{venue.company}</h3>
            <p className={styles.venueBuilding}>{venue.building}</p>

            <dl className={styles.rows}>
              <div className={styles.row}>
                <Icon name="pin" size={18} className={styles.rowIcon} />
                <dt className={styles.rowLabel}>住所</dt>
                <dd className={styles.rowValue}>
                  〒{venue.postalCode}
                  <br />
                  {venue.address}
                </dd>
              </div>
              <div className={styles.row}>
                <Icon name="route" size={18} className={styles.rowIcon} />
                <dt className={styles.rowLabel}>アクセス</dt>
                <dd className={styles.rowValue}>
                  <ul className={styles.accessList}>
                    {venue.access.map((a) => (
                      <li className={styles.accessItem} key={a.line + a.station}>
                        {a.line}
                        <b>{a.station}</b>
                        より{a.detail}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>

            <a
              className={styles.mapBtn}
              href={venue.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="pin" size={18} />
              Googleマップで地図を開く
              <Icon name="external" size={16} />
              <span className="visually-hidden">（新しいタブで開きます）</span>
            </a>

            <p className={styles.note}>
              <Icon name="alert" size={16} className={styles.noteIcon} />
              <span>
                当日の受付場所・入口については、お申し込み後にお送りする参加案内をご確認ください。
              </span>
            </p>
          </div>
        </div>

        <div className={styles.cta} data-reveal>
          <CtaLink note="8/11・8/31 京都本社開催">参加希望日を選んで申し込む</CtaLink>
        </div>
      </div>
    </section>
  );
}
