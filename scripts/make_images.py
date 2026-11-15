#!/usr/bin/env python3
"""Render the hero data graphic (1600x900 PNG) for each article.

Usage: python3 scripts/make_images.py articles/2026-11-16 [more dirs/files]
For every article JSON it writes images/<slug>.png and sets "heroImage" in the JSON.

Design (matches the B2B Tech Asia Review design mockup): navy card, category label,
big serif number (dataFigure), label (dataLabel), source line (dataSource) and,
if the article has "chart": {"bars": [{"label": "7 Nov", "value": 350600, "display": "351rb"}, ...]},
a bar chart on the right (last bar highlighted).
"""
import json, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT / 'assets' / 'fonts'
RAW = 'https://raw.githubusercontent.com/yuiichirosasaki-afk/b2btechasia-review-content/main/images/'

W, H = 1600, 900
NAVY = (11, 42, 74)
PALE = (201, 214, 232)
LIGHT = (227, 234, 243)
BAR = (143, 176, 221)
WHITE = (255, 255, 255)


def font(name, size):
    return ImageFont.truetype(str(FONTS / name), size)


def wrap(draw, text, fnt, max_w):
    words, lines, cur = text.split(), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if draw.textlength(t, font=fnt) <= max_w:
            cur = t
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def render(a, out, source_word='Sumber'):
    img = Image.new('RGB', (W, H), NAVY)
    d = ImageDraw.Draw(img)
    pad = 96
    bars = (a.get('chart') or {}).get('bars') or []
    left_w = 760 if bars else W - 2 * pad

    # category label
    cat = f"{a['category'].upper()}  ·  DATA"
    d.text((pad, pad), cat, font=font('IBMPlexSans-Bold.ttf', 30), fill=PALE, spacing=4)

    # big number: shrink to fit
    fig = a.get('dataFigure') or ''
    size = 230
    while size > 90 and d.textlength(fig, font=font('SourceSerif4-Bold.ttf', size)) > left_w:
        size -= 6
    f_big = font('SourceSerif4-Bold.ttf', size)
    label_f = font('IBMPlexSans-Regular.ttf', 36)
    label_lines = wrap(d, a.get('dataLabel') or '', label_f, min(left_w, 720))[:4]
    src_f = font('IBMPlexSans-Regular.ttf', 24)
    src_lines = wrap(d, source_word + ': ' + (a.get('dataSource') or ''), src_f, left_w)[:2]

    src_h = len(src_lines) * 34
    label_h = len(label_lines) * 50
    big_box = d.textbbox((0, 0), fig, font=f_big)
    big_h = big_box[3] - big_box[1]
    y_src = H - pad - src_h
    y_label = y_src - 56 - label_h
    y_big = y_label - 28 - big_h
    d.text((pad, y_big - big_box[1]), fig, font=f_big, fill=WHITE)
    for i, line in enumerate(label_lines):
        d.text((pad, y_label + i * 50), line, font=label_f, fill=LIGHT)
    for i, line in enumerate(src_lines):
        d.text((pad, y_src + i * 34), line, font=src_f, fill=PALE)

    pct = None
    if not bars:
        import re as _re
        m = _re.fullmatch(r'\s*(\d+(?:[.,]\d+)?)\s*%\s*', fig)
        if m:
            pct = float(m.group(1).replace(',', '.'))
    if pct is not None and 0 < pct <= 100:
        # donut on the right
        r, cx, cy, wdt = 250, W - pad - 270, H // 2 + 20, 70
        box = [cx - r, cy - r, cx + r, cy + r]
        d.arc(box, 0, 360, fill=(37, 72, 110), width=wdt)
        d.arc(box, -90, -90 + 360 * pct / 100, fill=WHITE, width=wdt)

    if bars:
        area_x0, area_x1 = W - pad - 600, W - pad
        area_top, area_bottom = pad + 120, H - pad - 50
        n = len(bars)
        gap = 28
        bw = (area_x1 - area_x0 - gap * (n - 1)) / n
        vmax = max(b['value'] for b in bars) or 1
        vf = font('IBMPlexSans-SemiBold.ttf', 30)
        lf = font('IBMPlexSans-Regular.ttf', 26)
        for i, b in enumerate(bars):
            x0 = area_x0 + i * (bw + gap)
            h = max(6, (area_bottom - area_top - 50) * b['value'] / vmax)
            y0 = area_bottom - h
            color = WHITE if i == n - 1 else BAR
            d.rectangle([x0, y0, x0 + bw, area_bottom], fill=color)
            disp = b.get('display') or str(b['value'])
            tw = d.textlength(disp, font=vf)
            d.text((x0 + (bw - tw) / 2, y0 - 44), disp, font=vf, fill=WHITE)
            lab = b.get('label') or ''
            lw = d.textlength(lab, font=lf)
            d.text((x0 + (bw - lw) / 2, area_bottom + 14), lab, font=lf, fill=PALE)

    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out, 'PNG', optimize=True)


def main():
    files = []
    for arg in sys.argv[1:] or ['articles']:
        p = Path(arg)
        files += sorted(p.rglob('*.json')) if p.is_dir() else [p]
    for f in files:
        a = json.loads(f.read_text(encoding='utf-8'))
        if not a.get('dataFigure'):
            print(f'{f}: no dataFigure, skipped')
            continue
        out = ROOT / 'images' / f"{a['slug']}.png"
        render(a, out)
        a['heroImage'] = RAW + out.name
        en = a.get('en')
        if en and en.get('dataFigure'):
            en_view = dict(a, dataFigure=en['dataFigure'], dataLabel=en.get('dataLabel', ''),
                           dataSource=en.get('dataSource', a.get('dataSource', '')), chart=en.get('chart', a.get('chart')))
            out_en = ROOT / 'images' / f"{a['slug']}-en.png"
            render(en_view, out_en, source_word='Source')
            en['heroImage'] = RAW + out_en.name
        f.write_text(json.dumps(a, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        print(f'{f}: {out.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
