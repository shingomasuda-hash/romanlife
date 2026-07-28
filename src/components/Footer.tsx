import { Icon } from './Icon';
import { EVENT } from '@/data/event';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.inner}>
          <div>
            <p className={styles.brandEn}>Romanlife</p>
            <p className={styles.brandJa}>株式会社ロマンライフ</p>
            <address className={styles.address}>
              {EVENT.venue.company}
              <br />
              〒{EVENT.venue.postalCode} {EVENT.venue.address}
              <br />
              {EVENT.venue.building}
            </address>
          </div>

          <nav className={styles.links} aria-label="関連リンク">
            <a
              className={styles.link}
              href="https://www.romanlife.co.jp/"
              target="_blank"
              rel="noopener noreferrer"
            >
              企業公式サイト
              <Icon name="external" size={14} />
              <span className="visually-hidden">（新しいタブで開きます）</span>
            </a>
            <a
              className={styles.link}
              href="https://www.romanlife.co.jp/recruit/"
              target="_blank"
              rel="noopener noreferrer"
            >
              採用サイト
              <Icon name="external" size={14} />
              <span className="visually-hidden">（新しいタブで開きます）</span>
            </a>
            <a className={styles.link} href="#entry-form">
              オープン・カンパニー申込フォーム
              <Icon name="arrow-down" size={14} />
            </a>
          </nav>
        </div>

        <p className={styles.copyright}>
          本ページは、2028年卒業予定の方を対象とした「{EVENT.name}」の参加申込み専用ページです。
          <br />
          &copy; ROMANLIFE Co., Ltd.
        </p>
      </div>
    </footer>
  );
}
