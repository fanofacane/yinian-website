import Icon from '../components/Icon.jsx';
import { SectionHead, PageHero, Stats, LogoWall, Faq, Cta } from '../components/Sections.jsx';
import { BRAND, CLIENTS_TEXT } from '../data/content.js';

const AUDIENCE = [
  ['boss', '企业负责人', '看清 AI 方向，建立判断力'],
  ['team', '管理团队', '把 AI 用进管理与决策'],
  ['biz', '业务部门', '在具体任务中提升效率'],
  ['board', '培训负责人', '组织系统的 AI 能力建设'],
  ['school', '院校', '推动 AI 进入教学与备课'],
];

export default function About() {
  return (
    <>
      <PageHero crumb="关于我们" title="关于一念智能" text="企业 AI 落地一站式服务商。让每一家企业都能用好 AI。" />
      <section className="section pt-40">
        <div className="container split">
          <div className="reveal">
            <span className="eyebrow">品牌介绍</span>
            <h2 className="h2-sm">专注企业 AI 应用与落地</h2>
            {BRAND.intro.map((p) => <p key={p}>{p}</p>)}
          </div>
          <div className="quote-block reveal">
            <span className="eyebrow">核心主张</span>
            <h3>不是卖工具，<br />而是帮你把 AI 真正用出业务价值。</h3>
          </div>
        </div>
      </section>
      <section className="section section-dark">
        <div className="container">
          <SectionHead eyebrow="核心业务数据" title="用结果说话" />
          <Stats />
        </div>
      </section>
      <section className="section">
        <div className="container">
          <SectionHead eyebrow="服务对象" title="我们服务谁" />
          <div className="aud-grid">
            {AUDIENCE.map(([ic, t, d]) => (
              <div className="aud reveal" key={t}><span className="svc-ico"><Icon name={ic} /></span><h3>{t}</h3><p>{d}</p></div>
            ))}
          </div>
        </div>
      </section>
      <section className="section section-soft">
        <div className="container">
          <SectionHead eyebrow="服务过的企业与院校" title="从认知学习到业务实践" text={CLIENTS_TEXT} />
          <LogoWall />
        </div>
      </section>
      <section className="section" id="faq">
        <div className="container">
          <SectionHead eyebrow="常见问题" title="FAQ" />
          <Faq indexes={[0, 1, 2, 3, 4, 5]} />
        </div>
      </section>
      <Cta />
    </>
  );
}
