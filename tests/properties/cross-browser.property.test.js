/**
 * Property-Based Tests for Cross-Browser Compatibility
 * Feature: portfolio-website
 * Task 19.3: Write property tests for cross-browser support
 *
 * Validates:
 * - Property 35: CSS Vendor Prefixes
 * - Property 36: Graceful Feature Degradation
 */

const fc = require('fast-check');
const fs = require('fs');
const path = require('path');

const propertyTestConfig = {
  numRuns: 100,
  verbose: true
};

function loadCss(fileName) {
  return fs.readFileSync(path.join(__dirname, `../../css/${fileName}`), 'utf-8');
}

describe('Property 35: CSS Vendor Prefixes', () => {
  test('property: every backdrop-filter declaration includes webkit-prefixed fallback in same block', () => {
    const cssFiles = ['components.css', 'sections.css', 'glassmorphism.css'];
    const cssContent = cssFiles.map(loadCss).join('\n');

    const blocks = cssContent.match(/[^{}]+\{[^{}]*\}/g) || [];
    const blocksWithBackdrop = blocks.filter((block) => /backdrop-filter\s*:/.test(block));
    expect(blocksWithBackdrop.length).toBeGreaterThan(0);

    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: blocksWithBackdrop.length - 1 }),
        (index) => {
          const block = blocksWithBackdrop[index];
          const hasStandard = /(^|[^-])backdrop-filter\s*:/.test(block);
          const hasWebkit = /-webkit-backdrop-filter\s*:/.test(block);
          return !hasStandard || hasWebkit;
        }
      ),
      propertyTestConfig
    );
  });

  test('property: @supports checks include both standard and webkit backdrop-filter conditions', () => {
    const cssFiles = ['components.css', 'sections.css', 'glassmorphism.css'];
    const cssContent = cssFiles.map(loadCss).join('\n');

    const supportsLines = cssContent.match(/@supports[^{]+{/g) || [];
    const supportsBackdrop = supportsLines.filter((line) => line.includes('backdrop-filter'));
    expect(supportsBackdrop.length).toBeGreaterThan(0);

    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: supportsBackdrop.length - 1 }),
        (index) => {
          const line = supportsBackdrop[index];
          return line.includes('backdrop-filter') &&
                 line.includes('-webkit-backdrop-filter') &&
                 line.includes('or');
        }
      ),
      propertyTestConfig
    );
  });
});

describe('Property 36: Graceful Feature Degradation', () => {
  test('property: app detects unsupported backdrop-filter and applies fallback class', () => {
    const mainJS = fs.readFileSync(path.join(__dirname, '../../js/main.js'), 'utf-8');

    expect(mainJS).toMatch(/CSS\.supports\('backdrop-filter',\s*'blur\(10px\)'\)/);
    expect(mainJS).toMatch(/CSS\.supports\('-webkit-backdrop-filter',\s*'blur\(10px\)'\)/);
    expect(mainJS).toMatch(/document\.documentElement\.classList\.add\('no-backdrop-filter'\)/);
  });

  test('property: glassmorphism utilities include non-backdrop fallback styling', () => {
    const glassCSS = loadCss('glassmorphism.css');

    const fallbackSelectors = [
      '.glass-effect',
      '.glass-effect--medium',
      '.glass-effect--heavy',
      '.glass-nav',
      '.glass-button',
      '.glass-card'
    ];

    fc.assert(
      fc.property(
        fc.constantFrom(...fallbackSelectors),
        (selector) => {
          const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const fallbackRegex = new RegExp(
            `${escaped}\\s*\\{[^}]*background\\s*:[^;]+;[^}]*(border|border-bottom)\\s*:[^;]+;`,
            's'
          );
          return fallbackRegex.test(glassCSS);
        }
      ),
      propertyTestConfig
    );
  });
});
