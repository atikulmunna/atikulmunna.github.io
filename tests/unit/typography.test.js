/**
 * Unit Tests for Typography System
 * Feature: portfolio-website
 * Task 2.2: Implement typography system in base.css
 * 
 * **Validates: Requirements 8.1, 8.2, 8.3, 8.4**
 * 
 * Tests verify that the typography system is properly defined and applied:
 * - Font families with fallbacks (8.1)
 * - Minimum 16px body text (8.2)
 * - Line heights between 1.5-1.8 (8.3)
 * - Typography hierarchy (8.4)
 */

const fs = require('fs');
const path = require('path');

describe('Typography System Implementation', () => {
  let variablesCSS;
  let baseCSS;

  beforeAll(() => {
    // Read CSS files
    variablesCSS = fs.readFileSync(path.join(__dirname, '../../css/variables.css'), 'utf-8');
    baseCSS = fs.readFileSync(path.join(__dirname, '../../css/base.css'), 'utf-8');
  });

  describe('Requirement 8.1: Font families with fallbacks', () => {
    test('should define primary font family with fallbacks', () => {
      expect(variablesCSS).toMatch(/--font-primary:\s*[^;]+(sans-serif|serif)/);
      
      // Should include multiple fallback fonts
      const fontPrimaryMatch = variablesCSS.match(/--font-primary:\s*([^;]+);/);
      expect(fontPrimaryMatch).toBeTruthy();
      
      const fontStack = fontPrimaryMatch[1];
      // Should have at least 3 fonts in the stack
      const fontCount = (fontStack.match(/,/g) || []).length + 1;
      expect(fontCount).toBeGreaterThanOrEqual(3);
    });

    test('should define heading font family with fallbacks', () => {
      expect(variablesCSS).toMatch(/--font-heading:/);
      
      const fontHeadingMatch = variablesCSS.match(/--font-heading:\s*([^;]+);/);
      expect(fontHeadingMatch).toBeTruthy();
    });

    test('should apply font families in base.css', () => {
      expect(baseCSS).toMatch(/font-family:\s*var\(--font-primary\)/);
      expect(baseCSS).toMatch(/font-family:\s*var\(--font-heading\)/);
    });
  });

  describe('Requirement 8.2: Minimum 16px body text', () => {
    test('should set html font-size to 16px', () => {
      expect(baseCSS).toMatch(/html\s*{[^}]*font-size:\s*16px/s);
    });

    test('should define base font size as 1rem (16px)', () => {
      expect(variablesCSS).toMatch(/--font-size-base:\s*1rem/);
    });

    test('should apply base font size to body', () => {
      expect(baseCSS).toMatch(/body\s*{[^}]*font-size:\s*var\(--font-size-base\)/s);
    });
  });

  describe('Requirement 8.3: Line heights between 1.5-1.8', () => {
    test('should define line-height-normal as 1.5', () => {
      const match = variablesCSS.match(/--line-height-normal:\s*([\d.]+)/);
      expect(match).toBeTruthy();
      const lineHeight = parseFloat(match[1]);
      expect(lineHeight).toBe(1.5);
    });

    test('should define line-height-relaxed within 1.5-1.8 range', () => {
      const match = variablesCSS.match(/--line-height-relaxed:\s*([\d.]+)/);
      expect(match).toBeTruthy();
      const lineHeight = parseFloat(match[1]);
      expect(lineHeight).toBeGreaterThanOrEqual(1.5);
      expect(lineHeight).toBeLessThanOrEqual(1.8);
    });

    test('should apply appropriate line-height to body', () => {
      expect(baseCSS).toMatch(/body\s*{[^}]*line-height:\s*var\(--line-height-normal\)/s);
    });

    test('should apply relaxed line-height to paragraphs', () => {
      expect(baseCSS).toMatch(/p\s*{[^}]*line-height:\s*var\(--line-height-relaxed\)/s);
    });
  });

  describe('Requirement 8.4: Typography hierarchy', () => {
    test('should define font sizes for all heading levels', () => {
      // Check that we have font size variables for headings
      expect(variablesCSS).toMatch(/--font-size-5xl/); // h1
      expect(variablesCSS).toMatch(/--font-size-4xl/); // h2
      expect(variablesCSS).toMatch(/--font-size-3xl/); // h3
      expect(variablesCSS).toMatch(/--font-size-2xl/); // h4
      expect(variablesCSS).toMatch(/--font-size-xl/);  // h5
      expect(variablesCSS).toMatch(/--font-size-lg/);  // h6
    });

    test('should apply decreasing font sizes from h1 to h6', () => {
      // Extract font sizes for each heading
      const h1Match = baseCSS.match(/h1\s*{[^}]*font-size:\s*var\(--font-size-(\w+)\)/s);
      const h2Match = baseCSS.match(/h2\s*{[^}]*font-size:\s*var\(--font-size-(\w+)\)/s);
      const h3Match = baseCSS.match(/h3\s*{[^}]*font-size:\s*var\(--font-size-(\w+)\)/s);
      const h6Match = baseCSS.match(/h6\s*{[^}]*font-size:\s*var\(--font-size-(\w+)\)/s);

      expect(h1Match).toBeTruthy();
      expect(h2Match).toBeTruthy();
      expect(h3Match).toBeTruthy();
      expect(h6Match).toBeTruthy();

      // Verify hierarchy: h1 should use larger size than h2, etc.
      // Size order: 5xl > 4xl > 3xl > 2xl > xl > lg
      const sizeOrder = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'];
      const h1Size = sizeOrder.indexOf(h1Match[1]);
      const h2Size = sizeOrder.indexOf(h2Match[1]);
      const h3Size = sizeOrder.indexOf(h3Match[1]);
      const h6Size = sizeOrder.indexOf(h6Match[1]);

      expect(h1Size).toBeGreaterThan(h2Size);
      expect(h2Size).toBeGreaterThan(h3Size);
      expect(h3Size).toBeGreaterThan(h6Size);
    });

    test('should define font weights', () => {
      expect(variablesCSS).toMatch(/--font-weight-normal:\s*400/);
      expect(variablesCSS).toMatch(/--font-weight-medium:\s*500/);
      expect(variablesCSS).toMatch(/--font-weight-semibold:\s*600/);
      expect(variablesCSS).toMatch(/--font-weight-bold:\s*700/);
    });

    test('should apply bold weight to headings', () => {
      expect(baseCSS).toMatch(/h1,\s*h2,\s*h3,\s*h4,\s*h5,\s*h6\s*{[^}]*font-weight:\s*var\(--font-weight-bold\)/s);
    });
  });

  describe('CSS Custom Properties Usage', () => {
    test('should use CSS custom properties for all typography values', () => {
      // Font sizes should use var()
      const fontSizeMatches = baseCSS.match(/font-size:\s*var\(/g);
      expect(fontSizeMatches).toBeTruthy();
      expect(fontSizeMatches.length).toBeGreaterThan(5);

      // Line heights should use var()
      const lineHeightMatches = baseCSS.match(/line-height:\s*var\(/g);
      expect(lineHeightMatches).toBeTruthy();
      expect(lineHeightMatches.length).toBeGreaterThan(2);

      // Font weights should use var()
      const fontWeightMatches = baseCSS.match(/font-weight:\s*var\(/g);
      expect(fontWeightMatches).toBeTruthy();
    });
  });
});
