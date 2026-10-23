import { useEffect, useState } from 'react';
import { BRAND, CONTACT, SERVICES, PRODUCTS } from '../data/content.js';
import { to } from '../lib/url.js';

export const NAV = [
  ['/', '首页'],
  ['/services/', '服务体系'],
  ['/products/', '课程产品'],
  ['/cases/', '客户案例'],
  ['/about/', '关于我们'],
];

function Brand() {
  return (
    <>
      <img src={to('/logo.svg')} alt="" width="36" height="36" />
      <span className="brand-text">
        <span className="brand-name">{BRAND.name}</span>
        <span className="brand-tag">{BRAND.tag}</span>
      </span>
    </>
  );
}

function Header({ path }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const cls = ['site-header', scrolled && 'scrolled', open && 'nav-open'].filter(Boolean).join(' ');
  return (
    <header className={cls}>
      <div className="container header-inner">
        <a className="brand" href={to('/')} aria-label={`${BRAND.name} 首页`}><Brand /></a>
        <nav className="nav" aria-label="主导航">
          {NAV.map(([href, label]) => (
            <a key={href} href={to(href)} className={href === path ? 'active' : undefined}
              aria-current={href === path ? 'page' : undefined} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
          <a className="btn btn-primary nav-mobile-cta" href={to('/contact/')}>预约咨询</a>
        </nav>
        <div className="header-cta">
          <a className="btn btn-primary btn-sm" href={to('/contact/')}>预约咨询</a>
          <button className="nav-toggle" aria-label={open ? '关闭菜单' : '打开菜单'} aria-expanded={open}
            onClick={() => setOpen(!open)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <a className="brand" href={to('/')}><Brand /></a>
            <p>{BRAND.desc}</p>
          </div>
          <div>
            <h4>服务体系</h4>
            <ul>{SERVICES.map((s) => <li key={s.id}><a href={to(`/services/#${s.id}`)}>{s.title}</a></li>)}</ul>
          </div>
          <div>
            <h4>课程产品</h4>
            <ul>{PRODUCTS.map((p) => <li key={p.id}><a href={to(`/products/#${p.id}`)}>{p.title}</a></li>)}</ul>
          </div>
          <div>
            <h4>了解我们</h4>
            <ul>
              <li><a href={to('/cases/')}>客户案例</a></li>
              <li><a href={to('/about/')}>关于我们</a></li>
              <li><a href={to('/about/#faq')}>常见问题</a></li>
              <li><a href={to('/contact/')}>联系我们</a></li>
            </ul>
          </div>
          <div>
            <h4>联系我们</h4>
            <ul>
              <li>电话：{CONTACT.phone}</li>
              <li>邮箱：{CONTACT.email}</li>
              <li>地址：{CONTACT.address}</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 {CONTACT.company} 版权所有</span>
          <span><a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">{CONTACT.icp}</a></span>
        </div>
      </div>
    </footer>
  );
}

// 滚动渐显：元素进入视口时加上 data-in 属性（不改动 React 管理的 className）
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.setAttribute('data-in', ''));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.setAttribute('data-in', ''); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

export default function Layout({ path, children }) {
  useReveal();
  return (
    <>
      <a className="skip" href="#main">跳到正文</a>
      <Header path={path} />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
