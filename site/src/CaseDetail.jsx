import { CaretRight } from '@phosphor-icons/react';
import { caseStudies } from './case-studies';
import { caseArticles } from './case-articles';
import './case-detail.css';

export function CaseDetail({ item }) {
  const next = caseStudies[(caseStudies.findIndex(study => study.slug === item.slug) + 1) % caseStudies.length];
  const article = caseArticles[item.slug];
  return <main className="case-detail" id="home">
    <nav className="case-detail-breadcrumb" aria-label="面包屑"><a href="/">首页</a><span/><a href="/cases">一念智能案例</a><span/><span aria-current="page">{item.title}</span></nav>
    <div className="case-detail-layout">
      <article className="case-detail-article">
        <header className="case-detail-text">
          <p className="case-detail-day">{item.industry} · 一念智能</p>
          <h1>{item.title}</h1>
          <p className="case-detail-summary">{article.summary}</p>
          <p className="case-detail-disclosure">业务场景示例 · 基于典型工作流程撰写，非已核实客户项目纪实。</p>
        </header>
        <div className="case-detail-text case-detail-body">
          <div className="case-detail-intro">{article.intro.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
          {article.sections.map(section => <section key={section.title}>
            <h2>{section.title}</h2>
            {section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
            {section.example && <div className="case-detail-example"><span>{section.example.label}</span><p>{section.example.text}</p></div>}
          </section>)}
        </div>
        <nav className="case-detail-next" aria-label="案例文章导航">
          <a className="case-detail-return" href="/cases">返回案例列表</a>
          <a className="case-detail-next-link" href={`/cases/${next.slug}`}><small>下一篇<CaretRight size={12}/></small><span>{next.title}</span></a>
        </nav>
      </article>
    </div>
  </main>;
}
