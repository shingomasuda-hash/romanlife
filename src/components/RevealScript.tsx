/**
 * スクロール連動のフェードアップ。
 *
 * ・<html> に .js が付いたときだけ初期状態を透明にするため、JavaScript が
 *   読み込まれない環境ではすべてのコンテンツが最初から表示されます。
 * ・prefers-reduced-motion では監視自体を行いません。
 * ・IntersectionObserver のみを使用し、アニメーションライブラリは追加しません。
 */
const SCRIPT = `
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  root.classList.add('js');

  function start() {
    var targets = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    targets.forEach(function (el) { io.observe(el); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
`;

export function RevealScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
