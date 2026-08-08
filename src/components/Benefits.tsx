import { CtaLink } from './CtaLink';
import { Figure } from './Figure';
import { Icon } from './Icon';
import type { ImageKey } from '@/data/images';
import styles from './Benefits.module.css';

const ITEMS: {
  num: string;
  label: string;
  title: string;
  text: string;
  tag: string;
  image: ImageKey;
}[] = [
  {
    num: '01',
    label: 'Industry',
    title: 'お菓子・食品業界を知る',
    text: '食品・洋菓子業界にはどのような仕事があり、どのように商品やブランドが届けられているのか。業界全体の地図を、まず手に入れます。',
    tag: '業界研究のはじめの一歩に',
    image: 'benefit01',
  },
  {
    num: '02',
    label: 'Company',
    title: 'ロマンライフを知る',
    text: 'マールブランシュをはじめとしたブランドや、ロマンライフが大切にしている考え方を知る。商品の裏側にある価値観に触れる時間です。',
    tag: 'ブランドの考え方に触れる',
    image: 'benefit02',
  },
  {
    num: '03',
    label: 'Workshop',
    title: '販売職を体験する',
    text: 'グループワークを通して、販売職が接客の中で何を考え、どのようにお客さまへ喜びを届けているのかを体験する。聞くだけでは分からない視点が見つかります。',
    tag: '手を動かして考えるワーク',
    image: 'benefit03',
  },
  {
    num: '04',
    label: 'People',
    title: '働く人と会社の空気を知る',
    text: '座談会と社内見学を通じて、社員の人柄、職場の雰囲気、働く環境を知る。Webサイトからは伝わらない「実際のところ」を確かめてください。',
    tag: '社員に直接質問できる',
    image: 'benefit04',
  },
];

export function Benefits() {
  return (
    <section className={`section ${styles.section}`} id="benefits" aria-labelledby="benefits-title">
      <div className="container">
        <div className={styles.head} data-reveal>
          <p className="eyebrow">Section 02 — What You Get</p>
          <h2 id="benefits-title" className={`section-title ${styles.title}`}>
            <span className="phrase">3時間で、</span>
            <span className="phrase">仕事と会社の</span>
            <span className="phrase">“リアル”が分かる。</span>
          </h2>
          <p className="section-lead">
            知識として聞いて終わりにしない。見て、聞いて、自分で考えてみる。
            そのための4つの時間を用意しています。
          </p>
        </div>

        <ol className={styles.list}>
          {ITEMS.map((item, i) => (
            <li className={styles.item} key={item.num}>
              <div className={styles.text} data-reveal>
                <p className={styles.num}>
                  <span className={styles.numFig} aria-hidden="true">
                    {item.num}
                  </span>
                  <span className={styles.numLabel}>{item.label}</span>
                </p>
                <h3 className={styles.itemTitle}>{item.title}</h3>
                <p className={styles.itemText}>{item.text}</p>
                <p className={styles.tag}>
                  <Icon name="check" size={15} />
                  {item.tag}
                </p>
              </div>
              <div
                className={styles.media}
                data-reveal
                style={{ ['--reveal-delay' as string]: '110ms' }}
              >
                <Figure
                  name={item.image}
                  sizes="(max-width: 940px) 100vw, 52vw"
                  priority={i === 0 ? false : undefined}
                />
              </div>
            </li>
          ))}
        </ol>

        <div className={styles.cta} data-reveal>
          <CtaLink note="8/31・9/4 京都本社開催">参加希望日を選んで申し込む</CtaLink>
        </div>
      </div>
    </section>
  );
}
