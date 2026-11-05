"""Copy the current branded Givegroup case content and localize its six covers."""
import hashlib
import json
from pathlib import Path
from bs4 import BeautifulSoup
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT.parent / 'givegroup'
content = json.loads((SOURCE / 'brand/content.json').read_text(encoding='utf-8'))
page = BeautifulSoup((SOURCE / 'site/branded/cases/index.html').read_text(encoding='utf-8'), 'html.parser')
studies, provenance = [], []
for item, card in zip(content['cases'], page.select('.case_con .list .item'), strict=True):
    source_url = card.select_one('img')['src']
    source_file = SOURCE / 'site/public' / source_url.lstrip('/')
    original = Image.open(source_file).convert('RGB')
    variants = []
    for width in (480, 960, 1440):
        image = original.copy()
        image.thumbnail((width, round(width * original.height / original.width)), Image.Resampling.LANCZOS)
        if any(variant['width'] == image.width for variant in variants):
            continue
        name = f'givegroup-case-{item["slug"]}-{width}.webp'
        output = ROOT / 'site/public/assets' / name
        image.save(output, 'WEBP', quality=88, method=6)
        variants.append({'src': f'/assets/{name}', 'width': image.width})
    studies.append({**item, 'image': variants[min(1, len(variants)-1)]['src'], 'srcSet': ', '.join(f'{v["src"]} {v["width"]}w' for v in variants), 'width':original.width, 'height':original.height})
    provenance.append({'sourceProject':str(SOURCE), 'source':str(source_file), 'sourceURL':source_url, 'sha256':hashlib.sha256(source_file.read_bytes()).hexdigest(), 'outputs':[v['src'] for v in variants], 'purpose':'User-requested Givegroup cases reconstruction; artwork is illustrative, not customer evidence.'})
(ROOT / 'site/src/case-studies.js').write_text('export const caseStudies = ' + json.dumps(studies, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
(ROOT / 'research/givegroup-case-provenance.json').write_text(json.dumps(provenance, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'Imported {len(studies)} case scenarios with local responsive artwork.')
