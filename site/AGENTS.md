# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Preserve the Sites packaging contract: `.openai/hosting.json`, `scripts/prepare-sites-build.mjs`, and build outputs `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`. The user's explicit request for true 404 responses supersedes the original SPA fallback scaffold; `worker/index.js` and `tests/sites-worker.test.mjs` now enforce real 404s. Before a Sites handoff, run `npm run build` and `npm run test:sites`.
