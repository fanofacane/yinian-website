import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  X,
  Plus,
  Star,
  Quotes,
  Check,
  Trophy,
} from "@phosphor-icons/react";
import {
  benefits,
  testimonials,
  faqs,
  processSteps,
  projects,
  avatars,
  clientLogos,
  clientNames,
} from "./content";
import { Navigation } from "./Navigation";
import { InteriorPage } from "./InteriorPages";
import { AboutPage } from "./AboutPage";
import { CasesPage } from "./CasesPage";
import serviceImages from "./service-images.json";
import {
  springFrames,
  usePageMotion,
  useProcessProgress,
} from "./motion/usePageMotion";
import { useLogoTicker } from "./motion/useLogoTicker";
import { useHeroPlayback } from "./motion/useHeroPlayback";
import { FollowCursor } from "./motion/FollowCursor";
import { useSmoothScroll } from "./motion/useSmoothScroll";
import { SiteFooter, FloatingActions } from "./SiteChrome";

function HappyClients() {
  return (
    <div className="happy-clients">
      <div className="avatar-stack">
        {avatars.map((src, i) => (
          <img key={src} src={src} alt="" style={{ zIndex: 5 - i }} />
        ))}
      </div>
      <div>
        <div className="stars" aria-label="星级图示">
          {Array.from({ length: 5 }, (_, i) => (
            <Star weight="fill" key={i} size={14} />
          ))}
        </div>
        <p>130+ 企业与院校</p>
      </div>
    </div>
  );
}
function Hero({ onProject }) {
  const gallery = useRef(null);
  const logoWindow = useRef(null);
  const metrics = useRef(null);
  const { activeImage, countProgress } = useHeroPlayback(gallery, metrics, projects.length);
  useLogoTicker(logoWindow);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let frame;
    const update = () => {
      frame = null;
      const hero = document.getElementById("home").getBoundingClientRect();
      // The original cards continue into a Projects section omitted from this composition.
      // Keep their scroll-driven de-stacking within the retained hero instead.
      const progress = media.matches
        ? 0
        : Math.max(0, Math.min(1, -hero.top / (hero.height * 0.65)));
      gallery.current.style.setProperty("--unstack", progress);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    media.addEventListener("change", schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
      media.removeEventListener("change", schedule);
    };
  }, []);
  return (
    <section className="hero" id="home" aria-labelledby="hero-heading">
      <div className="container hero-layout">
        <div className="hero-copy">
          <div
            className="availability"
            data-reveal="tween"
            data-reveal-y="0"
            data-reveal-delay="0.4"
            data-reveal-duration="0.6"
          >
            <span />
            企业 AI 落地一站式服务商
          </div>
          <h1 id="hero-heading">
            <span>
              <RevealWords text="让每一家企业" />
            </span>
            <br />
            <RevealWords text="都能用好 AI" start={2} />
          </h1>
          <p
            className="hero-description"
            data-reveal="tween"
            data-reveal-blur="5"
            data-reveal-y="10"
            data-reveal-delay="0.85"
          >
            <strong>
              不是卖工具，而是帮你把 AI 真正用出业务价值。
            </strong>{" "}
            从战略咨询、企业培训、AI 转型陪跑到智能体开发，助力企业高效拥抱人工智能时代。
          </p>
          <div
            className="hero-metrics"
            ref={metrics}
            aria-label="服务数据"
            data-reveal="tween"
            data-reveal-y="0"
            data-reveal-delay="0.4"
            data-reveal-duration="0.6"
          >
            {[[150, "+", "举办培训"], [50, "%+", "办公提效"], [98, "%+", "满意度"], [130, "+", "累计服务企业"]].map(([value, suffix, label]) => (
              <p key={label}><strong aria-label={`${value}${suffix}`} data-final={`${value}${suffix}`}><span aria-hidden="true">{Math.round(value * countProgress)}{suffix}</span></strong><span>{label}</span></p>
            ))}
          </div>
        </div>
        <div className="hero-gallery" ref={gallery}>
          <div
            className="project-stack"
            data-reveal="tween"
            data-reveal-y="200"
            data-reveal-scale="0.8"
            data-reveal-duration="0.5"
          >
            {projects.map((project, i) => (
              <a
                key={project.name}
                className={`project-image rank-${(i - activeImage + projects.length) % projects.length}`}
                aria-label={`查看 ${project.name} 图片`}
                href={project.fullImage}
                onClick={(event) => {
                  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
                  event.preventDefault();
                  onProject(project);
                }}
              >
                <img src={project.image} srcSet={project.srcSet} sizes="(max-width: 809px) 80vw, 600px" width={project.width} height={project.height} decoding="async" fetchPriority={i === 0 ? "high" : "auto"} alt={project.alt} />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="client-strip">
        <div className="container client-strip-inner">
          <HappyClients />
          <div
            className="logo-window"
            ref={logoWindow}
            aria-label="企业与院校名称"
          >
            <div className="logo-track">
              {[0, 1].map((copy) => (
                <div className="logo-group" key={copy} aria-hidden={copy === 1}>
                  {clientLogos.map((src, i) => (
                    <span key={src} style={{ display: "inline-flex", alignItems: "center", gap: 12, whiteSpace: "nowrap" }}>
                    <img
                      src={src}
                      alt=""
                    />
                    <span>{clientNames[i]}</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
function RevealWords({ text, start = 0, delay = 0.2 }) {
  return text.split(" ").map((word, i) => (
    <span
      key={`${word}-${i}`}
      className="reveal-word"
      data-reveal="tween"
      data-reveal-y="10"
      data-reveal-blur="5"
      data-reveal-delay={delay + (i + start) * 0.05}
    >
      {word}
      {i < text.split(" ").length - 1 ? "\u00a0" : ""}
    </span>
  ));
}
function Benefits() {
  return (
    <section
      className="section benefits"
      id="benefits"
      aria-labelledby="benefits-heading"
    >
      <div className="container">
        <div
          className="section-heading centered"
          data-reveal="spring"
          data-reveal-y="64"
          data-reveal-opacity="1"
          data-reveal-stiffness="500"
          data-reveal-damping="60"
        >
          <span className="eyebrow">产品和方案</span>
          <h2 id="benefits-heading">找到适合你的 AI 落地起点</h2>
          <p>
            从管理者认知，到企业方案，再到业务落地，
            <br className="desktop-break" />按当前阶段选择适合的服务。
          </p>
        </div>
        <div className="benefit-grid">
          {benefits.map(([title, body], i) => (
            <article
              className="benefit-card"
              key={title}
              data-reveal="spring"
              data-reveal-y={96 + i * 32}
            >
              <div className="service-image">
                <img src={serviceImages[i].src} srcSet={serviceImages[i].srcSet}
                  sizes="(max-width: 559px) calc(100vw - 40px), (max-width: 809px) 520px, (min-width: 1700px) 470px, 390px"
                  width={serviceImages[i].width} height={serviceImages[i].height}
                  alt={serviceImages[i].alt} loading="lazy" decoding="async" />
              </div>
              <div className="benefit-copy">
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
function Process() {
  const section = useRef(null);
  useProcessProgress(section);
  return (
    <section
      className="section process"
      id="process"
      ref={section}
      aria-labelledby="process-heading"
    >
      <div className="container process-layout">
        <div
          className="section-heading process-intro"
          data-reveal="spring"
          data-reveal-y="64"
          data-reveal-stiffness="500"
        >
          <span className="eyebrow">
            <Trophy size={17} />
            服务体系
          </span>
          <h2 id="process-heading">
            覆盖企业 AI 落地
            <br className="desktop-break" />的关键环节
          </h2>
          <p>
            从方向判断、团队能力到应用开发与持续使用，按实际需求组合服务。
          </p>
        </div>
        <div className="process-timeline" style={{ "--progress": 0 }}>
          <div className="process-track-shell" aria-hidden="true">
            <div className="process-track">
              <div className="process-fill" />
            </div>
          </div>
          {processSteps.map((step, i) => (
            <article key={step.title} className="process-step">
              <div className="step-icon">
                <img src={step.icon} alt="" />
              </div>
              <div className="process-card">
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
function Reviews() {
  return (
    <section
      className="section reviews"
      id="reviews"
      aria-labelledby="reviews-heading"
    >
      <div className="container">
        <div className="review-heading">
          <h2 id="reviews-heading">
            <span className="muted">
              <RevealWords text="听听企业负责人" delay={0} />
            </span>
            <br />
            <RevealWords text="怎么说" start={4} delay={0} />
          </h2>
          <HappyClients />
        </div>
        <div
          className="review-grid"
          tabIndex={0}
          aria-label="客户评价，手机端可横向滑动。"
        >
          {testimonials.map(({ quoteParts, name, role, image }, i) => (
            <article
              className="review-card"
              key={`${name}-${i}`}
              data-reveal="tween"
              data-reveal-y="0"
              data-reveal-x={-5 * ((i % 3) + 1)}
              data-reveal-delay={i * 0.1}
              data-reveal-duration="0.6"
              data-reveal-desktop="true"
            >
              <Quotes weight="fill" size={19} />
              <p>
                {quoteParts.map((part, i) =>
                  part.bold ? <strong key={i}>{part.text}</strong> : part.text,
                )}
              </p>
              <div className="review-author">
                <img src={image} alt="" loading="lazy" decoding="async" width="48" height="48" />
                <div>
                  <h3>{name}</h3>
                  <span>{role}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
function FAQs() {
  const [opened, setOpened] = useState(new Set());
  const [interactive, setInteractive] = useState(false);
  useEffect(() => { setInteractive(true); }, []);
  const animations = useRef(new Map());
  const previous = useRef(new Set());
  useLayoutEffect(() => {
    const spring = springFrames(600, 60);
    faqs.forEach((_, i) => {
      if (opened.has(i) === previous.current.has(i)) return;
      const el = document.getElementById(`answer-${i}`);
      const fullHeight = el.firstElementChild.scrollHeight;
      const existing = animations.current.get(i);
      const from =
        existing?.height.playState === "running"
          ? el.getBoundingClientRect().height
          : opened.has(i)
            ? 0
            : fullHeight;
      const icon = el.closest(".faq-item").querySelector(".faq-icon svg");
      const matrix = new DOMMatrixReadOnly(getComputedStyle(icon).transform);
      const fromAngle = existing?.icon.playState === "running"
        ? Math.atan2(matrix.b, matrix.a) * 180 / Math.PI
        : opened.has(i) ? 0 : 45;
      existing?.height.cancel();
      existing?.icon.cancel();
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const to = opened.has(i) ? fullHeight : 0;
      const animation = el.animate(
        spring.values.map((p) => ({ height: `${from + (to - from) * p}px` })),
        { duration: spring.duration, easing: "linear" },
      );
      const toAngle = opened.has(i) ? 45 : 0;
      const iconAnimation = icon.animate(
        spring.values.map((p) => ({ transform: `rotate(${fromAngle + (toAngle - fromAngle) * p}deg)` })),
        { duration: spring.duration, easing: "linear" },
      );
      animations.current.set(i, { height: animation, icon: iconAnimation });
    });
    previous.current = new Set(opened);
  }, [opened]);
  useEffect(
    () => () => animations.current.forEach(({ height, icon }) => { height.cancel(); icon.cancel(); }),
    [],
  );
  const toggle = (i) =>
    setOpened((current) => {
      const next = new Set(current);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  return (
    <section className="section faqs" id="faqs" aria-labelledby="faq-heading">
      <div className="container">
        <div className="section-heading centered" data-reveal="spring" data-reveal-y="64" data-reveal-stiffness="500">
          <h2 id="faq-heading">你关心的问题，我们来解答</h2>
          <p>
            关于服务选择、项目落地、周期费用与资料处理的常见问题。
          </p>
        </div>
        <div className="faq-list">
          {faqs.map(({ question, answer }, i) => (
            <article
              className={`faq-item ${opened.has(i) ? "is-open" : ""}`}
              key={question}
              data-reveal="spring"
              data-reveal-y="96"
              data-reveal-stiffness="500"
              onClick={() => toggle(i)}
            >
              <h3>
                <button
                  aria-expanded={!interactive || opened.has(i)}
                  disabled={!interactive}
                  aria-controls={`answer-${i}`}
                >
                  <span>{question}</span>
                  <span className="faq-icon" aria-hidden="true"><Plus size={20} weight="regular" /></span>
                </button>
              </h3>
              <div
                id={`answer-${i}`}
                className="faq-answer"
                inert={interactive && !opened.has(i)}
              >
                <div>
                  <div className="faq-answer-content"><p>{answer}</p></div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
function Overlay({ children, onClose, className = "", label }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = before;
      dialog.close();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`dialog ${className}`}
      onCancel={onClose}
      aria-label={label}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dialog-content">
        <button
          className="dialog-close"
          aria-label="关闭弹窗"
          onClick={onClose}
        >
          <X size={24} />
        </button>
        {children}
      </div>
    </dialog>
  );
}
function Contact({ onClose }) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  function save(e) {
    e.preventDefault();
    try {
      localStorage.setItem(
        "our-studio-enquiry",
        JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
      );
      setSaved(true);
      setError("");
    } catch {
      setError("当前浏览器无法保存草稿，请重试。");
    }
  }
  return (
    <Overlay onClose={onClose} label="预约咨询" className="contact-dialog">
      <h2>预约咨询</h2>
      <p>告诉我们你的业务需求与 AI 应用想法。</p>
      <form onSubmit={save}>
        <label>
          姓名
          <input name="name" autoComplete="name" required />
        </label>
        <label>
          邮箱
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          需求描述
          <textarea name="message" rows={4} required />
        </label>
        <button className="dark-button" type="submit">
          {saved ? (
            <>
              <Check size={18} />
              草稿已保存
            </>
          ) : (
            <>
              保存咨询草稿
              <ArrowUpRight size={18} />
            </>
          )}
        </button>
        <p className="form-note" role="status">
          {error ||
            (saved
              ? "咨询草稿已保存在当前浏览器，尚未发送。"
              : "本地预览表单，仅在当前设备保存草稿。")}
        </p>
      </form>
    </Overlay>
  );
}
export function App({ notFound = false, path = "/" }) {
  usePageMotion();
  useEffect(() => {
    document.documentElement.dataset.interactive = "true";
    return () => { delete document.documentElement.dataset.interactive; };
  }, []);
  const [contact, setContact] = useState(false);
  const [project, setProject] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const openContact = (event) => { event?.preventDefault(); setContact(true); };
  useSmoothScroll(Boolean(contact || project || menuOpen));
  return (
    <>
      <a className="skip-link" href="#home">
        跳转到正文
      </a>
      {!notFound && <Navigation
        path={path}
        onContact={openContact}
        onMenuChange={setMenuOpen}
      />}
      <FollowCursor />
      {notFound ? <main className="not-found" id="home"><p>404</p><h1>页面未找到</h1><p>你访问的页面不存在，或已被移走。</p><a className="dark-button" href="/">返回首页</a></main> : path === '/about' ? <AboutPage /> : path === '/cases' || path.startsWith('/cases/') ? <CasesPage path={path} /> : path !== "/" ? <InteriorPage path={path} onContact={openContact} /> : <main>
        <Hero onProject={setProject} />
        <Benefits />
        <Process />
        <Reviews />
        <FAQs />
      </main>}
      <SiteFooter onContact={openContact} />
      <FloatingActions onContact={openContact} hideInHero={!notFound && path === "/"} />
      {contact && <Contact onClose={() => setContact(false)} />}{" "}
      {project && (
        <Overlay
          label={project.name}
          onClose={() => setProject(null)}
          className="project-dialog"
        >
          <img src={project.fullImage} alt={project.alt} />
          <p>{project.name}</p>
        </Overlay>
      )}
    </>
  );
}
