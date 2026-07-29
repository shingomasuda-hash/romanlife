/**
 * 静的LP（image-lp / static-lp）を public/ へコピーする。
 *
 * Next.js のビルド対象は src/ 以下だけなので、そのままではリポジトリ直下の
 * 静的LPは配信されない。ビルド前にこのスクリプトで public/ へ複製することで、
 *   /image-lp/   … 画像つなぎ版
 *   /static-lp/  … HTML/CSS実装版
 * として公開する。public/ 側はビルド生成物なので Git には含めない（.gitignore）。
 */
import { cp, rm, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TARGETS = ['image-lp', 'static-lp'];
/** 配信不要なファイル（ドキュメント類） */
const EXCLUDE = new Set(['README.md']);

for (const name of TARGETS) {
  const src = path.join(root, name);
  const dest = path.join(root, 'public', name);
  if (!existsSync(src)) {
    console.warn(`[copy-static] ${name} が見つからないためスキップします`);
    continue;
  }
  await rm(dest, { recursive: true, force: true });
  await mkdir(path.dirname(dest), { recursive: true });
  await cp(src, dest, {
    recursive: true,
    filter: (from) => !EXCLUDE.has(path.basename(from)),
  });
  console.log(`[copy-static] ${name} → public/${name}`);
}
