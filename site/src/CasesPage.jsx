import { useEffect, useRef, useState } from 'react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { caseStudies } from './case-studies';
import { CaseDetail } from './CaseDetail';
import './cases-page.css';

function CaseImage({ item, featured = false }) {
  return <img src={item.image} srcSet={item.srcSet} sizes={featured ? '(max-width:700px) calc(100vw - 40px), 48vw' : '(max-width:767px) 44vw, 28vw'} width={item.width} height={item.height} alt={`${item.industry}场景示意配图，非客户项目证明`} loading={featured ? 'eager' : 'lazy'} decoding="async" draggable="false" />;
}

function FeaturedCases() {
  const [active, setActive] = useState(0);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [geometry, setGeometry] = useState({ width:0, gap:0, compact:false });
  const root = useRef(null);
  const pointer = useRef(null);
  const suppressClick = useRef(false);
  useEffect(() => {
    const element = root.current;
    const measure = () => setGeometry({ width:element.getBoundingClientRect().width, gap:parseFloat(getComputedStyle(element.querySelector('.cases-track')).columnGap), compact:matchMedia('(max-width:700px)').matches });
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    return () => observer.disconnect();
  }, []);
  const featured = caseStudies.slice(0, 3);
  const select = index => { setActive(Math.max(0, Math.min(featured.length - 1, index))); setDrag(0); };
  const finishDrag = (event, cancelled = false) => {
    if (pointer.current?.id !== event.pointerId) return;
    const delta = pointer.current.delta;
    pointer.current = null;
    setDragging(false);
    if (root.current.hasPointerCapture(event.pointerId)) root.current.releasePointerCapture(event.pointerId);
    if (!cancelled && Math.abs(delta) > Math.min(90, geometry.width * .12)) select(active + (delta < 0 ? 1 : -1));
    else setDrag(0);
  };
  const offset = active * ((geometry.compact ? geometry.width : geometry.width * .31958) + geometry.gap);
  return <section className="cases-featured" aria-label="精选场景">
    <div ref={root} className="cases-carousel" role="region" aria-roledescription="轮播" aria-label={`精选场景，第${active+1}项，共3项`} tabIndex={0}
      onKeyDown={event => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); select(active + (event.key === 'ArrowRight' ? 1 : -1)); } }}
      onPointerDown={event => {
        if (!event.isPrimary || event.button !== 0 || event.target.closest('button')) return;
        pointer.current = { id:event.pointerId, start:event.clientX, delta:0 };
        suppressClick.current = false;
      }}
      onPointerMove={event => {
        if (pointer.current?.id !== event.pointerId) return;
        let delta = event.clientX - pointer.current.start;
        if (Math.abs(delta) > 8) {
          root.current.setPointerCapture(event.pointerId);
          setDragging(true);
          suppressClick.current = true;
        }
        if ((active === 0 && delta > 0) || (active === featured.length - 1 && delta < 0)) delta *= .28;
        pointer.current.delta = delta;
        setDrag(delta);
      }}
      onPointerUp={event => finishDrag(event)} onPointerCancel={event => finishDrag(event, true)}
      onClickCapture={event => { if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; } }}>
      <div className={`cases-track${dragging ? ' is-dragging' : ''}`} style={{ transform:`translate3d(${-offset + drag}px,0,0)` }}>
        {featured.map((item, index) => <article key={item.slug} className={`cases-slide${active === index ? ' is-active' : ''}`} inert={active !== index} aria-hidden={active !== index}>
          <div className="cases-feature-card">
            <div className="cases-feature-copy">
              <p className="cases-feature-label">场景示例 · {item.industry}</p>
              <h2><a href={`/cases/${item.slug}`}>{item.title}</a></h2>
              <p className="cases-feature-description">{item.problem}</p>
              <a className="cases-more" href={`/cases/${item.slug}`}>进一步了解</a>
            </div>
            <a className="cases-feature-media" href={`/cases/${item.slug}`} tabIndex={-1} aria-hidden="true" draggable="false"><CaseImage item={item} featured /></a>
          </div>
        </article>)}
      </div>
      <div className="cases-controls">
        <div className="cases-arrows"><button aria-label="上一项" disabled={active === 0} onClick={() => select(active - 1)}><CaretLeft size={17} /></button><button aria-label="下一项" disabled={active === featured.length - 1} onClick={() => select(active + 1)}><CaretRight size={17} /></button></div>
        <div className="cases-progress" role="progressbar" aria-label="精选案例进度" aria-valuemin={0} aria-valuemax={100} aria-valuenow={active * 50}><span style={{ transform:`scaleX(${active / 2})` }} /></div>
      </div>
    </div>
  </section>;
}

export function CasesPage({ path }) {
  const [industry, setIndustry] = useState('0');
  const industries = ['全部', ...caseStudies.map(item => item.industry)];
  useEffect(() => {
    const sync = () => { const value = new URLSearchParams(location.search).get('industry') || '0'; setIndustry(/^[0-6]$/.test(value) ? value : '0'); };
    sync();
    addEventListener('popstate', sync);
    return () => removeEventListener('popstate', sync);
  }, []);
  const item = caseStudies.find(study => path === `/cases/${study.slug}`);
  if (item) return <CaseDetail item={item} />;
  return <main className="cases-page" id="home">
    <h1 className="cases-visually-hidden">一念智能应用场景示例</h1>
    <FeaturedCases />
    <section className="cases-library" id="case-library" aria-label="案例列表">
      <nav className="cases-filters" aria-label="按行业筛选案例">{industries.map((label,index) => <a key={label} href={index ? `/cases?industry=${index}#case-library` : '/cases#case-library'} aria-current={industry === String(index) ? 'true' : undefined} onClick={event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        setIndustry(String(index));
        history.pushState(null,'',index ? `/cases?industry=${index}` : '/cases');
      }}>{label}</a>)}</nav>
      <div className="cases-list" aria-live="polite">{caseStudies.filter((_,index) => industry === '0' || industry === String(index+1)).map((study,index) => <a id={`case-${study.slug}`} key={study.slug} className="cases-list-item" href={`/cases/${study.slug}`} data-reveal="tween" data-reveal-y="28" data-reveal-duration="0.6" data-reveal-delay={index % 3 * .08}>
        <div className="cases-list-image"><CaseImage item={study}/></div><h2>{study.title}</h2><p>{study.company} · 场景示例</p>
      </a>)}</div>
      <p className="cases-editorial-note">以上为拟定应用场景，非已核实客户项目；配图为参考项目中的示意素材。</p>
    </section>
  </main>;
}
