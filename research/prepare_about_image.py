"""Preserve the transparent building cutout and encode WebP without flattening alpha."""
from pathlib import Path
import shutil
import sys
from PIL import Image

root = Path(__file__).resolve().parents[1]
source = Path(sys.argv[1])
original = root / 'assets/generated-about/building-cutout.png'
original.parent.mkdir(parents=True, exist_ok=True)
shutil.copy2(source, original)
image = Image.open(original).convert('RGBA')
if image.getchannel('A').getextrema() != (0, 255):
    raise ValueError('Expected a genuine transparent building cutout with opaque building pixels.')
for width in (480, 960):
    variant = image.resize((width, round(width * image.height / image.width)), Image.Resampling.LANCZOS)
    variant.save(root / f'site/public/assets/yinian-about-building-cutout-{width}.webp', 'WEBP', quality=88, method=6)
print(f'Preserved {image.width}x{image.height} RGBA original; saved transparent 480px and 960px WebP variants.')
