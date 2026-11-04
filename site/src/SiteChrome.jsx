import { useEffect, useRef, useState } from "react";
import { ArrowUp, Phone, Headset, WechatLogo } from "@phosphor-icons/react";
import { navigation } from "./content";
import "./site-chrome.css";

// User-approved local preview placeholders; replace before connecting real contact channels.
export const contactDetails = { phone: "4000000", telephone: "4000000", wechatQR: "/assets/wechat-placeholder.svg" };

export function HeaderContact({ onContact }) {
  return <div className="header-contact">
    <a className="header-phone" href={`tel:${contactDetails.telephone}`}>{contactDetails.phone}</a>
    <a className="scheme-button nav-contact" href="#contact-info" onClick={onContact}>免费方案</a>
  </div>;
}

export function SiteFooter({ onContact }) {
  return <footer className="site-footer" id="contact-info">
    <div className="footer-inner">
      <div className="footer-top">
        <h2>让每一家企业<br className="footer-title-break" />都能用好 AI</h2>
        <nav className="footer-nav" aria-label="页脚导航">
          {navigation.map(([label, id]) => <a key={id} href={`/#${id}`}>{label}</a>)}
        </nav>
      </div>
      <div className="footer-main">
        <div className="footer-brand">
          <p>联系电话：</p>
          <a className="footer-phone" href={`tel:${contactDetails.telephone}`}>{contactDetails.phone}</a>
          <p className="footer-services">战略咨询　企业培训　转型陪跑　Agent 开发</p>
        </div>
        <div className="footer-columns">
          <div><h3>一念智能</h3><p>企业 AI 落地一站式服务商</p><p>不是卖工具，而是帮你把 AI<br />真正用出业务价值。</p></div>
          <div><h3>服务产品</h3><a href="/#benefits">老板课</a><a href="/#benefits">方案班</a><a href="/#benefits">企业 AI 落地</a></div>
          <div><h3>一起开启 AI 落地</h3><p>从你的实际业务需求出发</p><a className="footer-contact" href="#contact-info" onClick={onContact}>获取免费方案 ↗</a></div>
        </div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} 一念智能. All Rights Reserved.</span><span>咨询 · 培训 · 陪跑 · 产品 · 算力</span></div>
    </div>
  </footer>;
}

export function FloatingActions({ onContact, hideInHero = false }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(!hideInHero);
  useEffect(() => {
    if (!hideInHero) return;
    const hero = document.getElementById("home");
    if (!hero) return;
    const update = () => {
      const show = hero.getBoundingClientRect().bottom <= 88;
      if (!show) {
        ref.current?.querySelectorAll("details[open]").forEach((item) => { item.open = false; });
        if (ref.current?.contains(document.activeElement)) document.activeElement.blur();
      }
      setVisible(show);
    };
    const observer = new IntersectionObserver(update, { rootMargin: "-88px 0px 0px 0px", threshold: 0 });
    observer.observe(hero);
    update();
    return () => observer.disconnect();
  }, [hideInHero]);
  const hoverOpen = (event) => { if (event.pointerType === "mouse") event.currentTarget.open = true; };
  const hoverClose = (event) => { if (event.pointerType === "mouse" && !event.currentTarget.contains(document.activeElement)) event.currentTarget.open = false; };
  useEffect(() => {
    const close = (event) => {
      if (event.type === "keydown" && event.key !== "Escape") return;
      if (event.type === "pointerdown" && ref.current?.contains(event.target)) return;
      ref.current?.querySelectorAll("details[open]").forEach((item) => { item.open = false; });
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", close); };
  }, []);
  return <aside className={`floating-actions${visible ? " is-visible" : ""}`} aria-label="快捷联系" aria-hidden={!visible} inert={!visible} ref={ref}>
    <a className="float-action" href="#" aria-label="返回顶部" title="返回顶部"><ArrowUp size={25} weight="light" /></a>
    <details className="float-phone" onPointerEnter={hoverOpen} onPointerLeave={hoverClose}>
      <summary className="float-action" aria-label="电话咨询" title="电话咨询"><Phone size={25} weight="light" /><span className="phone-accent" /></summary>
      <div className="phone-popover"><a href={`tel:${contactDetails.telephone}`}><Phone size={24} />{contactDetails.phone}</a></div>
    </details>
    <a className="float-action" href="#contact-info" aria-label="在线咨询" title="在线咨询" onClick={onContact}><Headset size={25} weight="light" /></a>
    <details className="float-wechat" onPointerEnter={hoverOpen} onPointerLeave={hoverClose}>
      <summary className="float-action" aria-label="微信咨询" title="微信咨询"><WechatLogo size={27} weight="light" /></summary>
      <div className="wechat-popover">
        <img src={contactDetails.wechatQR} alt="一念智能微信二维码占位图" width="160" height="160" />
        <p className="qr-caption">微信二维码占位</p>
      </div>
    </details>
  </aside>;
}
