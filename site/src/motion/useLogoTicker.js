import { useEffect } from "react";

// Launchfolio's ClientLogoTicker: 100 px/s, draggable, hover modifier 100%.
// The two equal .logo-group siblings provide one seamless looping period.
export function useLogoTicker(windowRef) {
  useEffect(() => {
    const viewport = windowRef.current;
    const track = viewport?.querySelector(".logo-track");
    const groups = track?.querySelectorAll(".logo-group");
    if (!viewport || !track || groups?.length !== 2) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let period = 0;
    let position = 0;
    let frame = 0;
    let previousTime = null;
    let inView = false;
    let pointer = null;
    let lastPointerX = 0;
    const originalStyle = {
      touchAction: viewport.style.touchAction,
      userSelect: viewport.style.userSelect,
      cursor: viewport.style.cursor,
      transform: track.style.transform,
      willChange: track.style.willChange,
    };

    viewport.style.touchAction = "pan-y";
    viewport.style.userSelect = "none";
    viewport.style.cursor = "grab";
    track.style.willChange = "transform";

    const paint = () => {
      if (!period) return;
      position = -(((-position % period) + period) % period);
      track.style.transform = `translate3d(${position}px, 0, 0)`;
    };
    const measure = () => {
      // Layout offsets are unaffected by the animated track transform.
      period = groups[1].offsetLeft - groups[0].offsetLeft;
      paint();
    };
    const canAnimate = () =>
      inView && !document.hidden && !reducedMotion.matches && pointer === null;
    const tick = (time) => {
      frame = 0;
      if (!canAnimate()) {
        previousTime = null;
        return;
      }
      if (previousTime !== null) {
        position -= (100 * Math.min(time - previousTime, 100)) / 1000;
        paint();
      }
      previousTime = time;
      frame = requestAnimationFrame(tick);
    };
    const syncAnimation = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      previousTime = null;
      if (canAnimate()) frame = requestAnimationFrame(tick);
    };
    const startDrag = (event) => {
      if (!event.isPrimary || event.button !== 0 || pointer !== null) return;
      pointer = event.pointerId;
      lastPointerX = event.clientX;
      viewport.setPointerCapture(pointer);
      viewport.style.cursor = "grabbing";
      viewport.dataset.dragging = "true";
      syncAnimation();
    };
    const moveDrag = (event) => {
      if (event.pointerId !== pointer) return;
      position += event.clientX - lastPointerX;
      lastPointerX = event.clientX;
      paint();
    };
    const finishDrag = (event) => {
      if (event.pointerId !== pointer) return;
      const capturedPointer = pointer;
      pointer = null;
      if (viewport.hasPointerCapture(capturedPointer)) {
        viewport.releasePointerCapture(capturedPointer);
      }
      viewport.style.cursor = "grab";
      delete viewport.dataset.dragging;
      syncAnimation();
    };
    const preventNativeDrag = (event) => event.preventDefault();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(groups[0]);
    resizeObserver.observe(viewport);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncAnimation();
    });
    intersectionObserver.observe(viewport);
    viewport.addEventListener("pointerdown", startDrag);
    viewport.addEventListener("pointermove", moveDrag);
    viewport.addEventListener("pointerup", finishDrag);
    viewport.addEventListener("pointercancel", finishDrag);
    viewport.addEventListener("lostpointercapture", finishDrag);
    viewport.addEventListener("dragstart", preventNativeDrag);
    document.addEventListener("visibilitychange", syncAnimation);
    reducedMotion.addEventListener("change", syncAnimation);
    measure();

    return () => {
      if (frame) cancelAnimationFrame(frame);
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      viewport.removeEventListener("pointerdown", startDrag);
      viewport.removeEventListener("pointermove", moveDrag);
      viewport.removeEventListener("pointerup", finishDrag);
      viewport.removeEventListener("pointercancel", finishDrag);
      viewport.removeEventListener("lostpointercapture", finishDrag);
      viewport.removeEventListener("dragstart", preventNativeDrag);
      document.removeEventListener("visibilitychange", syncAnimation);
      reducedMotion.removeEventListener("change", syncAnimation);
      if (pointer !== null && viewport.hasPointerCapture(pointer)) {
        viewport.releasePointerCapture(pointer);
      }
      delete viewport.dataset.dragging;
      viewport.style.touchAction = originalStyle.touchAction;
      viewport.style.userSelect = originalStyle.userSelect;
      viewport.style.cursor = originalStyle.cursor;
      track.style.transform = originalStyle.transform;
      track.style.willChange = originalStyle.willChange;
    };
  }, [windowRef]);
}
