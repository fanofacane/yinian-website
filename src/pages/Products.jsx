import { SectionHead, PageHero, Cta } from '../components/Sections.jsx';
import { PRODUCTS } from '../data/content.js';
import { to } from '../lib/url.js';

const PATHS = [
  ['如果你还不清楚 AI 能做什么', '先建立认知', 'boss', '老板课 / 企业培训'],
  ['如果你想法很多但缺少方向', '先梳理优先级', 'plan', '方案班 / 战略咨询'],
  ['如果你已有明确业务场景', '直接进入试点', 'landing', '企业 AI 落地 / 陪跑'],
];

export default function Products() {
  return (
    <>
      <PageHero crumb="课程产品" title="服务产品介绍"
        text="老板课、方案班、企业 AI 落地——从管理者认知到业务落地，陪伴企业走完 AI 转型的每一步。" />
      <section className="section pt-40">
        <div className="container">
          {PRODUCTS.map((p) => (
            <article className="prod-detail reveal" id={p.id} key={p.id}>
              <div className="prod-side">
                <span className="prod-step">{p.step}</span>
                <h2>{p.title}</h2>
                <p className="prod-slogan">{p.slogan}</p>
                <p>{p.desc}</p>
                <a className="btn btn-primary btn-sm" href={to('/contact/')}>咨询课程安排</a>
              </div>
              <dl className="kv">
                <div className="kv-item"><dt>适合人群</dt><dd>{p.who}</dd></div>
                <div className="kv-item">
                  <dt>核心内容</dt>
                  <dd><div className="tags">{p.core.map((c) => <span className="tag" key={c}>{c}</span>)}</div></dd>
                </div>
                <div className="kv-item"><dt>预期收获</dt><dd>{p.gain}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>
      <section className="section section-soft">
        <div className="container">
          <SectionHead eyebrow="如何选择" title="三项服务的区别" />
          <div className="table-wrap reveal">
            <table className="compare">
              <thead><tr><th scope="col">服务</th><th scope="col">主要解决的问题</th><th scope="col">核心成果</th></tr></thead>
              <tbody>
                {PRODUCTS.map((p) => (
                  <tr key={p.id}><th scope="row">{p.title}</th><td>{p.question}</td><td>{p.result}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="path-grid mt-32">
            {PATHS.map(([cond, title, id, go]) => (
              <div className="path reveal" key={id}>
                <div className="if">{cond}</div>
                <h3>{title}</h3>
                <a className="go" href={`#${id}`}>{go} →</a>
              </div>
            ))}
          </div>
          <p className="note center mt-28">具体课时、形式、价格与开课时间，欢迎咨询了解。</p>
        </div>
      </section>
      <Cta title="想了解最近的开课安排？" text="留下你的联系方式，我们会为你介绍适合的课程与时间。" />
    </>
  );
}
