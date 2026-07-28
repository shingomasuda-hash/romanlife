import { CtaLink } from './CtaLink';
import { Icon } from './Icon';
import styles from './Career.module.css';

const STAGES = [
  {
    label: 'Start',
    title: '販売・接客',
    text: 'お客さまと直接向き合い、ブランドの価値をいちばん近くで届ける。すべての出発点です。',
  },
  {
    label: 'Next',
    title: '店舗運営・スタッフ育成',
    text: '売場づくり、数字づくり、仲間の育成へ。チームで店舗をつくる視点が加わります。',
  },
  {
    label: 'Then',
    title: '副店長・店長・リーダー',
    text: '店舗全体をまとめ、ブランドをどう届けるかを自分の判断で決めていく役割へ。',
  },
];

const FIELDS = [
  'エリアマネジメント',
  '催事営業',
  '商品企画',
  'マーケティング',
  '人事',
  '経理',
  '品質保証',
  '社内プロジェクト',
];

export function Career() {
  return (
    <section className={`section ${styles.section}`} id="career" aria-labelledby="career-title">
      <div className="container">
        <div className={styles.head} data-reveal>
          <p className="eyebrow">Section 04 — Career</p>
          <h2 id="career-title" className={`section-title ${styles.title}`}>
            <span className="phrase">接客から始まる、</span>
            <span className="phrase">さまざまなキャリア。</span>
          </h2>
        </div>

        <div className={styles.body} data-reveal>
          <p>
            お客さまと直接向き合う販売・接客の経験は、ロマンライフのブランドや仕事を理解する大切な出発点です。
          </p>
          <p>
            現場での経験を重ねた先には、店舗運営、スタッフ育成、マネジメント、商品企画、マーケティング、人事など、さまざまな仕事へ挑戦する可能性があります。「販売職＝ずっと店頭に立ち続ける仕事」ではありません。
          </p>
        </div>

        <ol className={styles.path} data-reveal>
          {STAGES.map((s) => (
            <li className={styles.stage} key={s.title}>
              <span className={styles.stageLabel}>{s.label}</span>
              <h3 className={styles.stageTitle}>{s.title}</h3>
              <p className={styles.stageText}>{s.text}</p>
            </li>
          ))}
        </ol>

        <div className={styles.branch} data-reveal>
          <div className={styles.branchHead}>
            <Icon name="route" size={24} className={styles.branchIcon} />
            <h3 className={styles.branchTitle}>その先に広がるフィールド</h3>
          </div>
          <ul className={styles.fields}>
            {FIELDS.map((f) => (
              <li className={styles.field} key={f}>
                <span className={styles.fieldDot} aria-hidden="true" />
                {f}
              </li>
            ))}
          </ul>
          <p className={styles.note}>
            <Icon name="alert" size={16} className={styles.noteIcon} />
            <span>
              キャリアの広がり方は一人ひとり異なります。適性、経験、成果、本人の希望、組織の状況などに応じて、担当する仕事は変わっていきます。
              希望する部署へ必ず異動できるものではありません。実際のキャリアの歩み方については、当日の座談会で社員に直接聞いてみてください。
            </span>
          </p>
        </div>

        <div className={styles.cta} data-reveal>
          <CtaLink note="8/11・8/31 京都本社開催">参加希望日を選んで申し込む</CtaLink>
        </div>
      </div>
    </section>
  );
}
