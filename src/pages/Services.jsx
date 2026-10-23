import { useEffect, useRef, useState } from 'react';
import Icon from '../components/Icon.jsx';
import { SectionHead, PageHero, Cta } from '../components/Sections.jsx';
import { SERVICES } from '../data/content.js';
import { to } from '../lib/url.js';

// 吸顶的服务锚点导航：滚动时高亮当前所在的服务
function ServiceNav() {
  const [active, setActive] = useState(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: '-40% 0px -55% 0px' });
    SERVICES.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const link = active && listRef.current?.querySelector(`a[href="#${active}"]`);
    if (link) {
      const ul = listRef.current;
      ul.scrollTo({ left: link.offsetLeft - (ul.clientWidth - link.offsetWidth) / 2, behavior: 'smooth' });
    }
  }, [active]);

  return (
    <nav className="svc-nav" aria-label="服务导航">
      <div className="container">
        <ul ref={listRef}>
          {SERVICES.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className={active === s.id ? 'active' : undefined}>{s.no} {s.title}</a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default function Services() {
  return (
    <>
      <PageHero crumb="服务体系" title="企业 AI 落地服务体系"
        text="咨询 → 培训 → 陪跑 → 产品 → 算力。不是卖工具，而是帮你把 AI 真正用出业务价值。" />
      <section className="section pt-40">
        <div className="container">
          <SectionHead eyebrow="五位一体 · 完整闭环" title="覆盖 AI 转型全过程"
            text="从找准方向、建立能力，到落地执行、开发应用，再到持续使用所需的资源支持。" />
          <div className="loop-diagram">
            {SERVICES.map((s) => (
              <div className="loop-node reveal" key={s.id}>
                <span className="circle"><Icon name={s.icon} /></span>
                <div className="kw">{s.kw} · {s.goal}</div>
                <h3>{s.title}</h3>
                <p>{s.short}</p>
              </div>
            ))}
          </div>
          <p className="loop-back reveal">每一个环节都可单独选择，也可以组合成完整的企业 AI 落地方案。</p>
        </div>
      </section>
      <ServiceNav />
      {SERVICES.map((s) => (
        <section className="svc-detail" id={s.id} key={s.id}>
          <div className="container svc-detail-grid">
            <div className="reveal">
              <div className="svc-big-no text-grad">{s.no}</div>
              <h2>{s.title}</h2>
              <p className="svc-slogan">{s.slogan}</p>
              <p className="desc">{s.desc}</p>
              <a className="btn btn-primary btn-sm" href={to('/contact/')}>咨询该服务</a>
            </div>
            <div className="reveal">
              <div className="feat-grid">
                {s.feats.map(([t, d]) => <div className="feat" key={t}><h4>{t}</h4><p>{d}</p></div>)}
              </div>
              <div className="deliver">
                <b>主要交付</b>
                <div className="tags">{s.deliver.map((d) => <span className="tag" key={d}>{d}</span>)}</div>
              </div>
              {s.note && <p className="note">* {s.note}</p>}
            </div>
          </div>
        </section>
      ))}
      <div className="spacer-96"></div>
      <Cta title="不确定该从哪项服务开始？" text="先聊聊你的业务现状，我们帮你判断最合适的切入点。" />
    </>
  );
}
