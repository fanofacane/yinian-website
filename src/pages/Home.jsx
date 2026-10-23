import { Fragment } from 'react';
import Icon from '../components/Icon.jsx';
import {
  SectionHead, Stats, LogoWall, ServiceCards, ProductCards, Testimonials, CaseCards, Faq, Cta,
} from '../components/Sections.jsx';
import { BRAND, AUDIENCE, CLIENTS_TEXT } from '../data/content.js';
import { to } from '../lib/url.js';

const ROAD = [
  ['01', 'AI 战略咨询', '场景梳理 · ROI 评估', 'done', '已完成'],
  ['02', '企业 AI 培训', '管理层 + 业务团队', 'done', '已完成'],
  ['03', 'AI 转型陪跑', '试点场景推进中', 'now', '进行中'],
  ['04', 'Agent 开发', '知识问答助手', '', '规划中'],
  ['05', '算力支持', 'Token 用量规划', '', '规划中'],
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="badge"><span className="badge-dot">✦</span>{BRAND.tag}</span>
            <h1>让每一家企业<br />都能<span className="text-grad">用好AI</span></h1>
            <p className="hero-lead">{BRAND.desc}</p>
            <div className="hero-actions">
              <a className="btn btn-primary" href={to('/contact/')}>预约免费咨询</a>
              <a className="btn btn-ghost" href={to('/services/')}>了解服务体系</a>
            </div>
            <div className="audience">
              服务对象：{AUDIENCE.map((a) => <span className="chip" key={a}>{a}</span>)}
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="panel">
              <div className="panel-head">
                <span className="panel-title">企业 AI 落地路线</span>
                <span className="panel-pill">● 持续推进</span>
              </div>
              <div className="road">
                {ROAD.map(([n, t, s, c, st]) => (
                  <div className={`road-item ${c}`} key={n}>
                    <span className="num">{n}</span>
                    <span><b>{t}</b><small>{s}</small></span>
                    <span className="state">{st}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="float-card float-a"><span className="ico"><Icon name="spark" /></span><span><strong>98%+</strong><small>学员满意度</small></span></div>
            <div className="float-card float-b"><span className="ico"><Icon name="team" /></span><span><strong>5万+</strong><small>覆盖学员</small></span></div>
          </div>
        </div>
      </section>

      <div className="container stats-wrap"><Stats /></div>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow="服务过的企业与院校" title="从认知学习到业务实践" text={CLIENTS_TEXT} />
          <LogoWall />
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <SectionHead eyebrow="企业 AI 落地服务体系" title="五位一体 · 完整闭环"
            text="从找准方向、建立能力，到落地执行、开发应用，再到持续使用所需的资源支持，一念智能为企业提供完整的 AI 落地服务。" />
          <div className="loop-flow reveal">
            {['咨询', '培训', '陪跑', '产品', '算力'].map((k, i) => (
              <Fragment key={k}>{i > 0 && <i>→</i>}<span>{k}</span></Fragment>
            ))}
          </div>
          <ServiceCards />
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div className="quote-block reveal">
            <span className="eyebrow">我们的主张</span>
            <h3>不是卖工具，<br />而是帮你把 AI 真正用出业务价值。</h3>
          </div>
          <div className="reveal">
            <span className="eyebrow">关于一念智能</span>
            <h2 className="h2-sm">从真实业务问题出发</h2>
            <p>{BRAND.intro[0]}</p>
            <ul className="check-list">
              <li>帮助管理者看清方向，找到真正值得做的 AI 场景</li>
              <li>帮助团队掌握方法，课后就能把 AI 用进日常工作</li>
              <li>将 AI 融入流程与具体场景，让技术投入转化为可持续的业务价值</li>
            </ul>
            <p className="mt-28"><a className="link-arrow" href={to('/about/')}>了解我们</a></p>
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <SectionHead eyebrow="服务产品" title="找到适合你当前阶段的起点"
            text="从管理者认知，到场景方案，再到业务落地，三款产品对应企业 AI 转型的不同阶段。" />
          <ProductCards />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow="企业负责人评价" title="听听他们怎么说" />
          <Testimonials />
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <SectionHead eyebrow="客户案例" title="把 AI 用进真实业务" />
          <CaseCards indexes={[0, 3, 4]} />
          <p className="center mt-40"><a className="btn btn-ghost" href={to('/cases/')}>查看全部案例</a></p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow="常见问题" title="你可能关心的问题" />
          <Faq indexes={[0, 1, 2, 3]} />
          <p className="center mt-32"><a className="link-arrow" href={to('/about/#faq')}>查看更多问题</a></p>
        </div>
      </section>

      <Cta />
    </>
  );
}
