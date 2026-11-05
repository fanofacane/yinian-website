import { ArrowUpRight, ArrowLeft } from '@phosphor-icons/react';
import { products } from './site-pages';
import serviceImages from './service-images.json';
import './interior-pages.css';

export function InteriorPage({ path, onContact }) {
  const product = products.find(item => path === `/solutions/${item.slug}`);
  return <main className="interior-main" id="home">
    <div className="container interior-breadcrumb"><a href="/">首页</a><span>/</span><span>服务与方案</span><span>/</span><span>{product.title}</span></div>
      <section className="container interior-hero product-detail">
        <div><span className="eyebrow">{product.category} · {product.title}</span><h1>{product.label}</h1><p>{product.description}</p><button className="dark-button" onClick={onContact}>聊聊你的需求<ArrowUpRight size={18} /></button><a className="interior-back" href="/#benefits"><ArrowLeft size={15} />了解全部产品和方案</a></div>
        <img src={serviceImages[product.image].src} alt={serviceImages[product.image].alt} width="800" height="600" />
      </section>
      <section className="container interior-section"><div className="interior-section-heading"><span className="eyebrow">服务内容</span><h2>围绕实际任务，<br />一步步向前推进</h2></div><div className="interior-three-grid">{product.points.map((point,i) => <article className="interior-card" key={point}><span className="interior-number">0{i+1}</span><h3>{point}</h3><p>结合企业的业务场景与团队情况确认具体安排，交付范围以双方确认的方案为准。</p></article>)}</div></section>
    <section className="container interior-cta"><div><span className="eyebrow">下一步，从一个问题开始</span><h2>你的团队，想先解决什么？</h2><p>聊聊现状，一起找到适合的 AI 落地起点。</p></div><button className="dark-button" onClick={onContact}>获取免费方案<ArrowUpRight size={18}/></button></section>
  </main>;
}
