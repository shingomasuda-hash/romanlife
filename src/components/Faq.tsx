import type { ReactNode } from 'react';
import { Icon } from './Icon';
import { EVENT_DATES } from '@/data/event';
import styles from './Faq.module.css';

/**
 * 「参加費はかかりますか？」は、公式情報で無料と確認できなかったため掲載していません。
 * 公式に確認できた場合のみ、項目を追加してください（README を参照）。
 */
const FAQ: { q: string; a: ReactNode }[] = [
  {
    q: 'どちらの日程に参加しても内容は同じですか？',
    a: <p>基本的なプログラムは同じです。都合の良い日程・時間帯を選んでください。</p>,
  },
  {
    q: '午前と午後で内容は異なりますか？',
    a: <p>基本的な内容は同じです。参加しやすい時間帯を選んでください。</p>,
  },
  {
    q: '申込締切はいつですか？',
    a: (
      <>
        <p>
          {EVENT_DATES[0].displayDateShort.replace('（火）', '')}
          開催分は、<strong>{EVENT_DATES[0].deadlineDisplay}まで</strong>です。
          <br />
          {EVENT_DATES[1].displayDateShort.replace('（月）', '')}
          開催分は、<strong>{EVENT_DATES[1].deadlineDisplay}まで</strong>です。
        </p>
        <p>
          いずれも開催日になった時点で受付終了となります。開催日前日の深夜までにお申し込みください。
        </p>
      </>
    ),
  },
  {
    q: 'お菓子業界を志望していなくても参加できますか？',
    a: (
      <>
        <p>参加できます。</p>
        <p>
          食品・お菓子業界に興味がある方はもちろん、接客、販売、サービス、店舗運営、ブランドづくりなどに興味がある方にもおすすめです。
        </p>
        <p>
          業界研究や企業研究を始めたばかりの方にも、仕事や会社について知っていただける内容です。
        </p>
      </>
    ),
  },
  {
    q: '服装に指定はありますか？',
    a: <p>詳細は申込み後の参加案内をご確認ください。</p>,
  },
  {
    q: '持ち物はありますか？',
    a: <p>申込み後に届く案内をご確認ください。</p>,
  },
  {
    q: '申込み後の日程変更やキャンセルはできますか？',
    a: (
      <p>
        お申し込み後にお送りする案内、または採用担当者へのご連絡方法をご確認のうえ、ご連絡ください。
      </p>
    ),
  },
  {
    q: 'イベントに参加すると選考で有利になりますか？',
    a: (
      <p>
        本イベントは、お菓子・食品業界とロマンライフの仕事について知っていただくための機会です。選考上の取り扱いについては、当日ご案内する今後の採用ステップをご確認ください。
      </p>
    ),
  },
];

export function Faq() {
  return (
    <section className={`section ${styles.section}`} id="faq" aria-labelledby="faq-title">
      <div className="container">
        <div className={styles.head} data-reveal>
          <p className="eyebrow">Section 11 — FAQ</p>
          <h2 id="faq-title" className={`section-title ${styles.title}`}>
            よくあるご質問
          </h2>
        </div>

        <div className={styles.list} data-reveal>
          {FAQ.map((item, i) => (
            <details className={styles.item} key={item.q} name="faq" open={i === 0}>
              <summary className={styles.summary}>
                <span className={styles.q} aria-hidden="true">
                  Q
                </span>
                <span className={styles.summaryText}>{item.q}</span>
                <span className={styles.toggle} aria-hidden="true">
                  <Icon name="plus" size={16} />
                </span>
              </summary>
              <div className={styles.answer}>
                <span className={styles.a} aria-hidden="true">
                  A
                </span>
                <div className={styles.answerBody}>{item.a}</div>
              </div>
            </details>
          ))}
        </div>

      </div>
    </section>
  );
}
