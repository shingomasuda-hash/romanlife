#!/usr/bin/env python3
"""
静的プレビュー用に、CSS 内の @font-face を data URI へ埋め込む。

next/font は和文フォントを 200 以上の細かいチャンクへ分割して配信するため、
そのまま埋め込むとファイル固定オーバーヘッドで肥大する。
ここでは書体・ウェイトごとに結合してから、ページで実際に使う文字だけへ
サブセットし直すことで、1/10 以下のサイズに抑えている。

  依存: pip install fonttools brotli
  呼び出し: tools/build-static-preview.mjs から実行される
  引数: <css入力> <使用文字ファイル> <フォント格納ディレクトリ> <css出力>
"""
import base64, os, re, subprocess, sys, tempfile
from collections import defaultdict

from fontTools.ttLib import TTFont

css_in, chars_file, media, css_out = sys.argv[1:5]

css = open(css_in, encoding='utf-8').read()
used_chars = set(open(chars_file, encoding='utf-8').read())

FACE = re.compile(r'@font-face\s*\{([^}]*)\}', re.S)


def prop(block, name, default=''):
    m = re.search(rf'{name}\s*:\s*([^;}}]+)', block)
    return m.group(1).strip().strip('\'"') if m else default


# ---- 書体・ウェイト・スタイル単位にまとめる ---------------------------
groups = defaultdict(list)
for m in FACE.finditer(css):
    block = m.group(1)
    u = re.search(r'url\(([^)]+)\)', block)
    if not u:
        continue
    src = os.path.join(media, os.path.basename(u.group(1).strip('\'"')))
    if not os.path.exists(src):
        continue
    key = (prop(block, 'font-family'), prop(block, 'font-weight', '400'),
           prop(block, 'font-style', 'normal'), prop(block, 'font-display', 'swap'))
    groups[key].append(src)

print(f'  @font-face {sum(len(v) for v in groups.values())}件 → {len(groups)}書体')


def face_rule(family, style, weight, display, data):
    b64 = base64.b64encode(data).decode()
    return (f"@font-face{{font-family:'{family}';font-style:{style};font-weight:{weight};"
            f"font-display:{display};"
            f"src:url(data:font/woff2;base64,{b64}) format('woff2')}}")


def subset(src, out):
    subprocess.run([sys.executable, '-m', 'fontTools.subset', src,
                    f'--text-file={chars_file}', '--flavor=woff2',
                    '--layout-features=*', '--no-hinting',
                    f'--output-file={out}'],
                   check=True, capture_output=True)


new_faces, total = [], 0
for (family, weight, style, display), files in groups.items():
    covered = set()
    for f in files:
        try:
            covered |= {chr(c) for c in TTFont(f).getBestCmap()}
        except Exception:
            pass
    hit = covered & used_chars
    if not hit:
        print(f'    除外 {family} {weight}（使用文字なし）')
        continue

    tmp = tempfile.gettempdir()
    merged = os.path.join(tmp, f'merged_{abs(hash((family, weight, style)))}.ttf')
    out = merged.replace('.ttf', '.woff2')
    try:
        if len(files) == 1:
            TTFont(files[0]).save(merged)
        else:
            subprocess.run([sys.executable, '-m', 'fontTools.merge',
                            '--output-file=' + merged, *files],
                           check=True, capture_output=True)
        subset(merged, out)
    except subprocess.CalledProcessError:
        # 結合できない書体は、チャンクごとにサブセットして個別に埋め込む
        size = 0
        for i, f in enumerate(files):
            try:
                if not ({chr(c) for c in TTFont(f).getBestCmap()} & used_chars):
                    continue
            except Exception:
                continue
            o = os.path.join(tmp, f'part_{abs(hash((family, weight, i)))}.woff2')
            try:
                subset(f, o)
            except subprocess.CalledProcessError:
                continue
            d = open(o, 'rb').read()
            total += len(d)
            size += len(d)
            new_faces.append(face_rule(family, style, weight, display, d))
        print(f'    {family} {weight}（分割のまま）: {size/1024:.0f}KB')
        continue

    data = open(out, 'rb').read()
    total += len(data)
    new_faces.append(face_rule(family, style, weight, display, data))
    print(f'    {family} {weight}: {len(hit)}字 / {len(data)/1024:.0f}KB')

print(f'  フォント合計 {total/1024:.0f}KB (base64 約 {total*1.37/1024:.0f}KB)')

css = FACE.sub('', css)
css = '\n'.join(new_faces) + '\n' + css

# next/font のフォント変数は <html> のクラスで定義されているため :root へ移す
root_vars = [m.group(1).strip().rstrip(';')
             for m in re.finditer(r'\.__variable_[A-Za-z0-9_]+\s*\{([^}]*)\}', css)]
if root_vars:
    css = ':root{' + ';'.join(root_vars) + '}\n' + css

css = re.sub(r'url\((/_next/[^)]*)\)', 'none', css)
open(css_out, 'w', encoding='utf-8').write(css)
