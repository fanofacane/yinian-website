import { to } from '../lib/url.js';

export default function NotFound() {
  return (
    <section className="page-hero center" style={{ padding: '120px 0' }}>
      <div className="container">
        <div className="svc-big-no text-grad" style={{ fontSize: 96 }}>404</div>
        <h1>页面没有找到</h1>
        <p style={{ margin: '0 auto 32px' }}>你访问的页面可能已被移动或不存在。</p>
        <a className="btn btn-primary" href={to('/')}>返回首页</a>
      </div>
    </section>
  );
}
