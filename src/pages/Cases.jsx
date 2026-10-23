import { useState } from 'react';
import { SectionHead, PageHero, LogoWall, Testimonials, Cta } from '../components/Sections.jsx';
import { CASES, SERVICES, PRODUCTS } from '../data/content.js';

const FILTERS = [
  ['all', '全部'],
  ...SERVICES.filter((s) => s.id !== 'token').map((s) => [s.id, s.title]),
  ...PRODUCTS.map((p) => [p.id, p.title]),
];

export default function Cases() {
  const [filter, setFilter] = useState('all');
  return (
    <>
      <PageHero crumb="客户案例" title="客户案例" text="从制造、零售、供应链到职业院校，看不同团队如何把 AI 用进真实工作。" />
      <section className="section pt-40">
        <div className="container">
          <div className="filters reveal" role="group" aria-label="按服务筛选">
            {FILTERS.map(([k, v]) => (
              <button key={k} type="button" className={`filter-btn${filter === k ? ' active' : ''}`}
                aria-pressed={filter === k} onClick={() => setFilter(k)}>{v}</button>
            ))}
          </div>
          {CASES.map((c, i) => (
            <article className="case-full reveal" id={`case-${i + 1}`} key={c.company}
              hidden={!(filter === 'all' || c.keys.includes(filter))}>
              <div className={`case-cover cv-${i + 1}`}>
                <span className="ind">{c.industry}</span>
                <span className="co">{c.company}</span>
                <div className="tags">{c.services.map((s) => <span className="tag" key={s}>{s}</span>)}</div>
              </div>
              <div className="case-full-body">
                <h3>{c.title}</h3>
                <div className="case-steps">
                  <div className="case-step"><h4><i>1</i>业务问题</h4><p>{c.problem}</p></div>
                  <div className="case-step"><h4><i>2</i>实施内容</h4><p>{c.work}</p></div>
                  <div className="case-step"><h4><i>3</i>项目成果</h4><p>{c.result}</p></div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="section section-soft">
        <div className="container">
          <SectionHead eyebrow="企业负责人评价" title="听听他们怎么说" />
          <Testimonials />
        </div>
      </section>
      <section className="section">
        <div className="container">
          <SectionHead eyebrow="服务过的企业与院校" title="陪伴不同团队把 AI 用进真实工作" />
          <LogoWall />
        </div>
      </section>
      <Cta title="你的业务，也可以成为下一个案例" text="告诉我们你遇到的问题，我们一起找到 AI 能发挥价值的地方。" />
    </>
  );
}
