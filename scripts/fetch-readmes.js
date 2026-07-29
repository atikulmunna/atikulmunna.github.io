/**
 * Fetch project READMEs as rendered HTML.
 * Reads the project repo slugs from index.html (the GitHub links inside project
 * cards), asks the GitHub API for each README already rendered + sanitized to
 * HTML, and writes assets/readmes/<slug>.js — a tiny script that registers the
 * README HTML on window.__READMES. The detail page loads it via a <script> tag
 * (works over file:// and https, unlike fetch). Meant to run in CI with the
 * Actions GITHUB_TOKEN. Run: `node scripts/fetch-readmes.js`.
 */
const fs = require('fs');
const path = require('path');

const OWNER = process.env.GH_README_OWNER || 'atikulmunna';
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const ROOT = path.join(__dirname, '..');
const HTML_PATH = path.join(ROOT, 'index.html');
const OUT_DIR = path.join(ROOT, 'assets', 'readmes');

// Line separators that are legal in JSON but illegal in JS string literals
// before ES2019 — escape them so the generated .js is universally valid.
const LINE_SEP = new RegExp(String.fromCharCode(0x2028), 'g');
const PARA_SEP = new RegExp(String.fromCharCode(0x2029), 'g');

if (!TOKEN) {
  console.error('Missing GITHUB_TOKEN/GH_TOKEN — cannot query the GitHub API.');
  process.exit(1);
}

function collectSlugs() {
  const html = fs.readFileSync(HTML_PATH, 'utf8');
  const re = new RegExp(`github\\.com/${OWNER}/([A-Za-z0-9._-]+)`, 'g');
  const slugs = new Set();
  let match;
  while ((match = re.exec(html)) !== null) {
    slugs.add(match[1].replace(/\.git$/, ''));
  }
  return [...slugs];
}

async function fetchReadme(slug) {
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${slug}/readme`, {
    headers: {
      Authorization: `bearer ${TOKEN}`,
      Accept: 'application/vnd.github.html+json',
      'User-Agent': `${OWNER}-portfolio-readmes`,
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });
  if (res.status === 404) {
    console.warn(`  no README found for ${slug} (skipping)`);
    return null;
  }
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status} for ${slug}: ${await res.text()}`);
  }
  return res.text();
}

const LFS_POINTER_PREFIX = 'version https://git-lfs.github.com/spec/v1';

// Resolve one repo-relative asset path to an absolute GitHub URL. Regular files
// come from raw.githubusercontent.com; Git LFS files serve only a pointer there,
// so those are routed to media.githubusercontent.com instead. Detection is a
// cheap ranged GET that reads just enough bytes to spot the LFS pointer header.
async function resolveAssetUrl(slug, src) {
  const cleanPath = src.replace(/^\.?\//, '');
  const rawUrl = `https://raw.githubusercontent.com/${OWNER}/${slug}/HEAD/${cleanPath}`;
  try {
    const res = await fetch(rawUrl, {
      headers: {
        'User-Agent': `${OWNER}-portfolio-readmes`,
        Range: 'bytes=0-255'
      }
    });
    if (!res.ok && res.status !== 206) return rawUrl;
    const head = (await res.text()).trimStart();
    if (head.startsWith(LFS_POINTER_PREFIX)) {
      return `https://media.githubusercontent.com/media/${OWNER}/${slug}/HEAD/${cleanPath}`;
    }
    return rawUrl;
  } catch {
    return rawUrl;
  }
}

// Rewrite repo-relative asset references to absolute URLs. GitHub's README-HTML
// API returns relative <img src> (and <a href> to image files) for assets
// committed in the repo, e.g. docs/assets/demo.gif; on the portfolio domain
// those resolve against aimunna.me and 404. Skip anything already absolute, a
// data URI, an in-page anchor, or a mail link.
async function absolutizeAssets(html, slug) {
  const IMG_SRC = /(<img\b[^>]*?\bsrc=")([^"]+)(")/gi;
  const IMG_HREF = /(<a\b[^>]*?\bhref=")([^"]+\.(?:gif|png|jpe?g|webp|svg|avif))(")/gi;
  const isAbsolute = (u) => /^(?:https?:|\/\/|data:|#|mailto:)/i.test(u);

  const relatives = new Set();
  for (const re of [IMG_SRC, IMG_HREF]) {
    let m;
    while ((m = re.exec(html)) !== null) {
      if (!isAbsolute(m[2])) relatives.add(m[2]);
    }
  }
  if (relatives.size === 0) return html;

  const paths = [...relatives];
  const urls = await Promise.all(paths.map((p) => resolveAssetUrl(slug, p)));
  const map = new Map(paths.map((p, i) => [p, urls[i]]));

  const swap = (full, pre, url, post) =>
    isAbsolute(url) ? full : pre + (map.get(url) || url) + post;
  return html.replace(IMG_SRC, swap).replace(IMG_HREF, swap);
}

function jsString(str) {
  return JSON.stringify(str)
    .replace(LINE_SEP, '\\u2028')
    .replace(PARA_SEP, '\\u2029');
}

(async () => {
  const slugs = collectSlugs();
  console.log(`Found ${slugs.length} project repos in index.html.`);
  fs.mkdirSync(OUT_DIR, { recursive: true });

  let written = 0;
  for (const slug of slugs) {
    try {
      const rawHtml = await fetchReadme(slug);
      if (rawHtml == null) continue;
      const html = await absolutizeAssets(rawHtml, slug);
      const js =
        'window.__READMES=window.__READMES||{};\n' +
        `window.__READMES[${jsString(slug)}]=${jsString(html)};\n`;
      fs.writeFileSync(path.join(OUT_DIR, `${slug}.js`), js);
      written += 1;
      console.log(`  wrote assets/readmes/${slug}.js`);
    } catch (err) {
      console.error(`  failed for ${slug}: ${err.message}`);
    }
  }
  console.log(`Done. ${written}/${slugs.length} READMEs written.`);
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
