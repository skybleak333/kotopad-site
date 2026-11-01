import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../dist/", import.meta.url));
const routes = [
  "",
  "en/",
  "support/",
  "en/support/",
  "privacy/",
  "en/privacy/",
  "terms/",
  "en/terms/",
  "data/",
  "en/data/",
];
let checked = 0;
for (const route of routes) {
  const file = path.join(root, route, "index.html");
  const html = await readFile(file, "utf8");
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${route}: one h1`);
  assert.match(
    html,
    new RegExp(`<html lang="${route.startsWith("en/") ? "en" : "ru"}"`),
  );
  assert.match(html, /mailto:support@denary\.store/);
  assert.match(html, /rel="canonical" href="https:\/\/kotopad\.fun\//);
  assert.doesNotMatch(
    html,
    /TODO|Lorem ipsum|example\.com|href="#"|undefined|\[object Object\]/i,
  );
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, ids.length, `${route}: unique ids`);
  for (const [, attr, url] of html.matchAll(/\b(href|src)="([^"]+)"/g)) {
    if (/^(mailto:|https?:)/.test(url)) continue;
    const [pathname, hash] = url.split("#");
    if (!pathname) {
      assert(ids.includes(hash), `${route}: missing anchor ${url}`);
      continue;
    }
    if (!pathname.startsWith("/")) continue;
    let target = path.join(root, pathname);
    if (pathname.endsWith("/")) target = path.join(target, "index.html");
    assert((await stat(target)).isFile(), `${route}: missing ${attr} ${url}`);
    if (hash) {
      const other = await readFile(target, "utf8");
      assert(
        other.includes(`id="${hash}"`),
        `${route}: missing linked anchor ${url}`,
      );
    }
    checked++;
  }
  for (const match of html.matchAll(/<img\b[^>]+>/g)) {
    assert.match(match[0], /\balt="[^"]*"/);
    assert.match(match[0], /\bwidth="\d+"/);
    assert.match(match[0], /\bheight="\d+"/);
  }
}
const privacy = await readFile(path.join(root, "privacy/index.html"), "utf8");
for (const text of [
  "iCloud",
  "Game Center",
  "Hostinger",
  "cookie",
  "связке ключей",
  "резервн",
  "support@denary.store",
])
  assert(privacy.includes(text), `Privacy missing ${text}`);
const data = await readFile(path.join(root, "data/index.html"), "utf8");
assert(data.includes("Сгрузить приложение"));
assert(data.includes("Случайная метка устройства"));
for (const file of [
  "assets/style.css",
  "assets/site.js",
  "assets/fonts/fonts.css",
  "assets/social.png",
  "404.html",
  "robots.txt",
  "sitemap.xml",
])
  assert((await stat(path.join(root, file))).size > 0);
console.log(
  `PASS: ${routes.length} RU/EN pages, ${checked} internal links/assets, metadata, headings and privacy/data content.`,
);
