#!/usr/bin/env python3
# Assemble a Cloudflare Pages deploy directory: built frontend + optional
# image assets (character icons + one best jacket per song, dl_ prefix
# stripped, charts/audio never copied, images downscaled for the web unless
# --no-optimize). Run `npm run build` first.
#
#   python3 scripts/build_pages.py --songs <songs_dir> --char <char_dir> \
#       [--api https://your-server/api/v1] [--out tmp/pages_deploy]
#
# --api pins the backend address into index.html (window.__ARCAEA_API__) so
# visitors don't have to fill it in on the login page. Omit --songs/--char
# to deploy the frontend without images.

import argparse
import os
import shutil
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

p = argparse.ArgumentParser()
p.add_argument('--songs', help='raw songs dir (dl_ prefixes ok; only *base_256.jpg copied)')
p.add_argument('--char', help='raw char dir (only *_icon.png copied)')
p.add_argument('--api', help="backend address to pin, e.g. https://host/api/v1")
p.add_argument('--out', default=os.path.join(ROOT, 'tmp/pages_deploy'))
p.add_argument('--no-optimize', action='store_true',
               help='copy images untouched (default: jackets -> 208px JPEG q82, icons -> 8-bit PNG)')
args = p.parse_args()

try:
    from PIL import Image  # optional: pip install pillow
except ImportError:  # pragma: no cover
    Image = None
OPTIMIZE = not args.no_optimize and Image is not None
if not args.no_optimize and Image is None:
    print('pillow not installed — copying images unoptimized')


def put_jacket(src, dst):
    # Cards show jackets at 60-104 CSS px; 208px covers 2x displays at ~12 KB
    # instead of the raw 384px / ~85 KB files.
    if not OPTIMIZE:
        shutil.copy2(src, dst)
        return
    im = Image.open(src).convert('RGB')
    im.thumbnail((208, 208), Image.LANCZOS)
    im.save(dst, 'JPEG', quality=82, optimize=True, progressive=True)


def put_icon(src, dst):
    if not OPTIMIZE:
        shutil.copy2(src, dst)
        return
    im = Image.open(src).convert('RGBA')
    im.quantize(colors=256, method=2).save(dst, 'PNG', optimize=True)

dist = os.path.join(ROOT, 'dist')
if not os.path.isfile(os.path.join(dist, 'index.html')):
    sys.exit('dist/index.html not found — run `npm run build` first')

out = os.path.abspath(args.out)
shutil.rmtree(out, ignore_errors=True)
shutil.copytree(dist, out)

# ---- index.html injections ------------------------------------------------
idx = os.path.join(out, 'index.html')
html = open(idx, encoding='utf-8').read()
inject = ''
if args.api:
    inject += f"    <script>window.__ARCAEA_API__ = '{args.api.rstrip('/')}'</script>\n"
if args.songs or args.char:
    # images ship with the page — serve them from the Pages origin
    inject += "    <script>window.__ARCAEA_ASSETS__ = '/static'</script>\n"
if inject:
    html = html.replace('    <script type="module"', inject + '    <script type="module"', 1)
    open(idx, 'w', encoding='utf-8').write(html)

# ---- character icons ------------------------------------------------------
n_char = 0
if args.char:
    cdst = os.path.join(out, 'static/char')
    os.makedirs(cdst)
    for f in os.listdir(args.char):
        if f.endswith('_icon.png') and os.path.isfile(os.path.join(args.char, f)):
            put_icon(os.path.join(args.char, f), os.path.join(cdst, f))
            n_char += 1

# ---- song jackets ---------------------------------------------------------
n_song, no_jacket = 0, []
if args.songs:
    sdst = os.path.join(out, 'static/songs')
    os.makedirs(sdst)
    # plain names first so they win over a stripped dl_ duplicate
    entries = sorted(os.listdir(args.songs), key=lambda d: d.startswith('dl_'))
    for d in entries:
        src = os.path.join(args.songs, d)
        if d == 'pack' or not os.path.isdir(src):
            continue
        name = d[3:] if d.startswith('dl_') else d
        dst = os.path.join(sdst, name)
        if os.path.exists(dst):
            continue
        pick = next((c for c in ('1080_base_256.jpg', 'base_256.jpg')
                     if os.path.isfile(os.path.join(src, c))), None)
        if not pick:
            no_jacket.append(name)
            continue
        os.makedirs(dst)
        put_jacket(os.path.join(src, pick), os.path.join(dst, pick))
        n_song += 1

# ---- Pages cache headers --------------------------------------------------
open(os.path.join(out, '_headers'), 'w').write(
    '/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n\n'
    '/static/*\n  Cache-Control: public, max-age=604800\n')

total = sum(os.path.getsize(os.path.join(dp, f))
            for dp, _, fs in os.walk(out) for f in fs)
files = sum(len(fs) for _, _, fs in os.walk(out))
print(f'char icons : {n_char}')
print(f'jackets    : {n_song}' + (f'  (no jacket: {no_jacket})' if no_jacket else ''))
print(f'output     : {out}  ({files} files, {total / 1e6:.1f} MB)')
print('deploy     : npx wrangler pages deploy ' + os.path.relpath(out, ROOT) +
      ' --project-name=<your-project>')
