// Recovered from Sevora home 72ea7b69-augiA20Il.js: onInView FX and
// drag:true, dragMomentum:false, dragSnapToOrigin:true. No decorative loop
// was authored in these three illustrations.
const illustrations = [
  [
    { selector: ".framer-q7zeuf", y: 96, opacity: 0 },
    { selector: ".framer-4r4c6t", x: -96 },
    { selector: ".framer-yblgmn", x: 96, opacity: 0, drag: true },
  ],
  [
    {
      selector: ".framer-jotx7o",
      y: 96,
      opacity: 0,
      stiffness: 250,
      drag: true,
    },
  ],
  [
    { selector: ".framer-zmrw8l", x: -128 },
    { selector: ".framer-3maobj", y: 96, drag: true },
    { selector: ".framer-84k9bb", x: 96, drag: true },
  ],
];

// Unit displacement for m*x'' + c*x' + k*x = 0, zero initial velocity.
// Sampling the physical spring preserves the source damping/stiffness,
// rather than substituting an unrelated CSS ease or duration.
export function springDisplacement(seconds, stiffness = 300, damping = 60) {
  const a = damping / 2;
  const discriminant = a * a - stiffness;
  if (Math.abs(discriminant) < 0.0001)
    return (1 + a * seconds) * Math.exp(-a * seconds);
  if (discriminant > 0) {
    const root = Math.sqrt(discriminant);
    const r1 = -a + root;
    const r2 = -a - root;
    return (
      (-r2 * Math.exp(r1 * seconds) + r1 * Math.exp(r2 * seconds)) / (r1 - r2)
    );
  }
  const frequency = Math.sqrt(-discriminant);
  return (
    Math.exp(-a * seconds) *
    (Math.cos(frequency * seconds) +
      (a / frequency) * Math.sin(frequency * seconds))
  );
}

function springFrames(x, y, opacity, stiffness, damping) {
  const duration = damping === 30 ? 900 : 1800;
  const frames = Array.from({ length: 91 }, (_, index) => {
    const fraction = index / 90;
    const displacement =
      index === 90
        ? 0
        : springDisplacement((fraction * duration) / 1000, stiffness, damping);
    return {
      offset: fraction,
      transform: `perspective(1200px) translate3d(${x * displacement}px, ${y * displacement}px, 0)`,
      opacity: 1 - (1 - opacity) * displacement,
    };
  });
  return { frames, duration };
}

export function mountBenefitMotion(host, shadowRoot, index) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const listeners = [];
  const states = [];
  let visible = false;
  const originalPointerEvents = host.style.pointerEvents;
  host.style.pointerEvents = "auto";

  function listen(target, name, callback, options) {
    target.addEventListener(name, callback, options);
    listeners.push(() => target.removeEventListener(name, callback, options));
  }
  function settle(state) {
    state.animation?.cancel();
    state.animation = null;
    state.element.style.transform = "perspective(1200px)";
    state.element.style.opacity = "1";
  }
  function animate(state, x, y, opacity, stiffness, damping) {
    settle(state);
    if (reduced.matches) return;
    const { frames, duration } = springFrames(
      x,
      y,
      opacity,
      stiffness,
      damping,
    );
    state.animation = state.element.animate(frames, {
      duration,
      easing: "linear",
    });
    if (!visible || document.hidden) state.animation.pause();
  }

  for (const config of illustrations[index] || []) {
    const element = shadowRoot.querySelector(config.selector);
    if (!element) continue;
    const state = {
      element,
      config,
      originalStyle: element.getAttribute("style"),
      animation: null,
      entered: false,
      pointer: null,
      x: 0,
      y: 0,
    };
    states.push(state);
    if (!reduced.matches) {
      element.style.transform = `perspective(1200px) translate3d(${config.x || 0}px, ${config.y || 0}px, 0)`;
      element.style.opacity = String(config.opacity ?? 1);
    }
    if (!config.drag) continue;
    Object.assign(element.style, {
      pointerEvents: "auto",
      touchAction: "none",
      userSelect: "none",
      cursor: "grab",
    });
    element.dataset.motionDraggable = "true";
    listen(element, "dragstart", (event) => event.preventDefault());
    listen(element, "pointerdown", (event) => {
      if (event.button !== 0 || state.pointer !== null) return;
      event.preventDefault();
      settle(state);
      state.entered = true;
      state.pointer = event.pointerId;
      state.startX = event.clientX;
      state.startY = event.clientY;
      state.scale =
        element.getBoundingClientRect().width / element.offsetWidth || 1;
      state.x = 0;
      state.y = 0;
      element.style.cursor = "grabbing";
      element.setPointerCapture(event.pointerId);
    });
    listen(element, "pointermove", (event) => {
      if (state.pointer !== event.pointerId) return;
      state.x = (event.clientX - state.startX) / state.scale;
      state.y = (event.clientY - state.startY) / state.scale;
      element.style.transform = `perspective(1200px) translate3d(${state.x}px, ${state.y}px, 0)`;
    });
    const release = (event) => {
      if (state.pointer !== event.pointerId) return;
      state.pointer = null;
      element.style.cursor = "grab";
      if (element.hasPointerCapture(event.pointerId))
        element.releasePointerCapture(event.pointerId);
      animate(state, state.x, state.y, 1, 400, 30);
    };
    listen(element, "pointerup", release);
    listen(element, "pointercancel", release);
    listen(element, "lostpointercapture", release);
  }

  const updatePlayback = () => {
    for (const state of states) {
      if (reduced.matches) {
        settle(state);
        continue;
      }
      if (state.animation?.playState === "finished") continue;
      if (visible && !document.hidden) state.animation?.play();
      else state.animation?.pause();
    }
  };
  const observer = new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      // Source onInView FX reverse when scrolling back above the illustration.
      // Scrolling past it leaves its completed state intact.
      if (!visible && entries[0].boundingClientRect.top >= innerHeight) {
        for (const state of states) {
          if (state.pointer !== null) continue;
          settle(state);
          state.entered = false;
          if (!reduced.matches) {
            const { x = 0, y = 0, opacity = 1 } = state.config;
            state.element.style.transform = `perspective(1200px) translate3d(${x}px, ${y}px, 0)`;
            state.element.style.opacity = String(opacity);
          }
        }
      }
      if (visible) {
        for (const state of states) {
          if (state.entered) continue;
          state.entered = true;
          const { x = 0, y = 0, opacity = 1, stiffness = 300 } = state.config;
          animate(state, x, y, opacity, stiffness, 60);
        }
      }
      updatePlayback();
    },
    { threshold: 0 },
  );
  observer.observe(host);
  listen(document, "visibilitychange", updatePlayback);
  listen(reduced, "change", updatePlayback);

  return () => {
    observer.disconnect();
    listeners.forEach((remove) => remove());
    host.style.pointerEvents = originalPointerEvents;
    for (const state of states) {
      state.animation?.cancel();
      if (state.originalStyle === null) state.element.removeAttribute("style");
      else state.element.setAttribute("style", state.originalStyle);
      delete state.element.dataset.motionDraggable;
    }
  };
}
