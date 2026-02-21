const fs = require('fs');
const path = require('path');
const CleanCSS = require('clean-css');

const ROOT = process.cwd();
const cssDir = path.join(ROOT, 'css');
const files = fs.readdirSync(cssDir).filter((file) => file.endsWith('.css'));

let hasError = false;

files.forEach((file) => {
  const filePath = path.join(cssDir, file);
  const source = fs.readFileSync(filePath, 'utf8');
  const result = new CleanCSS({ level: 0 }).minify(source);

  if (result.errors.length > 0) {
    hasError = true;
    result.errors.forEach((error) => {
      console.error(`${file}: ${error}`);
    });
  }
});

if (hasError) {
  process.exit(1);
}

console.log('CSS validation passed.');

