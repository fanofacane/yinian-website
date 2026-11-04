import { useEffect } from "react";

// Sample the source sites' spring equations for the Web Animations API.
export function springFrames(stiffness = 300, damping = 60, mass = 1) {
  let x = 0,
    velocity = 0;
  const values = [0];
  for (let frame = 0; frame < 240; frame++) {
    for (let step = 0; step < 4; step++) {
      velocity += (stiffness * (1 - x) - damping * velocity) / mass / 240;
      x += velocity / 240;
    }
    values.push(x);
    if (Math.abs(1 - x) < 0.001 && Math.abs(velocity) < 0.001) break;
  }
  values[values.length - 1] = 1;
  return { values, duration: ((values.length - 1) * 1000) / 60 };
}

export function usePageMotion() {
  useEffect(() => {
    if (!('IntersectionObserver' in window) || !Element.prototype.animate) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const animations = new Map();
    const entered = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const {
          target,
          isIntersecting,
          intersectionRatio,
          boundingClientRect,
        } of entries) {
          const repeat = target.dataset.reveal === "spring";
          if (isIntersecting && (repeat || intersectionRatio >= 0.5)) {
            if (!entered.has(target)) animations.get(target)?.play();
            entered.add(target);
            if (!repeat) observer.unobserve(target);
          } else if (repeat && boundingClientRect.top >= innerHeight) {
            entered.delete(target);
            const animation = animations.get(target);
            animation?.pause();
            if (animation) animation.currentTime = 0;
          }
        }
      },
      { threshold: [0, 0.5] },
    );
    if (!media.matches) {
      document.querySelectorAll("[data-reveal]").forEach((el) => {
        if (el.dataset.revealDesktop && innerWidth < 768) return;
        const y = Number(el.dataset.revealY ?? 24);
        const x = Number(el.dataset.revealX ?? 0);
        const scale = Number(el.dataset.revealScale ?? 1);
        const blur = Number(el.dataset.revealBlur ?? 0);
        const delay = Number(el.dataset.revealDelay ?? 0) * 1000;
        let frames, duration;
        if (el.dataset.reveal === "spring") {
          const spring = springFrames(
            Number(el.dataset.revealStiffness ?? 300),
            Number(el.dataset.revealDamping ?? 60),
            Number(el.dataset.revealMass ?? 1),
          );
          const initialOpacity = Number(el.dataset.revealOpacity ?? 0);
          duration = spring.duration;
          frames = spring.values.map((p) => ({
            opacity: initialOpacity + (1 - initialOpacity) * p,
            transform: `translateY(${y * (1 - p)}px)`,
          }));
        } else {
          duration = Number(el.dataset.revealDuration ?? 0.8) * 1000;
          frames = [
            {
              opacity: 0.001,
              filter: `blur(${blur}px)`,
              transform: `translate(${x}px, ${y}px) scale(${scale})`,
            },
            {
              opacity: 1,
              filter: "blur(0px)",
              transform: "translate(0px,0px) scale(1)",
            },
          ];
        }
        const animation = el.animate(frames, {
          duration,
          delay,
          fill: "both",
          easing:
            el.dataset.reveal === "spring"
              ? "linear"
              : "cubic-bezier(.4,0,.2,1)",
        });
        animation.pause();
        animation.onfinish = () => animation.cancel();
        animations.set(el, animation);
        observer.observe(el);
      });
    }
    const reduce = () => {
      if (media.matches) {
        observer.disconnect();
        animations.forEach((a) => a.cancel());
      }
    };
    media.addEventListener("change", reduce);
    const resize = () => {
      if (innerWidth < 768)
        animations.forEach((animation, el) => {
          if (el.dataset.revealDesktop) {
            animation.cancel();
            observer.unobserve(el);
          }
        });
    };
    addEventListener("resize", resize);
    return () => {
      observer.disconnect();
      animations.forEach((a) => a.cancel());
      media.removeEventListener("change", reduce);
      removeEventListener("resize", resize);
    };
  }, []);
}

// Source CardCenterScrollProgress: the viewport center drives a continuous track.
export function useProcessProgress(section) {
  useEffect(() => {
    const timeline = section.current.querySelector(".process-timeline");
    const track = timeline.querySelector(".process-track");
    const cards = [...timeline.querySelectorAll(".process-step")];
    const transitions = new Map();
    const spring = springFrames(500, 60);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const clamp = (x, max) => Math.max(0, Math.min(max, x));
    // Same piecewise mapping as CardCenterScrollProgress: first card top,
    // all card centers, last card bottom -> measured positions on the track.
    const interpolate = (value, input, output) => {
      if (value <= input[0]) return output[0];
      for (let i = 1; i < input.length; i++) {
        if (value <= input[i]) {
          const t =
            (value - input[i - 1]) / Math.max(1, input[i] - input[i - 1]);
          return output[i - 1] + (output[i] - output[i - 1]) * t;
        }
      }
      return output.at(-1);
    };
    let frame;
    const update = () => {
      frame = null;
      const rect = track.getBoundingClientRect();
      const bounds = cards.map((card) => card.getBoundingClientRect());
      const center = innerHeight * 0.5;
      const centers = bounds.map((card) => card.top + card.height / 2);
      const input = [bounds[0].top, ...centers, bounds.at(-1).bottom];
      const output = [
        0,
        ...centers.map((y) => clamp(y - rect.top, rect.height)),
        rect.height,
      ];
      const ratio =
        interpolate(center, input, output) / Math.max(1, rect.height);
      timeline.style.setProperty("--progress", ratio);
      cards.forEach((card, i) => {
        const active = center >= bounds[i].top;
        if (card.classList.contains("is-active") === active) return;
        const surface = card.querySelector(".process-card");
        const from = Number(
          getComputedStyle(surface).getPropertyValue("--step-active"),
        );
        transitions.get(card)?.cancel();
        card.classList.toggle("is-active", active);
        if (!reduced.matches) {
          const to = active ? 1 : 0;
          transitions.set(
            card,
            surface.animate(
              spring.values.map((p) => ({
                "--step-active": String(from + (to - from) * p),
              })),
              { duration: spring.duration, easing: "linear" },
            ),
          );
        }
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(timeline);
    cards.forEach((card) => resize.observe(card));
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    const reduce = () => {
      if (reduced.matches)
        transitions.forEach((animation) => animation.cancel());
    };
    reduced.addEventListener("change", reduce);
    update();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
      reduced.removeEventListener("change", reduce);
      transitions.forEach((animation) => animation.cancel());
    };
  }, [section]);
}
