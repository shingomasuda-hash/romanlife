import { CtaLink } from './CtaLink';
import { Figure } from './Figure';
import { Icon, type IconName } from './Icon';
import styles from './Intro.module.css';

const RELAY: { num: string; icon: IconName; title: string; text: string }[] = [
  {
    num: '01',
    icon: 'leaf',
    title: '商品をつくる',
    text: '素材を選び、京都で磨いた技術で、ひとつのお菓子を仕上げる。',
  },
  {
    num: '02',
    icon: 'users',
    title: '社員が届ける',
    text: '売場をつくり、言葉を選び、お客さまの目的に寄り添って手渡す。',
  },
  {
    num: '03',
    icon: 'sparkle',
    title: 'お客さまが喜ぶ',
    text: '「これにしてよかった」。買う瞬間から、心が動きはじめる。',
  },
  {
    num: '04',
    icon: 'gift',
    title: '大切な人へつながる',
    text: '贈られた人の笑顔まで届いて、はじめて仕事が完成する。',
  },
];

export function Intro() {
  return (
    <section className="section" id="about-event" aria-labelledby="intro-title">
      <div className={styles.section}>
        <div className="container">
          <div className={styles.top}>
            <div data-reveal>
              <p className="eyebrow">Section 01 — Why Join</p>
              <h2 id="intro-title" className={styles.question}>
                お菓子を売る。
                <br />
                その先にある仕事を、
                <br />
                <em>知っていますか？</em>
              </h2>
              <div className={styles.body}>
                <p>
                  ロマンライフの仕事は、ただお菓子を販売することではありません。お客さまの大切な一日に寄り添い、商品、接客、空間、言葉を通じて、心が動く瞬間を生み出す仕事です。
                </p>
                <p>
                  今回のオープン・カンパニーでは、ロマンライフやお菓子・食品業界について知るだけでなく、販売職が大切にしている考え方をグループワークで体験できます。実際に働く社員との座談会や社内見学を通じて、Webサイトだけでは分からない会社の空気を感じてください。
                </p>
              </div>
            </div>

            <div className={styles.media} data-reveal style={{ ['--reveal-delay' as string]: '120ms' }}>
              <Figure
                name="introHandover"
                className={styles.mediaMain}
                sizes="(max-width: 1000px) 60vw, 40vw"
              />
              <Figure
                name="introCounter"
                className={styles.mediaSub}
                sizes="(max-width: 1000px) 40vw, 20vw"
                compact
              />
            </div>
          </div>

          {/* --- 喜びのリレー図解 --- */}
          <div className={styles.relay}>
            <div className={styles.relayHead} data-reveal>
              <p className="eyebrow" style={{ justifyContent: 'center' }}>
                Relay of Joy
              </p>
              <p className={styles.relayTitle}>
                私たちは、喜びをリレーする会社です。
              </p>
            </div>

            <ol className={styles.steps} data-reveal>
              {RELAY.map((s) => (
                <li className={styles.step} key={s.num}>
                  <span className={styles.stepMark}>
                    <Icon name={s.icon} size={26} />
                  </span>
                  <div>
                    <span className={styles.stepNum}>{s.num}</span>
                    <h3 className={styles.stepTitle}>{s.title}</h3>
                    <p className={styles.stepText}>{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>

            <p className={styles.relayFoot} data-reveal>
              つくる人から、届ける人へ。届ける人から、お客さまへ。
              <br />
              そのリレーのどこかに、あなたの仕事があります。
            </p>

            <div className={styles.cta} data-reveal>
              <CtaLink note="8/31・9/4 京都本社開催">参加希望日を選んで申し込む</CtaLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
