// 浏览器端：接管预渲染好的 HTML（hydrate），让交互生效
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App.jsx';
import { matchRoute } from './routes.js';
import { currentPath } from './lib/url.js';
import './styles.css';

const root = document.getElementById('root');
// 预渲染页面带有 data-route；开发模式下没有，则按地址栏路径匹配
const path = root.dataset.route || currentPath();
const app = <App path={path} />;

if (root.dataset.route) {
  hydrateRoot(root, app);
} else {
  // 开发模式（vite dev）没有预渲染内容，直接渲染
  document.title = matchRoute(path).title;
  createRoot(root).render(app);
}
