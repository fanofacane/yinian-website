import { useEffect, useRef } from "react";
import Lenis from "./vendor/lenis.js";

// Matches Launchfolio's published Lenis component (intensity 8 => 0.8 s).
// Pass the native dialog's open state to stop page inertia while it is open.
export function useSmoothScroll(blocked = false) {
  const blockedRef = useRef(blocked);
  const lockRef = useRef(null);
  blockedRef.current = blocked;

  useEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let instance = null;
    let savedOverflow = null;
    const style = document.createElement("style");
    style.dataset.lenisStyles = "launchfolio";
    style.textContent = `
      html.lenis, html.lenis body { height: auto; }
      html.lenis { scroll-behavior: auto; }
      .lenis:not(.lenis-autoToggle).lenis-stopped { overflow: clip; }
      .lenis [data-lenis-prevent], .lenis [data-lenis-prevent-wheel],
      .lenis [data-lenis-prevent-touch], .lenis [data-lenis-prevent-vertical],
      .lenis [data-lenis-prevent-horizontal] { overscroll-behavior: contain; }
      .lenis.lenis-smooth iframe { pointer-events: none; }
      .lenis.lenis-autoToggle {
        transition-property: overflow;
        transition-duration: 1ms;
        transition-behavior: allow-discrete;
      }
      @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
    `;
    document.head.appendChild(style);

    const restoreOverflow = () => {
      if (savedOverflow === null) return;
      if (root.style.overflow === "clip") {
        if (savedOverflow.value) {
          root.style.setProperty(
            "overflow",
            savedOverflow.value,
            savedOverflow.priority,
          );
        } else {
          root.style.removeProperty("overflow");
        }
      }
      savedOverflow = null;
    };
    const setBlocked = (shouldBlock) => {
      if (!instance) return;
      if (shouldBlock && savedOverflow === null) {
        savedOverflow = {
          value: root.style.getPropertyValue("overflow"),
          priority: root.style.getPropertyPriority("overflow"),
        };
        instance.stop();
        // Update immediately as well as through autoToggle's overflow transition.
        instance.checkOverflow();
      } else if (!shouldBlock && savedOverflow !== null) {
        restoreOverflow();
        instance.checkOverflow();
      }
    };
    const destroy = () => {
      restoreOverflow();
      instance?.destroy();
      instance = null;
    };
    const configure = () => {
      destroy();
      if (reducedMotion.matches) return;
      instance = new Lenis({
        duration: 0.8,
        infinite: false,
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        syncTouch: false,
        autoRaf: true,
        autoToggle: true,
        anchors: true,
        allowNestedScroll: true,
        stopInertiaOnNavigate: true,
      });
      setBlocked(blockedRef.current);
    };
    lockRef.current = setBlocked;
    reducedMotion.addEventListener("change", configure);
    configure();

    return () => {
      reducedMotion.removeEventListener("change", configure);
      lockRef.current = null;
      destroy();
      style.remove();
    };
  }, []);

  useEffect(() => {
    lockRef.current?.(blocked);
  }, [blocked]);
}
