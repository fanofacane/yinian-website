"""Keep editable content separate from raw captured DOM."""
import json,re
from pathlib import Path
from bs4 import BeautifulSoup
ROOT=Path(__file__).parent/'site/src/reference'
source=json.loads((ROOT/'design-data.json').read_text(encoding='utf-8'))
for card in source['testimonials']:
    p=BeautifulSoup(card.pop('html'),'html.parser').find('p')
    card['quoteParts']=[{'text':str(n) if isinstance(n,str) else n.get_text(),'bold':getattr(n,'name',None)=='strong'} for n in p.children]
for project in source['heroBackgrounds']:
    img=BeautifulSoup(project.pop('html'),'html.parser').find('img')
    versions=img.get('srcset','').split(',')
    full=[v.strip().split()[0] for v in versions if '1024w' in v]
    if full:project['src']=full[0]
for field in ['sevoraFonts','launchFonts','backgrounds']:source.pop(field,None)
(ROOT/'content-data.json').write_text(json.dumps(source,ensure_ascii=False,indent=2),encoding='utf-8')
css=(ROOT/'fonts.css').read_text(encoding='utf-8')
rules=[rule for rule in re.findall(r'@font-face\s*\{[^}]*\}',css) if re.search(r'font-family:\s*"Switzer";',rule)]
(ROOT/'fonts.css').write_text('\n'.join(rules),encoding='utf-8')
print('Prepared content and',len(rules),'Switzer font faces.')
