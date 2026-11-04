import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import worker from "../worker/index.js";

test("serves existing static assets without a fallback", async () => {
  const calls = [];
  const response = await worker.fetch(new Request("https://example.test/assets/app.js"), {
    ASSETS: {
      fetch: async (request) => {
        calls.push(new URL(request.url).pathname);
        return new Response("asset", { status: 200 });
      },
    },
  });

  assert.equal(response.status, 200);
  assert.deepEqual(calls, ["/assets/app.js"]);
});

test("returns a real 404 for an unknown page without asking the host for a fallback", async () => {
  const calls = [];
  const response = await worker.fetch(
    new Request("https://example.test/flow/step-two?source=share", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async (request) => {
          const url = new URL(request.url);
          calls.push(url.pathname + url.search);
          return new Response(url.pathname === "/404.html" ? "Page not found" : "app", {
            status: 200,
          });
        },
      },
    },
  );

  assert.equal(response.status, 404);
  assert.equal(response.headers.get('x-robots-tag'), 'noindex');
  assert.match(await response.text(), /Page not found/);
  assert.deepEqual(calls, ["/404.html"]);
});

test("does not turn missing API or write requests into the app shell", async () => {
  for (const request of [
    new Request("https://example.test/api/missing", { headers: { accept: "application/json" } }),
    new Request("https://example.test/flow", { method: "POST", headers: { accept: "text/html" } }),
  ]) {
    let calls = 0;
    const response = await worker.fetch(request, {
      ASSETS: {
        fetch: async () => {
          calls += 1;
          return new Response("missing", { status: 404 });
        },
      },
    });

    assert.equal(response.status, request.method === 'POST' ? 405 : 404);
    assert.equal(calls, request.method === 'POST' ? 0 : 1);
  }
});

test("emits the files required by Sites packaging", async () => {
  await access(new URL("../dist/client/index.html", import.meta.url));
  await access(new URL("../dist/server/index.js", import.meta.url));
  await access(new URL("../dist/.openai/hosting.json", import.meta.url));
});

test('HEAD returns 404 without a body and index.html redirects to homepage', async () => {
  const env={ASSETS:{fetch:async () => new Response(null,{status:200})}};
  const missing=await worker.fetch(new Request('https://example.test/missing',{method:'HEAD'}),env);
  assert.equal(missing.status,404);assert.equal(await missing.text(),'');
  const redirect=await worker.fetch(new Request('https://example.test/index.html?source=share'),env);
  assert.equal(redirect.status,308);assert.equal(redirect.headers.get('location'),'https://example.test/?source=share');
});

test('build has real content, metadata and crawl files', async () => {
  const html=await readFile(new URL('../dist/client/index.html',import.meta.url),'utf8');
  for (const content of ['一念智能','老板课','AI 战略咨询','你关心的问题','企业仍需要安排熟悉业务的人员','如何判断 AI 项目是否有效？']) assert.ok(html.includes(content),content);
  assert.ok(!html.includes('<div id="root"></div>'));
  assert.match(html,/<meta name="description"/);assert.match(html,/<link rel="canonical"/);
  assert.match(html,/<meta name="robots" content="index, follow"/);
  for (const file of ['404.html','robots.txt','sitemap.xml']) await access(new URL(`../dist/client/${file}`,import.meta.url));
});
