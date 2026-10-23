// 构建后预渲染：遍历所有页面路径，把每个页面的正文渲染成 HTML，
// 输出到各自路径下的 index.html（如 dist/services/index.html）。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const ssrDir = path.join(root, '.ssr');

const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf-8');
const { render, routes, notFound } = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href);

function write(file, url) {
  const { html, head } = render(url);
  // data-route 记录这份 HTML 是哪个路径渲染的，浏览器端按它 hydrate，保证内容一致
  const page = template
    .replace('<!--app-head-->', head)
    .replace('<div id="root"><!--app-html-->', `<div id="root" data-route="${url}">${html}`);
  const out = path.join(dist, file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, page);
  console.log(`  ${url.padEnd(12)} → dist/${file}`);
}

console.log('Prerendering:');
for (const r of routes) {
  write(r.path === '/' ? 'index.html' : `${r.path.slice(1)}index.html`, r.path);
}
write('404.html', notFound.path);

fs.rmSync(ssrDir, { recursive: true, force: true });
