const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function resolveVersion() {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return `ts${Date.now()}`;
  }
}

// index.html plus the static publication pages, which reference assets one
// directory up (../css/, ../js/).
function versionedPages() {
  const root = path.join(__dirname, '..');
  const pages = [path.join(root, 'index.html')];
  const publications = path.join(root, 'publications');
  if (fs.existsSync(publications)) {
    fs.readdirSync(publications)
      .filter((name) => name.endsWith('.html'))
      .forEach((name) => pages.push(path.join(publications, name)));
  }
  return pages;
}

function updateAssetVersion(pagePath, version) {
  const html = fs.readFileSync(pagePath, 'utf8');
  const label = path.relative(path.join(__dirname, '..'), pagePath).replace(/\\/g, '/');

  const updated = html
    .replace(/(href="(?:\.\.\/)?css\/[^"]+)\?v=[^"]+"/g, `$1?v=${version}"`)
    .replace(/(src="(?:\.\.\/)?js\/[^"]+)\?v=[^"]+"/g, `$1?v=${version}"`);

  if (updated !== html) {
    fs.writeFileSync(pagePath, updated);
    console.log(`Updated asset version to "${version}" in ${label}`);
  } else {
    console.log(`No asset version references found to update in ${label}.`);
  }
}

function updateSitemapLastmod() {
  const sitemapPath = path.join(__dirname, '..', 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const xml = fs.readFileSync(sitemapPath, 'utf8');
  const updated = xml.replace(/<lastmod>[^<]*<\/lastmod>/g, `<lastmod>${today}</lastmod>`);

  if (updated !== xml) {
    fs.writeFileSync(sitemapPath, updated);
    console.log(`Updated sitemap lastmod to "${today}".`);
  } else {
    console.log('No sitemap lastmod references to update.');
  }
}

const version = process.argv[2] || resolveVersion();
versionedPages().forEach((page) => updateAssetVersion(page, version));
updateSitemapLastmod();

