"use strict";

const fs = require("fs");
const http = require("http");
const path = require("path");

const root = path.resolve(__dirname, "..");
const requestedPort = Number(process.argv[2] || 8765);
if (!Number.isInteger(requestedPort) || requestedPort < 0 || requestedPort > 65535) throw new Error("Invalid port");

const types = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".xml", "application/xml; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".woff2", "font/woff2"],
]);

function publicFile(urlPath) {
  const relative = decodeURIComponent(urlPath).replace(/^\/AI-knowledge-map(?=\/)/, "").replace(/^\/+/, "") || "index.html";
  const preview = /^preview\/(zh|en)\/concepts\/([a-z0-9]+(?:-[a-z0-9]+)*)\/(?:index\.html)?$/.exec(relative);
  if (preview) {
    const file = path.join(root, ".tmp", "website-preview", "pages", preview[1], "concepts", preview[2], "index.html");
    let current = root;
    for (const part of path.relative(root, file).split(path.sep)) {
      current = path.join(current, part);
      if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) return null;
    }
    return file;
  }
  const staticPage = /^(zh|en)\/concepts\/[a-z0-9]+(?:-[a-z0-9]+)*\/(?:index\.html)?$/.test(relative);
  if (relative !== "index.html" && relative !== "sitemap-concepts.xml" && !staticPage && !relative.startsWith("assets/") && !relative.startsWith("data/")) return null;
  const target = path.resolve(root, staticPage && relative.endsWith("/") ? relative + "index.html" : relative);
  if (!staticPage && target !== path.join(root, "sitemap-concepts.xml") && target !== path.join(root, "index.html") && !target.startsWith(`${path.join(root, "assets")}${path.sep}`)
    && !target.startsWith(`${path.join(root, "data")}${path.sep}`)) return null;
  let current = root;
  for (const part of path.relative(root, target).split(path.sep)) {
    current = path.join(current, part);
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) return null;
  }
  return target;
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, "http://127.0.0.1");
  let file;
  try { file = publicFile(url.pathname); }
  catch (_) { response.writeHead(400).end("Bad request"); return; }
  if (!file || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    return response.end("Not found");
  }
  response.writeHead(200, {
    "Content-Type": types.get(path.extname(file).toLowerCase()) || "application/octet-stream",
    "Cache-Control": "no-store",
    ...(url.pathname.startsWith("/preview/") ? {
      "X-Robots-Tag": "noindex, nofollow",
      "Content-Security-Policy": "default-src 'none'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
    } : {}),
  });
  fs.createReadStream(file).pipe(response);
});

server.listen(requestedPort, "127.0.0.1", () => {
  const port = server.address().port;
  process.stdout.write(`${JSON.stringify({ state: "ready", url: `http://127.0.0.1:${port}/?quality-audit=1#/concept/neural-network` })}\n`);
});
const close = () => server.close(() => process.exit(0));
process.once("SIGINT", close);
process.once("SIGTERM", close);
