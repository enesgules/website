// Writes one HTML file per page into dist, using the SSR build in dist-ssr.
import { readFile, writeFile } from "node:fs/promises";
import { pages, render, siteUrl } from "../dist-ssr/entry-server.js";

const template = await readFile("dist/index.html", "utf8");

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function replace(html, pattern, value) {
  if (!pattern.test(html)) {
    throw new Error(`Pattern ${pattern} is missing from dist/index.html.`);
  }

  return html.replace(pattern, (_match, start, end) => start + value + end);
}

function setMeta(html, key, value) {
  return replace(
    html,
    new RegExp(`(<meta\\s+(?:name|property)="${key}"\\s+content=")[^"]*(")`),
    escapeHtml(value),
  );
}

for (const page of pages) {
  const url = siteUrl + page.path;
  let html = template;

  html = replace(html, /(<title>)[^<]*(<\/title>)/, escapeHtml(page.title));
  html = replace(html, /(<link\s+rel="canonical"\s+href=")[^"]*(")/, url);
  html = setMeta(html, "description", page.description);
  html = setMeta(html, "og:url", url);
  html = setMeta(html, "og:title", page.title);
  html = setMeta(html, "og:description", page.description);
  html = setMeta(html, "twitter:title", page.title);
  html = setMeta(html, "twitter:description", page.description);

  if (page.lab) {
    html = replace(
      html,
      /()(\s*<\/head>)/,
      '\n    <meta name="robots" content="noindex" />',
    );
  } else {
    // React emits resource preloads before the app markup; they belong in head.
    const [, preloads, markup] = (await render(page.path)).match(
      /^((?:<link [^>]*\/>)*)([\s\S]*)$/,
    );
    html = replace(html, /()(\s*<\/head>)/, preloads);
    html = replace(html, /(<div id="root">)(<\/div>)/, markup);
  }

  const file = page.path === "/" ? "index.html" : `${page.path.slice(1)}.html`;
  await writeFile(`dist/${file}`, html);
  console.log(`Prerendered ${page.path} -> dist/${file}`);
}
