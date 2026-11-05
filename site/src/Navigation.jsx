import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, CaretDown, CaretRight, List, X } from '@phosphor-icons/react';
import { logo } from './content';
import { HeaderContact } from './SiteChrome';
import { primaryLinks, productGroups } from './site-pages';
import serviceImages from './service-images.json';
import './navigation.css';

function ProductLink({ item, onClick }) {
  const image = serviceImages[item.image];
  return <a className="product-menu-card" href={`/solutions/${item.slug}`} onClick={onClick}>
    <span className="product-menu-title">{item.title}</span>
    <img src={image.variants[0].src} srcSet={image.srcSet} sizes="(max-width:1199px) calc(50vw - 64px), 280px" alt={image.alt} width={image.width} height={image.height} decoding="async" />
  </a>;
}

export function Navigation({ onContact, onMenuChange, path = '/' }) {
  const [mobile, setMobile] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [group, setGroup] = useState(0);
  const header = useRef(null);
  const dropdown = useRef(null);
  useEffect(() => onMenuChange(mobile), [mobile, onMenuChange]);
  useEffect(() => {
    if (!mobile) return;
    const before = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = before; };
  }, [mobile]);
  useEffect(() => {
    const update = () => {
      header.current.classList.toggle('is-floating', scrollY > 148);
      header.current.style.setProperty('--nav-y', `${-84 * (1 - Math.max(0, Math.min(1, (scrollY - 148) / 32)))}px`);
    };
    const key = event => { if (event.key === 'Escape') { setExpanded(false); setMobile(false); } };
    const outside = event => { if (innerWidth >= 1200 && !dropdown.current?.contains(event.target)) setExpanded(false); };
    const resize = () => { if (innerWidth >= 1200) setMobile(false); };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('keydown', key);
    window.addEventListener('resize', resize);
    document.addEventListener('pointerdown', outside);
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('keydown', key); window.removeEventListener('resize', resize); document.removeEventListener('pointerdown', outside); };
  }, []);
  const close = () => { setMobile(false); setExpanded(false); };
  const renderLink = ([label, href]) => <a key={href} href={href} aria-current={path !== '/' && path === href ? 'page' : undefined} onClick={close}>{label}</a>;
  return <header ref={header} className={`site-header ${mobile ? 'menu-open' : ''}`}>
    <nav className="container navigation" aria-label="主导航">
      <a className="brand" href="/"><img src={logo} alt="" />一念智能</a>
      <div className="nav-links">
        <div className="products-nav" ref={dropdown} onMouseEnter={() => setExpanded(true)} onMouseLeave={() => setExpanded(false)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setExpanded(false); }}>
          <button className="products-trigger" aria-expanded={expanded} aria-controls="products-panel" onFocus={() => setExpanded(true)} onKeyDown={event => { if (event.key === 'ArrowDown') { event.preventDefault(); setExpanded(true); } }}>服务与方案<CaretDown size={13} /></button>
          <div id="products-panel" className={`products-panel ${expanded ? 'is-open' : ''}`} inert={!expanded}>
            <div className="products-categories" role="tablist" aria-label="服务与方案分类" aria-orientation="vertical">
              {productGroups.map((category, i) => <button id={`category-${i}`} key={category.id} role="tab" aria-selected={group === i} aria-controls="category-services" tabIndex={group === i ? 0 : -1} className={group === i ? 'is-selected' : ''} onMouseEnter={() => setGroup(i)} onFocus={() => setGroup(i)} onClick={() => setGroup(i)} onKeyDown={event => { if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : (i + 1) % 2; setGroup(next); document.getElementById(`category-${next}`).focus(); } }}>
                <span>{category.title}</span><CaretRight size={15} />
              </button>)}
            </div>
            <div className="products-services" id="category-services" role="tabpanel" aria-labelledby={`category-${group}`}>
              <div className="product-menu-grid" key={productGroups[group].id}>{productGroups[group].items.map(item => <ProductLink key={item.slug} item={item} />)}</div>
            </div>
          </div>
        </div>
        {primaryLinks.map(renderLink)}
        <noscript><div className="static-products">{productGroups.map(category => <div key={category.id}><strong>{category.title}</strong>{category.items.map(item => <a key={item.slug} href={`/solutions/${item.slug}`}>{item.title}</a>)}</div>)}</div></noscript>
      </div>
      <HeaderContact onContact={onContact} />
      <button className="menu-toggle" aria-label={mobile ? '关闭菜单' : '打开菜单'} aria-expanded={mobile} aria-controls="mobile-navigation" onClick={() => setMobile(!mobile)}>{mobile ? <X size={24} /> : <List size={24} />}</button>
    </nav>
    <div id="mobile-navigation" className={`mobile-menu ${mobile ? 'is-open' : ''}`} inert={!mobile} aria-hidden={!mobile}>
      <div className="mobile-menu-links">
        <button className="mobile-products-trigger" aria-expanded={expanded} aria-controls="mobile-products" onClick={() => setExpanded(!expanded)}>服务与方案<CaretDown size={18} /></button>
        <div id="mobile-products" className="mobile-products" hidden={!expanded}>{productGroups.map(category => <div key={category.id}><p>{category.title}</p><div className="mobile-product-grid">{category.items.map(item => <ProductLink key={item.slug} item={item} onClick={close} />)}</div></div>)}</div>
        {primaryLinks.map(renderLink)}
      </div>
      <button className="dark-button" onClick={() => { close(); onContact(); }}>免费方案<ArrowUpRight size={18} /></button>
    </div>
  </header>;
}
