const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'assets', 'images');
const DIST_DIR = path.join(ROOT, 'dist', 'assets', 'images');
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg']);

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

async function optimizeImage(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  if (!IMAGE_EXTENSIONS.has(ext)) return;

  const srcPath = path.join(SRC_DIR, fileName);
  const baseName = path.basename(fileName, ext);
  const outOriginal = path.join(DIST_DIR, fileName);
  const outWebp = path.join(DIST_DIR, `${baseName}.webp`);

  await sharp(srcPath)
    .toFormat(ext === '.png' ? 'png' : 'jpeg', { quality: 82 })
    .toFile(outOriginal);

  await sharp(srcPath)
    .webp({ quality: 80 })
    .toFile(outWebp);
}

async function run() {
  ensureDir(DIST_DIR);
  const files = fs.readdirSync(SRC_DIR);
  const tasks = files.map((file) => optimizeImage(file));
  await Promise.all(tasks);
  console.log('Images optimized to dist/assets/images with WebP variants.');
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

