"""Generate responsive WebP variants from the project's original local JPEGs."""
from pathlib import Path
from PIL import Image, ImageOps
import json
root=Path(__file__).resolve().parents[1]/'site'
data=json.loads((root/'src/reference/content-data.json').read_text(encoding='utf-8'))
manifest={};report=[]
for item in data['heroBackgrounds']:
    src=item['src'];source=root/'public'/src.lstrip('/')
    with Image.open(source) as image:
        image=ImageOps.exif_transpose(image).convert('RGB')
        variants=[]
        for width in [640,1024]:
            resized=image.copy();resized.thumbnail((width,round(width*image.height/image.width)))
            filename=f'{source.stem}-{width}.webp';target=source.parent/filename
            resized.save(target,'WEBP',quality=85,method=6)
            variants.append((f'/assets/{filename}',resized.width,target.stat().st_size))
        manifest[src]={'src':variants[-1][0],'srcSet':', '.join(f'{v[0]} {v[1]}w' for v in variants),'width':image.width,'height':image.height}
        report.append({'source':src,'originalBytes':source.stat().st_size,'webp1024Bytes':variants[-1][2],'webp640Bytes':variants[0][2]})
(root/'src/reference/optimized-images.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
(root.parent/'qa/image-optimization.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report,indent=2))
