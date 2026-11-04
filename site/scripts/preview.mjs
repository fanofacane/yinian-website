import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import worker from "../dist/server/index.js";

const root = path.resolve(fileURLToPath(new URL('../dist/client/', import.meta.url)));
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.ico':'image/x-icon'};
const env = { ASSETS: { async fetch(request) {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url).pathname); } catch { return new Response('Not found', {status:404}); }
  const filename = path.resolve(root, '.' + pathname);
  if (!filename.startsWith(root + path.sep) || pathname.includes('\\')) return new Response('Not found', {status:404});
  try {
    if (!(await stat(filename)).isFile()) return new Response('Not found', {status:404});
    const body = await readFile(filename);
    return new Response(request.method === 'HEAD' ? null : body, {headers:{'Content-Type':types[path.extname(filename)] || 'application/octet-stream','Content-Length':String(body.length),'Cache-Control':'no-cache'}});
  } catch { return new Response('Not found', {status:404}); }
}}};
const port = Number(process.env.PORT || 4178);
http.createServer(async (req, res) => {
  try {
    const request = new Request(`http://127.0.0.1:${port}${req.url}`, {method:req.method, headers:req.headers});
    const response = await worker.fetch(request, env);
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) { console.error(error); res.writeHead(500);res.end('Internal server error'); }
}).listen(port, '127.0.0.1', () => console.log(`Prerendered preview: http://127.0.0.1:${port}`));
