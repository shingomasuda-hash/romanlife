import { Icon, type IconName } from './Icon';
import styles from './Work.module.css';

const FLOW: { num: string; icon: IconName; title: string; text: string; highlight?: boolean }[] = [
  { num: '01', icon: 'sparkle', title: '商品企画', text: '季節や贈る場面を想像し、次の一品を考える。' },
  { num: '02', icon: 'leaf', title: '製造', text: '素材と技術を重ね、京都クオリティを形にする。' },
  { num: '03', icon: 'check', title: '品質管理', text: 'おいしさと安全を、毎日同じ基準で守り続ける。' },
  { num: '04', icon: 'route', title: '物流', text: 'できたての状態のまま、店舗やお客さまのもとへ。' },
  { num: '05', icon: 'building', title: '売場づくり', text: '手に取りたくなる空間を、季節ごとに設計する。' },
  {
    num: '06',
    icon: 'users',
    title: '接客・販売',
    text: 'お客さまの目的を汲み取り、最適な一品と体験を届ける。',
    highlight: true,
  },
  { num: '07', icon: 'chat', title: '広報・マーケティング', text: 'ブランドの魅力を、届くべき人へ言葉にして運ぶ。' },
  { num: '08', icon: 'gift', title: 'お客さまの体験', text: '「贈ってよかった」まで含めて、ひとつの仕事。' },
];

export function Work() {
  return (
    <section className={`section ${styles.section}`} id="work" aria-labelledby="work-title">
      <div className="container">
        <div className={styles.head} data-reveal>
          <p className="eyebrow">Section 06 — Our Work</p>
          <h2 id="work-title" className={`section-title ${styles.title}`}>
            ひとつのお菓子を届けるまでに、
            <br />
            たくさんの仕事がある。
          </h2>
          <p className="section-lead">
            お菓子の会社の仕事は、パティシエと販売職だけではありません。
            企画から、製造、品質管理、物流、売場づくり、接客、広報まで。
            たくさんの仕事がつながって、ようやくお客さまの手に届きます。
          </p>
        </div>

        <ol className={styles.flow}>
          {FLOW.map((n, i) => (
            <li
              className={`${styles.node} ${n.highlight ? styles.highlight : ''}`}
              key={n.num}
              data-reveal
              style={{ ['--reveal-delay' as string]: `${(i % 4) * 80}ms` }}
            >
              {n.highlight ? <span className={styles.badge}>今回体験するのはここ</span> : null}
              <span className={styles.nodeNum}>{n.num}</span>
              <Icon name={n.icon} size={24} className={styles.nodeIcon} />
              <h3 className={styles.nodeTitle}>{n.title}</h3>
              <p className={styles.nodeText}>{n.text}</p>
            </li>
          ))}
        </ol>

        <div className={styles.callout} data-reveal>
          <div>
            <p className={styles.calloutLabel}>
              <Icon name="sparkle" size={14} />
              販売職の役割
            </p>
            <h3 className={styles.calloutTitle}>
              販売職は、
              <br />
              ブランドの最前線です。
            </h3>
          </div>
          <div className={styles.calloutText}>
            <p>
              「大切な方への贈り物」なのか、「自分へのご褒美」なのか。お客さまが何を求めて来られたのかを言葉と表情から読み取り、最適な商品と体験を届ける。それが販売職の仕事です。
            </p>
            <p>
              ブランドの印象は、商品だけで決まりません。売場の空気、かけた一言、渡し方まで含めて、お客さまの記憶に残ります。今回のグループワークでは、その考え方を実際に体験していただきます。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
