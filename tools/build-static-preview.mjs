/**
 * LP を「1ファイルで完結する静的HTML」として書き出します。
 * デザイン共有・オフライン確認・メール添付などに使えます。
 *
 *   npm run build && npm start &        # LP を起動しておく
 *   pip install fonttools brotli        # 初回のみ（フォントのサブセット化に使用）
 *   node tools/build-static-preview.mjs # → preview/romanlife-lp-preview.html
 *
 * 環境変数:
 *   PREVIEW_URL     取得元（既定 http://localhost:3000）
 *   CHROMIUM_PATH   Chromium の実行ファイル（Playwright の既定を使う場合は不要）
 *
 * 含まれるもの : 全セクションの表示 / レスポンシブ / スクロール演出 / FAQ の開閉
 * 含まれないもの: 申込フォームの動作（React を含めないため）。
 *                 誤入力を防ぐため、フォームは無効化し冒頭に注記を入れています。
 */
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const url = process.env.PREVIEW_URL ?? 'http://localhost:3000';
const media = path.join(root, '.next', 'static', 'media');
const outDir = path.join(root, 'preview');
const outFile = path.join(outDir, 'romanlife-lp-preview.html');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rl-preview-'));

if (!fs.existsSync(media)) {
  console.error('.next/static/media が見つかりません。先に `npm run build` を実行してください。');
  process.exit(1);
}

console.log(`取得元: ${url}`);
const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
);
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const cssByUrl = new Map();
page.on('response', async (r) => {
  if (r.url().endsWith('.css')) {
    try {
      cssByUrl.set(r.url(), await r.text());
    } catch {
      /* 取得できなかった CSS は無視する */
    }
  }
});

await page.goto(url, { waitUntil: 'networkidle' });
// 遅延読み込みとスクロール演出をすべて発火させてから DOM を取り出す
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 600) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 20));
  }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(1500);

const { chars, body, hrefs } = await page.evaluate(() => {
  const set = new Set();
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walk.nextNode())) for (const c of n.nodeValue || '') set.add(c);
  // 疑似要素の content もフォントのサブセット対象に含める
  for (const el of document.querySelectorAll('*')) {
    for (const pseudo of ['::before', '::after']) {
      const c = getComputedStyle(el, pseudo).content;
      if (c && c !== 'none' && c.startsWith('"')) for (const ch of c.slice(1, -1)) set.add(ch);
    }
  }
  return {
    chars: [...set].join(''),
    body: document.body.innerHTML,
    hrefs: [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.href),
  };
});
await browser.close();

console.log(`使用文字: ${new Set(chars).size}字`);

const css = hrefs.map((h) => cssByUrl.get(h) ?? '').join('\n');
fs.writeFileSync(path.join(tmp, 'chars.txt'), chars);
fs.writeFileSync(path.join(tmp, 'in.css'), css);

console.log('フォントをサブセット化しています…');
execFileSync(
  'python3',
  [
    path.join(root, 'tools', 'subset-fonts.py'),
    path.join(tmp, 'in.css'),
    path.join(tmp, 'chars.txt'),
    media,
    path.join(tmp, 'out.css'),
  ],
  { stdio: 'inherit' },
);
const inlinedCss = fs.readFileSync(path.join(tmp, 'out.css'), 'utf8');

// React は同梱しないため、Next.js のスクリプトと外部参照を取り除く
const cleanBody = body
  .replace(/<script[^>]*src="\/_next\/[^"]*"[^>]*><\/script>/g, '')
  .replace(/<script[^>]*>self\.__next_f[\s\S]*?<\/script>/g, '')
  .replace(/<link[^>]*rel="(stylesheet|preload)"[^>]*>/g, '');

const NOTICE = `
<div class="rl-preview-note" role="note">
  <strong>制作中のLPのデザイン確認用プレビューです（公式ページではありません）。</strong>
  申込フォームは操作・送信できません。入力→確認→完了の動作は Next.js アプリ側に実装済みで、
  ローカル起動または公開後に動作します。
</div>
<style>
  .rl-preview-note{
    position:sticky;top:0;z-index:200;
    background:#16301f;color:#ecdfc2;padding:12px 20px;
    font-family:var(--font-gothic);font-size:13px;line-height:1.75;text-align:center;
    border-bottom:1px solid rgba(236,223,194,.35);
  }
  .rl-preview-note strong{color:#fff;font-weight:700;}
  /* 固定ヘッダーとページ内リンクを注記の高さ分だけ下げる */
  header{top:var(--rl-banner-h,0px)!important;}
  [id]{scroll-margin-top:calc(var(--header-h) + var(--rl-banner-h,0px) + 24px)!important;}
  @media (max-width:900px){
    .rl-preview-note{font-size:12px;padding:10px 16px;text-align:left;}
  }
  #entry-form input,#entry-form select,#entry-form textarea,#entry-form button{cursor:not-allowed;}
</style>
<script>
(function(){
  function sync(){
    var n=document.querySelector('.rl-preview-note');
    if(n)document.documentElement.style.setProperty('--rl-banner-h',n.offsetHeight+'px');
  }
  window.addEventListener('resize',sync);
  sync();setTimeout(sync,200);setTimeout(sync,800);
  function lock(){
    document.querySelectorAll('#entry-form input,#entry-form select,#entry-form textarea,#entry-form button')
      .forEach(function(el){ el.disabled = true; });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',lock);else lock();
})();
</script>`;

const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<title>ロマンライフ オープン・カンパニー2026｜2028年卒向け採用イベント（デザインプレビュー）</title>
<style>
${inlinedCss}
</style>
</head>
<body>
${NOTICE}
${cleanBody}
</body>
</html>
`;

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, html, 'utf8');
fs.rmSync(tmp, { recursive: true, force: true });

console.log(`出力: ${path.relative(root, outFile)} (${(Buffer.byteLength(html) / 1024).toFixed(0)}KB)`);
console.log('ブラウザで直接開けます（外部通信なし）。');
