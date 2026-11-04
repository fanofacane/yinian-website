export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const readable = ["GET", "HEAD"].includes(request.method);
    if (!readable) {
      return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
    }
    if (url.pathname === "/index.html") {
      url.pathname = "/";
      return Response.redirect(url.href, 308);
    }
    // Only registered pages and static asset paths reach the asset provider.
    // Never let a host's SPA fallback turn an unknown URL into a 200 homepage.
    const known = url.pathname === "/" || url.pathname.startsWith("/assets/") || ["/robots.txt", "/sitemap.xml", "/favicon.ico"].includes(url.pathname);
    if (known) {
      const assetUrl = new URL(url);
      if (assetUrl.pathname === "/") assetUrl.pathname = "/index.html";
      const response = await env.ASSETS.fetch(new Request(assetUrl, request));
      if (response.status !== 404) return response;
    }
    const errorUrl = new URL("/404.html", url);
    const error = await env.ASSETS.fetch(new Request(errorUrl, request));
    const headers = new Headers(error.headers);
    headers.set("Content-Type", "text/html; charset=utf-8");
    headers.set("X-Robots-Tag", "noindex");
    headers.set("Cache-Control", "no-cache");
    return new Response(request.method === "HEAD" ? null : error.body, { status: 404, headers });
  },
};
