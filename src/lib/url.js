// 站内链接统一加上部署路径前缀（BASE_URL），支持部署在子目录
const BASE = import.meta.env.BASE_URL;

export function to(path) {
  return BASE + path.replace(/^\//, '');
}

// 把浏览器地址转换成路由表里的路径，如 /yinian-website/services/ → /services/
export function currentPath() {
  let p = window.location.pathname;
  if (p.startsWith(BASE)) p = '/' + p.slice(BASE.length);
  p = p.replace(/index\.html$/, '');
  if (!p.endsWith('/')) p += '/';
  return p;
}
