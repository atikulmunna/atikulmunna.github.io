const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('Image Optimization Pipeline', () => {
  const root = path.resolve(__dirname, '../..');
  const srcDir = path.join(root, 'assets', 'images');
  const outDir = path.join(root, 'dist', 'assets', 'images');

  beforeAll(() => {
    execSync('npm run optimize:images', { cwd: root, stdio: 'pipe' });
  });

  test('should create optimized source-format copies in dist', () => {
    const sourceImages = fs
      .readdirSync(srcDir)
      .filter((file) => /\.(png|jpe?g)$/i.test(file));

    sourceImages.forEach((file) => {
      const outPath = path.join(outDir, file);
      expect(fs.existsSync(outPath)).toBe(true);
    });
  });

  test('should create WebP variants for every JPEG/PNG image', () => {
    const sourceImages = fs
      .readdirSync(srcDir)
      .filter((file) => /\.(png|jpe?g)$/i.test(file));

    sourceImages.forEach((file) => {
      const baseName = path.basename(file, path.extname(file));
      const webpPath = path.join(outDir, `${baseName}.webp`);
      expect(fs.existsSync(webpPath)).toBe(true);
      expect(fs.statSync(webpPath).size).toBeGreaterThan(0);
    });
  });
});

