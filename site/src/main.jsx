import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "./App.jsx";
import "./styles.css";

// Enhancement failures must leave the prerendered document readable.
function showStaticPage() {
  delete document.documentElement.dataset.interactive;
  document.getAnimations().forEach((animation) => animation.cancel());
  document.querySelectorAll('.faq-answer').forEach((answer) => { answer.inert = false; });
  document.querySelectorAll('.faq-item button').forEach((button) => { button.disabled = true; button.setAttribute('aria-expanded', 'true'); });
  document.documentElement.style.removeProperty('overflow');
  document.body.style.removeProperty('overflow');
}
window.addEventListener('error', showStaticPage);
window.addEventListener('unhandledrejection', showStaticPage);
const root = document.getElementById('root');
const fallbackHTML = root.innerHTML;
class DocumentBoundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { showStaticPage(); console.error(error); }
  render() { return this.state.failed ? <div dangerouslySetInnerHTML={{ __html: fallbackHTML }} /> : this.props.children; }
}
const application = (
  <React.StrictMode>
    <DocumentBoundary><App notFound={root.dataset.page === "404"} /></DocumentBoundary>
  </React.StrictMode>
);
if (root.hasChildNodes()) hydrateRoot(root, application);
else createRoot(root).render(application);
