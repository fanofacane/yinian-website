import json
from pathlib import Path
from bs4 import BeautifulSoup
ROOT=Path(__file__).parent
d=json.loads((ROOT/'source-inspection.json').read_text(encoding='utf-8'))
for site,section,depth in [('sevora',0,5),('launchfolio',0,5),('launchfolio',1,4)]:
    soup=BeautifulSoup(d[site]['sections'][section]['parents'][depth]['html'],'html.parser')
    print('\n',site,section)
    print('Images:',[(i.get('alt'),i.get('src')) for i in soup.find_all('img')][:35])
    if site=='sevora':
        for el in soup.select('[data-framer-name]'):
            print(el.name,el.get('class'),el.get('data-framer-name'),len(str(el)))
    else:
        for el in soup.select('[data-framer-name]'):
            if any(v in el.get('data-framer-name','').lower() for v in ['card','image','logo','stack','testimonial','avatar']):print(el.name,el.get('class'),el.get('data-framer-name'),len(str(el)))
