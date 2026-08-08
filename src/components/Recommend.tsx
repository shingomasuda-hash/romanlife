import { CtaLink } from './CtaLink';
import { Figure } from './Figure';
import { Icon } from './Icon';
import styles from './Recommend.module.css';

const ITEMS = [
  '人を喜ばせる仕事に興味がある',
  '食品やお菓子の業界について知りたい',
  '接客や販売の仕事を体験してみたい',
  '京都で働くことに興味がある',
  'チームで働く仕事に魅力を感じる',
  'ブランドを育てる仕事に興味がある',
  'まだ業界や職種を絞り切れていない',
  'Webサイトだけでは分からない会社の雰囲気を知りたい',
  '若手社員に直接質問してみたい',
  '会社の中を実際に見てみたい',
  '就職活動を始めるきっかけが欲しい',
  '自分に合う仕事を考えたい',
];

export function Recommend() {
  return (
    <section
      className={`section ${styles.section}`}
      id="recommend"
      aria-labelledby="recommend-title"
    >
      <div className="container">
        <div className={styles.head} data-reveal>
          <p className="eyebrow">Section 08 — For You</p>
          <h2 id="recommend-title" className={`section-title ${styles.title}`}>
            ひとつでも当てはまったら、
            <br />
            ぜひ参加してください。
          </h2>
          <p className="section-lead">
            お菓子が好きな人のためだけのイベントではありません。
            人と関わる仕事、チームでつくる仕事に少しでも関心があれば、きっと持ち帰るものがあります。
          </p>
        </div>

        <div className={styles.grid}>
          <div className={styles.media} data-reveal>
            <Figure name="recommend" sizes="(max-width: 1000px) 100vw, 30vw" />
            <p className={styles.mediaNote}>
              決めてから来る場所ではなく、
              <br />
              考えるために来る場所です。
            </p>
          </div>

          <ul className={styles.items} data-reveal style={{ ['--reveal-delay' as string]: '110ms' }}>
            {ITEMS.map((item, i) => (
              <li className={styles.item} key={item}>
                <span className={styles.itemNum} aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className={styles.itemBody}>
                  <Icon name="check" size={16} className={styles.itemIcon} />
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.foot} data-reveal>
          <p className={styles.footText}>
            <span className="phrase">志望業界が決まっていなくても、</span>
            <span className="phrase">大丈夫です。</span>
            <br />
            <span className="phrase">まずは、</span>
            <span className="phrase">のぞきに来てください。</span>
          </p>
          <CtaLink note="8/31・9/4 京都本社開催">参加希望日を選んで申し込む</CtaLink>
        </div>
      </div>
    </section>
  );
}
