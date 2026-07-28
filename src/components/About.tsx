import { Figure } from './Figure';
import { Icon, type IconName } from './Icon';
import styles from './About.module.css';

/**
 * 掲載する数字は、公式サイト・公開情報で確認できるものに限定しています。
 * 店舗数・従業員数など、出典によって数値が異なる項目は掲載していません。
 */
const STATS = [
  { fig: '1951', unit: '年', label: '京都・河原町三条の珈琲店から始まりました' },
  { fig: '70', unit: '年以上', label: '食を通じて、京都で歩んできた時間' },
  { fig: '1982', unit: '年', label: '「京都北山 マールブランシュ」が誕生' },
  { fig: '3', unit: 'ブランド', label: 'マールブランシュ／侘家古暦堂／菓子wabiya' },
];

const VALUES: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'gift',
    title: '幸せ必需品',
    text: '生活に必ず要るものではないからこそ、選ばれたときの喜びは大きい。その一箱を届け続けています。',
  },
  {
    icon: 'leaf',
    title: '京都クオリティ',
    text: '京都で受け継がれてきた技と、季節に寄り添う心。おいしさの基準を、磨き続けます。',
  },
  {
    icon: 'users',
    title: '大家族主義',
    text: '一人で抱えず、チームで考える。仲間の成長を、自分のことのように喜べる関係です。',
  },
  {
    icon: 'sparkle',
    title: '絶対積極の精神',
    text: 'できない理由より、どうすればできるかを。前へ進む姿勢を、若いうちから任されます。',
  },
];

export function About() {
  return (
    <section className={`section ${styles.section}`} id="about" aria-labelledby="about-title">
      <div className="container">
        <div className={styles.top}>
          <div data-reveal>
            <p className="eyebrow">Section 05 — Company</p>
            <h2 id="about-title" className={`section-title ${styles.title}`}>
              <span className="phrase">京都から、</span>
              <span className="phrase">喜びをリレーする会社。</span>
            </h2>
            <div className={styles.lead}>
              <p>
                ロマンライフの始まりは、1951年、京都・河原町三条の小さな珈琲店でした。
                お客さまの好みに合わせて一杯を淹れる。その細やかなおもてなしの精神が、いまも私たちの原点です。
              </p>
              <p>
                1982年に「京都北山 マールブランシュ」が生まれ、いまでは洋菓子の製造・販売にとどまらず、飲食店舗の運営、通信販売、移動販売、商品企画まで。
                商品だけでなく、接客や空間も含めてブランドをつくり、京都で磨いた品質を、より多くの人へ届けています。
              </p>
            </div>

            <dl className={styles.stats}>
              {STATS.map((s) => (
                <div className={styles.stat} key={s.fig + s.label}>
                  <dt className="visually-hidden">{s.label}</dt>
                  <dd>
                    <span className={styles.statFig}>
                      {s.fig}
                      <span className={styles.statUnit}>{s.unit}</span>
                    </span>
                    <span className={styles.statLabel}>{s.label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className={styles.media} data-reveal style={{ ['--reveal-delay' as string]: '120ms' }}>
            <Figure
              name="aboutBrand"
              className={styles.mediaMain}
              sizes="(max-width: 1000px) 60vw, 42vw"
            />
            <Figure
              name="aboutTeam"
              className={styles.mediaSub}
              sizes="(max-width: 1000px) 40vw, 22vw"
              compact
            />
          </div>
        </div>

        <ul className={styles.values}>
          {VALUES.map((v, i) => (
            <li
              className={styles.value}
              key={v.title}
              data-reveal
              style={{ ['--reveal-delay' as string]: `${i * 90}ms` }}
            >
              <Icon name={v.icon} size={26} className={styles.valueIcon} />
              <h3 className={styles.valueTitle}>{v.title}</h3>
              <p className={styles.valueText}>{v.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
