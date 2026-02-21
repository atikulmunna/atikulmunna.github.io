const fs = require('fs');
const path = require('path');
const CleanCSS = require('clean-css');
const { minify } = require('terser');

const ROOT = process.cwd();
const DIST_DIR = path.join(ROOT, 'dist');
const CSS_DIR = path.join(ROOT, 'css');
const JS_DIR = path.join(ROOT, 'js');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function listFiles(dirPath, extensions) {
  return fs
    .readdirSync(dirPath)
    .filter((file) => extensions.includes(path.extname(file).toLowerCase()));
}

function minifyCss() {
  const cssFiles = listFiles(CSS_DIR, ['.css']);
  const outDir = path.join(DIST_DIR, 'css');
  ensureDir(outDir);

  cssFiles.forEach((file) => {
    const inputPath = path.join(CSS_DIR, file);
    const outputName = file.replace(/\.css$/i, '.min.css');
    const outputPath = path.join(outDir, outputName);
    const source = fs.readFileSync(inputPath, 'utf8');
    const result = new CleanCSS({ level: 2 }).minify(source);

    if (result.errors.length > 0) {
      throw new Error(`CSS minification failed for ${file}: ${result.errors.join('; ')}`);
    }

    fs.writeFileSync(outputPath, result.styles, 'utf8');
  });
}

async function minifyJs() {
  const jsFiles = listFiles(JS_DIR, ['.js']);
  const outDir = path.join(DIST_DIR, 'js');
  ensureDir(outDir);

  for (const file of jsFiles) {
    const inputPath = path.join(JS_DIR, file);
    const outputName = file.replace(/\.js$/i, '.min.js');
    const outputPath = path.join(outDir, outputName);
    const source = fs.readFileSync(inputPath, 'utf8');
    const result = await minify(source, {
      compress: true,
      mangle: true,
      format: { comments: false }
    });

    if (!result.code) {
      throw new Error(`JS minification failed for ${file}`);
    }

    fs.writeFileSync(outputPath, result.code, 'utf8');
  }
}

function buildIndex() {
  const inputPath = path.join(ROOT, 'index.html');
  const outputPath = path.join(DIST_DIR, 'index.html');
  let html = fs.readFileSync(inputPath, 'utf8');

  html = html.replace(/css\/([a-z0-9\-]+)\.css/gi, 'css/$1.min.css');
  html = html.replace(/js\/([a-z0-9\-]+)\.js/gi, 'js/$1.min.js');

  fs.writeFileSync(outputPath, html, 'utf8');
}

async function run() {
  ensureDir(DIST_DIR);
  minifyCss();
  await minifyJs();
  buildIndex();
  console.log('Assets minified to dist/.');
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

