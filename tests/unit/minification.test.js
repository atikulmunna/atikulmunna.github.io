const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('Production Asset Minification', () => {
  const root = path.resolve(__dirname, '../..');
  const distDir = path.join(root, 'dist');

  beforeAll(() => {
    execSync('npm run build:assets', { cwd: root, stdio: 'pipe' });
  });

  test('should generate minified CSS files in dist/css', () => {
    const srcDir = path.join(root, 'css');
    const outDir = path.join(distDir, 'css');
    const cssFiles = fs.readdirSync(srcDir).filter((file) => file.endsWith('.css'));

    cssFiles.forEach((file) => {
      const minName = file.replace(/\.css$/i, '.min.css');
      const srcPath = path.join(srcDir, file);
      const outPath = path.join(outDir, minName);

      expect(fs.existsSync(outPath)).toBe(true);
      expect(fs.statSync(outPath).size).toBeLessThan(fs.statSync(srcPath).size);
    });
  });

  test('should generate minified JS files in dist/js', () => {
    const srcDir = path.join(root, 'js');
    const outDir = path.join(distDir, 'js');
    const jsFiles = fs.readdirSync(srcDir).filter((file) => file.endsWith('.js'));

    jsFiles.forEach((file) => {
      const minName = file.replace(/\.js$/i, '.min.js');
      const srcPath = path.join(srcDir, file);
      const outPath = path.join(outDir, minName);

      expect(fs.existsSync(outPath)).toBe(true);
      expect(fs.statSync(outPath).size).toBeLessThan(fs.statSync(srcPath).size);
    });
  });

  test('should generate production index.html referencing minified assets', () => {
    const outIndex = path.join(distDir, 'index.html');
    const html = fs.readFileSync(outIndex, 'utf8');

    expect(fs.existsSync(outIndex)).toBe(true);
    expect(html).toContain('.min.css');
    expect(html).toContain('.min.js');
  });
});

