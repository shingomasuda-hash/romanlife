import { CtaLink } from './CtaLink';
import { Figure } from './Figure';
import { Icon } from './Icon';
import styles from './Voices.module.css';

const QUESTIONS = [
  '入社を決めた理由は？',
  '実際に働いて感じたギャップは？',
  '接客で大切にしていることは？',
  '若手社員はどのような仕事を任される？',
  '社員同士の雰囲気は？',
  '就職活動で大切にしていたことは？',
  '仕事で成長したと感じる瞬間は？',
  '大変だった経験は？',
  '休日や働き方は？',
  '店舗で働く面白さは？',
  'キャリアはどのように広がる？',
];

export function Voices() {
  return (
    <section className={`section ${styles.section}`} id="voices" aria-labelledby="voices-title">
      <div className="container">
        <div className={styles.grid}>
          <div data-reveal>
            <p className="eyebrow">Section 07 — People</p>
            <h2 id="voices-title" className={`section-title ${styles.title}`}>
              <span className="phrase">仕事のことも、</span>
              <span className="phrase">就活のことも。</span>
              <br />
              <span className="phrase">直接聞いてみよう。</span>
            </h2>
            <div className={styles.lead}>
              <p>
                当日は、若手社員と採用担当者との座談会の時間があります。数年前まで就職活動をしていた先輩に、気になることをそのまま聞ける時間です。
              </p>
              <p>
                会社説明では出てこない話ほど、これからの進路を考えるヒントになります。うまく質問をまとめられなくても大丈夫です。
              </p>
            </div>
            <div className={styles.media}>
              <Figure name="voices" sizes="(max-width: 980px) 100vw, 42vw" />
            </div>
          </div>

          <div data-reveal style={{ ['--reveal-delay' as string]: '110ms' }}>
            <div className={styles.qHead}>
              <Icon name="chat" size={24} className={styles.qIcon} />
              <h3 className={styles.qTitle}>たとえば、こんな質問ができます</h3>
            </div>
            <ul className={styles.questions}>
              {QUESTIONS.map((q) => (
                <li className={styles.q} key={q}>
                  {q}
                </li>
              ))}
            </ul>
            <p className={styles.foot}>
              申込フォームの「当日聞いてみたいこと」に書いていただいた内容も、当日の参考にさせていただきます。
            </p>
          </div>
        </div>

        <div className={styles.cta} data-reveal>
          <CtaLink note="8/31・9/4 京都本社開催">参加希望日を選んで申し込む</CtaLink>
        </div>
      </div>
    </section>
  );
}
