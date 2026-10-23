// 构建时使用：把指定路径的页面渲染成 HTML 字符串
import { renderToString } from 'react-dom/server';
import App from './App.jsx';
import { matchRoute, routes, notFound } from './routes.js';

export { routes, notFound };

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

export function render(path) {
  const route = matchRoute(path);
  const html = renderToString(<App path={path} />);
  const head = [
    `<title>${esc(route.title)}</title>`,
    `<meta name="description" content="${esc(route.description)}" />`,
    `<meta property="og:title" content="${esc(route.title)}" />`,
    `<meta property="og:description" content="${esc(route.description)}" />`,
    '<meta property="og:type" content="website" />',
  ].join('\n    ');
  return { html, head };
}
