import { CtaLink } from './CtaLink';
import { DeadlineNote } from './DeadlineNote';
import { Icon } from './Icon';
import styles from './Program.module.css';

const PROGRAM = [
  {
    num: '01',
    title: '受付・オープニング',
    text: 'イベントの流れや目的をご案内します。',
  },
  {
    num: '02',
    title: 'お菓子・食品業界について',
    text: '業界の特徴や、商品がお客さまに届くまでの仕事についてご紹介します。',
  },
  {
    num: '03',
    title: 'ロマンライフについて',
    text: '会社の歴史、ブランド、事業、働くうえで大切にしている考え方をご紹介します。',
  },
  {
    num: '04',
    title: '販売職体験グループワーク',
    text: 'お客さまに喜んでいただくために、販売職がどのような視点で考えているのかを体験します。',
  },
  {
    num: '05',
    title: '本社・社内見学',
    text: '実際に働く環境や、会社の雰囲気を見学します。',
  },
  {
    num: '06',
    title: '若手社員・採用担当者との座談会',
    text: '仕事内容、働き方、就職活動について、社員に直接質問できます。',
  },
  {
    num: '07',
    title: '今後のステップ・案内',
    text: '今後の採用情報や案内をお伝えします。',
  },
];

export function Program() {
  return (
    <section className={`section ${styles.section}`} id="program" aria-labelledby="program-title">
      <span className={styles.glow} aria-hidden="true" />
      <div className="container">
        <div className={styles.head} data-reveal>
          <p className={`eyebrow ${styles.eyebrow}`}>Section 03 — Program</p>
          <h2 id="program-title" className={styles.title}>
            当日のプログラム
          </h2>
          <p className={styles.lead}>
            知るだけではなく、見て、聞いて、考える3時間。
            どちらの日程・時間帯にご参加いただいても、基本的なプログラムは同じです。
          </p>
        </div>

        <ol className={styles.timeline}>
          {PROGRAM.map((p) => (
            <li className={styles.item} key={p.num} data-reveal>
              <span className={styles.marker} aria-hidden="true">
                {p.num}
              </span>
              <div className={styles.body}>
                <h3 className={styles.itemTitle}>{p.title}</h3>
                <p className={styles.itemText}>{p.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className={styles.notice} data-reveal>
          <Icon name="alert" size={17} className={styles.noticeIcon} />
          <span>
            記載は当日の流れの一例です。プログラム内容は変更となる場合があります。
            各プログラムの詳しい時間配分は、当日ご案内します。
          </span>
        </p>

        <div className={styles.cta} data-reveal>
          <CtaLink variant="gold">参加希望日を選んで申し込む</CtaLink>
          <DeadlineNote onDark />
        </div>
      </div>
    </section>
  );
}
