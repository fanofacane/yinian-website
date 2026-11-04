import {readFile,writeFile} from 'node:fs/promises';
import postcss from 'postcss';
const base=new URL('../src/reference/',import.meta.url);
const art=JSON.parse(await readFile(new URL('benefit-art.json',base),'utf8'));
const classes=new Set(['framer-C8f1H']);
for(const item of art){for(const match of item.html.matchAll(/class="([^"]*)"/g))for(const name of match[1].split(/\s+/))classes.add(name)}
const source=await readFile(new URL('sevora.css',base),'utf8');
const root=postcss.parse(source);
root.walkAtRules(rule=>{if(rule.name==='font-face'||rule.name.includes('keyframes'))rule.remove()});
root.walkRules(rule=>{
  rule.selectors=rule.selectors.filter(selector=>{
    const required=[...selector.matchAll(/\.([a-zA-Z_][\w-]*)/g)].map(m=>m[1]);
    return required.length>0&&required.every(name=>classes.has(name));
  });
  if(!rule.selectors.length)rule.remove();
});
root.walkAtRules(rule=>{if(rule.nodes&&!rule.nodes.length)rule.remove()});
await writeFile(new URL('benefit-art.css',base),root.toString());
console.log(`Decorative CSS: ${source.length} → ${root.toString().length} characters.`);
