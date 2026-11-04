from pathlib import Path
import re,json
root=Path(__file__).resolve().parents[3]
s=(root/'research/recovered-sources/72ea7b69-augiA20Il.js').read_text()
a=s.index('Explore our FAQs')
print(s[a+1900:a+4200])
for c in ['framer-3nvr2h','framer-kjvt7s','framer-bg6ppo','framer-1flpm64','framer-2exki','framer-7iohhu']:
    print('\n',c)
    print('\n'.join(x for x in re.findall(r'"([^"\n]*\{[^"\n]*\})"',s) if c in x))
q=Path(__file__).resolve().parents[1]/'qa/faq-audit.json'
if q.exists():
    for d in json.loads(q.read_text()):
        print('\nRUNTIME',d['name'],d['width'],d['state'])
        for e in d['elements']:
            if e['tag'] in ['H2','H6','P','BUTTON'] or e['name'] in ['FAQs','Container','Header','Elements/Accordion group','Inactive | Desktop','Inactive | Phone','Active | Desktop','Active | Phone','Trigger','Content','Icon wrap'] or e['cls'] in ['container','section-heading centered','faq-list','faq-item ','faq-item is-open','faq-answer']:
                print(e)
