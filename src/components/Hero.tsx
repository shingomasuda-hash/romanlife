import { CtaLink } from './CtaLink';
import { Figure } from './Figure';
import { Icon } from './Icon';
import { EVENT, EVENT_DATES } from '@/data/event';
import styles from './Hero.module.css';

export function Hero() {
  return (
    <section className={styles.hero} id="hero" aria-labelledby="hero-title">
      {/* PC：背景ビジュアル（人物・商品は右側に配置される想定） */}
      <div className={styles.mediaPc} aria-hidden="true">
        <Figure name="heroPc" priority sizes="100vw" tone="deep" align="right" />
      </div>
      <div className={styles.veil} aria-hidden="true" />
      <div className={styles.veilBottom} aria-hidden="true" />

      {/* SP：画像を独立したメインビジュアルとして上部に表示 */}
      <div className={styles.mediaSp}>
        <Figure name="heroSp" priority sizes="100vw" ratio="3 / 2" tone="deep" />
        <span className={styles.mediaSpFade} aria-hidden="true" />
      </div>

      <div className={`container ${styles.inner}`}>
        <div className={styles.copy}>
          <div className={`${styles.eyebrow} ${styles.fade}`} style={{ ['--d' as string]: '80ms' }}>
            <span className={styles.eyebrowEn}>
              2028 Graduates
              <br />
              Open Company
            </span>
            <span className={styles.eyebrowJa}>
              2028年卒向け ロマンライフ オープン・カンパニー
            </span>
          </div>

          <h1
            id="hero-title"
            className={`${styles.title} ${styles.fade}`}
            style={{ ['--d' as string]: '220ms' }}
          >
            <span>お菓子の先にある、</span>
            <span>しあわせを届ける仕事。</span>
          </h1>

          <p className={`${styles.sub} ${styles.fade}`} style={{ ['--d' as string]: '360ms' }}>
            京都から、心を動かす仕事を知る3時間。
          </p>
          <p className={`${styles.subSmall} ${styles.fade}`} style={{ ['--d' as string]: '440ms' }}>
            ロマンライフの仕事と人を、見て、聞いて、体験するオープン・カンパニー。
          </p>

          {/* 開催日：英字表記に日本語表記を必ず併記 */}
          <div className={`${styles.dates} ${styles.fade}`} style={{ ['--d' as string]: '560ms' }}>
            {EVENT_DATES.map((d) => (
              <div className={styles.dateItem} key={d.id}>
                <p className={styles.dateLine}>
                  <span className={styles.dateNum} aria-hidden="true">
                    {d.shortDate}
                  </span>
                  <span className={styles.dateWeek} aria-hidden="true">
                    {d.weekday}
                  </span>
                </p>
                <p className={styles.dateJa}>
                  <span className="visually-hidden">{d.readableDate}</span>
                  <span aria-hidden="true">{d.displayDate}</span>
                </p>
              </div>
            ))}
            <div className={styles.dateTimes}>
              <span className={styles.timesLabel}>Time</span>
              {EVENT_DATES[0].sessions.map((s) => (
                <span key={s.id}>
                  {s.label}　{s.time}
                </span>
              ))}
            </div>
          </div>

          <div className={`${styles.meta} ${styles.fade}`} style={{ ['--d' as string]: '640ms' }}>
            <p className={styles.metaRow}>
              <Icon name="pin" size={17} className={styles.metaIcon} />
              <span>
                <b>{EVENT.venue.company}</b>
                <br />
                {EVENT.venue.building}
              </span>
            </p>
            <p className={styles.metaRow}>
              <Icon name="users" size={17} className={styles.metaIcon} />
              <span>
                対象：<b>{EVENT.target}</b>
              </span>
            </p>
          </div>

          <div className={`${styles.ctaRow} ${styles.fade}`} style={{ ['--d' as string]: '720ms' }}>
            <CtaLink event="cta_click_hero" note="ページ下部の申込フォームへ進みます">
              オープン・カンパニーに申し込む
            </CtaLink>
          </div>

          <ul className={`${styles.chips} ${styles.fade}`} style={{ ['--d' as string]: '800ms' }}>
            <li className={styles.chip}>
              <Icon name="users" size={14} className={styles.chipIcon} />
              2028年卒対象
            </li>
            <li className={styles.chip}>
              <Icon name="pin" size={14} className={styles.chipIcon} />
              京都本社開催
            </li>
            <li className={styles.chip}>
              <Icon name="clock" size={14} className={styles.chipIcon} />
              午前・午後の2部制
            </li>
          </ul>
        </div>
      </div>

      <span className={styles.scrollCue} aria-hidden="true">
        <span className={styles.scrollLine} />
        Scroll
      </span>
    </section>
  );
}
