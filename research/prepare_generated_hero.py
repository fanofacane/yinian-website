"""Encode original generated assets as responsive WebP, without compositing or retouching."""
from pathlib import Path
import json
from PIL import Image

root = Path(__file__).resolve().parents[1]
spec = json.loads((root / 'research/hero-image-prompts.json').read_text(encoding='utf-8'))
assets = []
for item in spec['assets']:
    source = root / 'assets/generated-hero' / (item['slug'] + '.png')
    with Image.open(source) as image:
        variants = []
        for width in [640, 1024, image.width]:
            output = root / 'site/public/assets' / f"yinian-{item['slug']}-{width}.webp"
            resized = image.resize((width, round(width * image.height / image.width)), Image.Resampling.LANCZOS)
            resized.save(output, 'WEBP', quality=86, method=6)
            variants.append({'src': '/assets/' + output.name, 'width': width, 'bytes': output.stat().st_size})
        assets.append({
            'name': item['name'],
            'alt': item['name'] + '场景示意，AI 生成素材',
            'image': variants[1]['src'],
            'fullImage': variants[-1]['src'],
            'srcSet': ', '.join(f"{v['src']} {v['width']}w" for v in variants),
            'width': image.width,
            'height': image.height,
            'source': str(source.relative_to(root)),
            'variants': variants,
        })
(root / 'site/src/hero-images.json').write_text(json.dumps(assets, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps([{'name': item['name'], 'variants': item['variants']} for item in assets], ensure_ascii=False))
