import { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import {
  STATS, STATS_NOTE, CLIENTS, SERVICES, PRODUCTS, TESTIMONIALS, CASES, FAQ,
} from '../data/content.js';
import { to } from '../lib/url.js';

export function SectionHead({ eyebrow, title, text }) {
  return (
    <div className="section-head reveal">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

export function PageHero({ crumb, title, text }) {
  return (
    <section className="page-hero">
      <div className="container">
        <div className="crumbs"><a href={to('/')}>首页</a> / {crumb}</div>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
    </section>
  );
}

// 数字滚动：预渲染输出最终数字，进入视口后在浏览器里从 0 滚动到目标值
function CountUp({ value }) {
  const ref = useRef(null);
  const [n, setN] = useState(value);
  useEffect(() => {
    const el = ref.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!el || reduce || !('IntersectionObserver' in window)) return;
    let raf;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const step = (t) => {
        const p = Math.min((t - start) / 1200, 1);
        setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value]);
  return <span ref={ref}>{n}</span>;
}

export function Stats() {
  return (
    <>
      <div className="stats reveal">
        {STATS.map((s) => (
          <div className="stat" key={s.label}>
            <div className="stat-num"><CountUp value={s.num} /><em>{s.unit}</em></div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
      <p className="stats-note">{STATS_NOTE}</p>
    </>
  );
}

const MARK_COLORS = ['#2457f5', '#12b3c7', '#3a3fd8', '#0e6fd8', '#1b4fc8', '#0f9db0'];

export function LogoWall() {
  return (
    <div className="logo-wall reveal">
      {CLIENTS.map((c, i) => (
        <div className="logo-tile" key={c}>
          <span className="logo-mark" style={{ background: MARK_COLORS[i % 6] }}>{c[0]}</span>{c}
        </div>
      ))}
    </div>
  );
}

export function ServiceCards() {
  return (
    <div className="svc-grid">
      {SERVICES.map((s) => (
        <a className="svc-card reveal" href={to(`/services/#${s.id}`)} key={s.id}>
          <span className="svc-no">{s.no}</span>
          <span className="svc-ico"><Icon name={s.icon} /></span>
          <h3>{s.title}</h3>
          <p>{s.short}</p>
          <span className="link-arrow">了解详情</span>
        </a>
      ))}
    </div>
  );
}

export function ProductCards() {
  return (
    <div className="prod-grid">
      {PRODUCTS.map((p) => (
        <div className="prod-card reveal" key={p.id}>
          <span className="prod-step">{p.step}</span>
          <h3>{p.title}</h3>
          <p className="prod-slogan">{p.slogan}</p>
          <div className="prod-q">解决的问题：<b>{p.question}</b></div>
          <a className="link-arrow" href={to(`/products/#${p.id}`)}>查看课程详情</a>
        </div>
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <div className="testi-grid">
      {TESTIMONIALS.map((t) => (
        <figure className="testi reveal" key={t.name}>
          <blockquote>{t.quote}</blockquote>
          <figcaption className="testi-meta">
            <span className="avatar">{t.name[0]}</span>
            <span><b>{t.name}</b><small>{t.role}</small></span>
            <span className="tag">{t.service}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export function CaseCards({ indexes }) {
  return (
    <div className="case-grid">
      {indexes.map((i) => {
        const c = CASES[i];
        return (
          <a className="case-card reveal" href={to(`/cases/#case-${i + 1}`)} key={c.company} style={{ color: 'inherit' }}>
            <div className={`case-cover cv-${i + 1}`}>
              <span className="ind">{c.industry}</span>
              <span className="co">{c.company}</span>
            </div>
            <div className="case-body">
              <h3>{c.title}</h3>
              <p>{c.problem}</p>
              <div className="tags">{c.services.map((s) => <span className="tag" key={s}>{s}</span>)}</div>
            </div>
          </a>
        );
      })}
    </div>
  );
}

export function Faq({ indexes }) {
  return (
    <div className="faq reveal">
      {indexes.map((i, n) => (
        <details key={i} open={n === 0}>
          <summary>{FAQ[i][0]}</summary>
          <div className="ans"><p>{FAQ[i][1]}</p></div>
        </details>
      ))}
    </div>
  );
}

export function Cta({
  title = '准备好让 AI 为业务创造价值了吗？',
  text = '告诉我们你的业务现状与目标，我们会帮你判断从哪里开始最合适。',
}) {
  return (
    <section className="cta-band">
      <div className="container">
        <div className="cta-box reveal">
          <div>
            <h2>{title}</h2>
            <p>{text}</p>
          </div>
          <div className="cta-actions">
            <a className="btn btn-light" href={to('/contact/')}>预约免费咨询</a>
            <a className="btn btn-outline-light" href={to('/products/')}>查看课程产品</a>
          </div>
        </div>
      </div>
    </section>
  );
}
