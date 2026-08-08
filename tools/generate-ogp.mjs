/**
 * OGP 画像（1200 × 630）を tools/ogp-template.html から生成し、public/ogp.png へ出力します。
 *
 *   npx playwright install chromium   # 初回のみ
 *   node tools/generate-ogp.mjs
 *
 * 文言や日付を変更したいときは tools/ogp-template.html を編集して再実行してください。
 */
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const template = pathToFileURL(path.join(here, 'ogp-template.html')).href;
const out = path.join(here, '..', 'public', 'ogp.png');

const launchOptions = process.env.CHROMIUM_PATH
  ? { executablePath: process.env.CHROMIUM_PATH }
  : {};

const browser = await chromium.launch(launchOptions);
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
await page.goto(template, { waitUntil: 'networkidle' });
// 和文フォントは unicode-range で分割配信されるため、実際に使う字を指定して読み込ませる
await page.evaluate(async () => {
  await Promise.all([
    document.fonts.load("600 68px 'Shippori Mincho'", 'お菓子の先にあるしあわせを届ける仕事株式会社ロマンライフ'),
    document.fonts.load("500 46px 'Cormorant Garamond'", '0123456789.MONFRI'),
    document.fonts.load("700 26px 'Zen Kaku Gothic New'", '京都から心を動かす仕事を知る3時間年卒向け採用イベント月日金'),
  ]);
  await document.fonts.ready;
});
await page.waitForTimeout(800);
await page.screenshot({ path: out });
await browser.close();

console.log(`OGP image written to ${out}`);
