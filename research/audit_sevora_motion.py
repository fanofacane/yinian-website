from pathlib import Path
import re
for fn in []:
 s=Path('research/recovered-sources',fn).read_text()
 print('\nFILE',fn)
 for pat in ['const humanReadableVariantMap','const transition','scroll','onTap','onMouseEnter','variants:{']:
  print('PAT',pat)
  for m in list(re.finditer(re.escape(pat),s))[:8]:print(s[max(0,m.start()-100):m.start()+700])
s=Path('research/recovered-sources/72ea7b69-augiA20Il.js').read_text()
a=s.index('className:"framer-nkn5kv"')-800
b=s.index('className:"framer-10gehmx"')+35000
for m in re.finditer(r'_jsx[s]?\(Motion[^,]*,\{(.*?)className:"([^"]+)"',s[a:b]):
 print(m.group(2),m.group(1)[-1800:])
for pat in ['drag','whileHover','__framer__loop','__framer__hover','framer-84k9bb']:
 print('BENEFIT PAT',pat)
 for m in list(re.finditer(re.escape(pat),s[a:b]))[:10]:print(s[a+m.start()-200:a+m.start()+500])
for pat in ['NavigationNavigation,{']:
 print('PAT',pat)
 for m in list(re.finditer(re.escape(pat),s))[:1]:print(s[max(0,m.start()-2200):m.start()+100])
