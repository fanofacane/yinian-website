import { useEffect, useRef } from "react";

export function FollowCursor() {
  const ref = useRef(null);
  useEffect(() => {
    const element = ref.current;
    const enabled = matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0,
      time = 0,
      x = 0,
      y = 0,
      vx = 0,
      vy = 0,
      tx = 0,
      ty = 0,
      visible = false;
    const tick = (now) => {
      frame = 0;
      const dt = Math.min((now - time) / 1000 || 1 / 60, 1 / 30) / 4;
      time = now;
      for (let i = 0; i < 4; i++) {
        vx += (500 * (tx - x) - 60 * vx) * dt;
        vy += (500 * (ty - y) - 60 * vy) * dt;
        x += vx * dt;
        y += vy * dt;
      }
      element.style.transform = `translate3d(${x}px, ${y + 8}px, 0)`;
      if (
        Math.abs(tx - x) + Math.abs(ty - y) + Math.abs(vx) + Math.abs(vy) >
        0.05
      )
        frame = requestAnimationFrame(tick);
    };
    const hide = () => {
      visible = false;
      element.style.opacity = 0;
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const move = (e) => {
      if (!enabled.matches || reduced.matches || e.pointerType !== "mouse")
        return;
      tx = e.clientX;
      ty = e.clientY;
      if (!visible) {
        x = tx;
        y = ty;
        visible = true;
        vx = vy = 0;
      }
      element.style.opacity = 1;
      if (!frame) {
        time = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", hide);
    enabled.addEventListener("change", hide);
    reduced.addEventListener("change", hide);
    return () => {
      hide();
      document.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", hide);
      enabled.removeEventListener("change", hide);
      reduced.removeEventListener("change", hide);
    };
  }, []);
  return <div ref={ref} className="follow-cursor" aria-hidden="true" />;
}
