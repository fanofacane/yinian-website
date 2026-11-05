import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { render, pageRegistry } from "../dist/render/entry-server.js";

const directory = new URL("../dist/client/", import.meta.url);
const origin = new URL(process.env.SITE_URL || "http://127.0.0.1:4178");
if (!['http:', 'https:'].includes(origin.protocol) || origin.pathname !== '/' || origin.search || origin.hash || origin.username || origin.password) {
  throw new Error("SITE_URL must be an HTTP(S) origin without path, credentials, query or fragment");
}
const escape = (text) => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const canonical = escape(origin.href);
const template = readFileSync(new URL('index.html', directory), 'utf8');
const metadata = `
    <meta name="description" content="一念智能，企业 AI 落地一站式服务商。从战略咨询、企业培训、AI 转型陪跑到智能体开发，帮助企业把 AI 真正用出业务价值。">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${canonical}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="一念智能">
    <meta property="og:title" content="一念智能｜让每一家企业都能用好 AI">
    <meta property="og:description" content="从老板课、方案班到企业 AI 落地，按实际业务需求组合咨询、培训、陪跑与开发服务。">
    <meta property="og:url" content="${canonical}">
    <meta name="twitter:card" content="summary">
    <link rel="preload" href="/assets/launchfolio-300af6944c9d.woff2" as="font" type="font/woff2" crossorigin>
`;
const markup = render();
if (!markup.includes('你关心的问题') || !markup.includes('企业仍需要安排熟悉业务的人员')) throw new Error('Prerender did not include page content and FAQ answers');
writeFileSync(new URL('index.html', directory), template.replace('</head>', `${metadata}</head>`).replace('<div id="root"></div>', `<div id="root">${markup}</div>`));
for (const page of pageRegistry.filter(page => page.path !== '/')) {
  const destination = new URL(`.${page.path}/`, directory);
  mkdirSync(destination, { recursive: true });
  const pageMetadata = metadata
    .replaceAll(canonical, escape(new URL(page.path, origin).href))
    .replace(/(<meta name="description" content=")[^"]*/, `$1${escape(page.description)}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${escape(page.title)}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${escape(page.description)}`);
  writeFileSync(new URL('index.html', destination), template
    .replace(/<title>.*?<\/title>/, `<title>${escape(page.title)}</title>`)
    .replace('</head>', `${pageMetadata}</head>`)
    .replace('<div id="root"></div>', `<div id="root">${render(false, page.path)}</div>`));
}
const notFound = template
  .replace(/<title>.*?<\/title>/, '<title>页面未找到｜一念智能</title>')
  .replace('</head>', '<meta name="robots" content="noindex, follow"></head>')
  .replace('<div id="root"></div>', `<div id="root" data-page="404">${render(true)}</div>`);
writeFileSync(new URL('404.html', directory), notFound);
writeFileSync(new URL('robots.txt', directory), `User-agent: *\nAllow: /\nSitemap: ${origin.href}sitemap.xml\n`);
writeFileSync(new URL('sitemap.xml', directory), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pageRegistry.map(page => `<url><loc>${escape(new URL(page.path, origin).href)}</loc></url>`).join('')}</urlset>\n`);
console.log(`Prerendered homepage, 404 and SEO files for ${origin.href}`);
