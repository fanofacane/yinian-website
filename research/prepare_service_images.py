"""Encode generated service photographs for responsive cards; originals are preserved."""
from pathlib import Path
import json
from PIL import Image

root = Path(__file__).resolve().parents[1]
spec = json.loads((root/'research/service-image-prompts.json').read_text(encoding='utf-8'))
assets = []
for item in spec['assets']:
    source = root/'assets/generated-services'/f"{item['slug']}.png"
    with Image.open(source) as image:
        variants = []
        for width in [480, 800, 1200]:
            target = root/'site/public/assets'/f"yinian-{item['slug']}-{width}.webp"
            resized = image.resize((width, round(width*image.height/image.width)), Image.Resampling.LANCZOS)
            resized.save(target, 'WEBP', quality=86, method=6)
            variants.append({'src':'/assets/'+target.name, 'width':width, 'bytes':target.stat().st_size})
        assets.append({'name':item['name'], 'alt':item['alt'], 'src':variants[1]['src'],
                       'srcSet':', '.join(f"{v['src']} {v['width']}w" for v in variants),
                       'width':image.width, 'height':image.height,
                       'source':source.relative_to(root).as_posix(), 'variants':variants})
(root/'site/src/service-images.json').write_text(json.dumps(assets,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps([{'name':a['name'],'bytes800':a['variants'][1]['bytes']} for a in assets],ensure_ascii=False))
