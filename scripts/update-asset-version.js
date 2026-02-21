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

function updateIndexAssetVersion(version) {
  const indexPath = path.join(__dirname, '..', 'index.html');
  const html = fs.readFileSync(indexPath, 'utf8');

  const updated = html
    .replace(/(href="css\/[^"]+)\?v=[^"]+"/g, `$1?v=${version}"`)
    .replace(/(src="js\/[^"]+)\?v=[^"]+"/g, `$1?v=${version}"`);

  if (updated !== html) {
    fs.writeFileSync(indexPath, updated);
    console.log(`Updated asset version to "${version}" in index.html`);
  } else {
    console.log('No asset version references found to update.');
  }
}

const version = process.argv[2] || resolveVersion();
updateIndexAssetVersion(version);

