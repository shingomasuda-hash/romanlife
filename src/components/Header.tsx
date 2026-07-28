import { Icon } from './Icon';
import styles from './Header.module.css';

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <a href="#hero" className={styles.brand} aria-label="ページ上部へ戻る">
          <span className={styles.brandEn}>Romanlife</span>
          <span className={styles.brandJa}>オープン・カンパニー 2026</span>
        </a>

        <div className={styles.right}>
          <p className={styles.meta}>
            <Icon name="calendar" size={16} className={styles.metaIcon} />
            <span>
              8月11日（火）・8月31日（月）<span aria-hidden="true">／</span>
              <span className="visually-hidden">、</span>京都本社
            </span>
          </p>
          <a href="#entry-form" className={styles.cta}>
            申込フォームへ
            <Icon name="arrow-down" size={15} />
          </a>
        </div>
      </div>
    </header>
  );
}
