import { useEffect, useState } from "react";

export function useHeroPlayback(gallery, metrics, imageCount) {
  const [activeImage, setActiveImage] = useState(0);
  // SSR and no-JS visitors receive the final values immediately.
  const [countProgress, setCountProgress] = useState(1);

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let frame, started = false;
    const finish = () => {
      cancelAnimationFrame(frame);
      setCountProgress(1);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started) return;
      started = true;
      observer.disconnect();
      if (media.matches) return;
      setCountProgress(0);
      const start = performance.now() + 450;
      const tick = (now) => {
        const progress = Math.max(0, Math.min(1, (now - start) / 1900));
        setCountProgress(1 - (1 - progress) ** 3);
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    observer.observe(metrics.current);
    const onPreference = () => { if (media.matches) finish(); };
    media.addEventListener("change", onPreference);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      media.removeEventListener("change", onPreference);
    };
  }, [metrics]);

  useEffect(() => {
    const element = gallery.current;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false, hovered = false, timer;
    const update = () => {
      clearInterval(timer);
      if (!visible || hovered || document.hidden || media.matches || element.contains(document.activeElement)) return;
      timer = setInterval(() => setActiveImage(index => (index + 1) % imageCount), 4000);
    };
    const enter = () => { hovered = true; update(); };
    const leave = () => { hovered = false; update(); };
    const blur = () => queueMicrotask(update);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); }, { threshold: 0.2 });
    observer.observe(element);
    element.addEventListener("pointerenter", enter);
    element.addEventListener("pointerleave", leave);
    element.addEventListener("focusin", update);
    element.addEventListener("focusout", blur);
    document.addEventListener("visibilitychange", update);
    media.addEventListener("change", update);
    return () => {
      clearInterval(timer);
      observer.disconnect();
      element.removeEventListener("pointerenter", enter);
      element.removeEventListener("pointerleave", leave);
      element.removeEventListener("focusin", update);
      element.removeEventListener("focusout", blur);
      document.removeEventListener("visibilitychange", update);
      media.removeEventListener("change", update);
    };
  }, [gallery, imageCount]);
  return { activeImage, countProgress };
}
