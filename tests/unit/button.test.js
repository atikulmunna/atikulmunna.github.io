/**
 * Unit Tests for Button Component
 * Feature: portfolio-website
 * Task 5.1: Create components.css with button styles
 * 
 * **Validates: Requirements 4.2, 2.6, 7.1, 7.4, 7.7**
 * 
 * Tests verify that button styles are properly implemented:
 * - Glassmorphism effects on buttons (4.2)
 * - Minimum 44x44px touch target size (2.6)
 * - Hover state feedback (7.1)
 * - CSS transitions for state changes (7.4)
 * - Button click feedback (7.7)
 */

const fs = require('fs');
const path = require('path');

describe('Button Component Implementation', () => {
  let componentsCSS;
  let variablesCSS;

  beforeAll(() => {
    // Read CSS files
    componentsCSS = fs.readFileSync(path.join(__dirname, '../../css/components.css'), 'utf-8');
    variablesCSS = fs.readFileSync(path.join(__dirname, '../../css/variables.css'), 'utf-8');
  });

  describe('Requirement 4.2: Glassmorphism effects on buttons', () => {
    test('should define glassmorphism styles for primary buttons', () => {
      // Check for backdrop-filter in primary glass buttons
      expect(componentsCSS).toMatch(/\.btn--primary\.btn--glass[\s\S]*backdrop-filter:\s*blur/);
      expect(componentsCSS).toMatch(/\.btn--primary\.btn--glass[\s\S]*-webkit-backdrop-filter:\s*blur/);
    });

    test('should define glassmorphism styles for secondary buttons', () => {
      // Check for backdrop-filter in secondary glass buttons
      expect(componentsCSS).toMatch(/\.btn--secondary\.btn--glass[\s\S]*backdrop-filter:\s*blur/);
      expect(componentsCSS).toMatch(/\.btn--secondary\.btn--glass[\s\S]*-webkit-backdrop-filter:\s*blur/);
    });

    test('should include fallback styles for browsers without backdrop-filter', () => {
      // Check for fallback background with higher opacity
      expect(componentsCSS).toMatch(/\.btn--primary\.btn--glass\s*{[\s\S]*background:\s*rgba\([^)]+,\s*0\.[89]/);
      expect(componentsCSS).toMatch(/\.btn--secondary\.btn--glass\s*{[\s\S]*background:\s*rgba\([^)]+,\s*0\.[89]/);
    });

    test('should use @supports for progressive enhancement', () => {
      // Check for @supports rule
      expect(componentsCSS).toMatch(/@supports\s*\(backdrop-filter:\s*blur/);
      expect(componentsCSS).toMatch(/@supports.*-webkit-backdrop-filter:\s*blur/);
    });

    test('should include border and box-shadow for glass effect', () => {
      expect(componentsCSS).toMatch(/\.btn--primary\.btn--glass[\s\S]*border:/);
      expect(componentsCSS).toMatch(/\.btn--primary\.btn--glass[\s\S]*box-shadow:/);
    });
  });

  describe('Requirement 2.6: Minimum 44x44px touch target size', () => {
    test('should define touch target minimum in variables', () => {
      expect(variablesCSS).toMatch(/--touch-target-min:\s*44px/);
    });

    test('should apply minimum width to base button', () => {
      expect(componentsCSS).toMatch(/\.btn\s*{[\s\S]*min-width:\s*var\(--touch-target-min\)/);
    });

    test('should apply minimum height to base button', () => {
      expect(componentsCSS).toMatch(/\.btn\s*{[\s\S]*min-height:\s*var\(--touch-target-min\)/);
    });

    test('should maintain minimum touch target for small buttons', () => {
      expect(componentsCSS).toMatch(/\.btn--small\s*{[\s\S]*min-width:\s*var\(--touch-target-min\)/);
      expect(componentsCSS).toMatch(/\.btn--small\s*{[\s\S]*min-height:\s*var\(--touch-target-min\)/);
    });

    test('should maintain minimum touch target for medium buttons', () => {
      expect(componentsCSS).toMatch(/\.btn--medium\s*{[\s\S]*min-width:\s*var\(--touch-target-min\)/);
      expect(componentsCSS).toMatch(/\.btn--medium\s*{[\s\S]*min-height:\s*var\(--touch-target-min\)/);
    });

    test('should have larger touch target for large buttons', () => {
      // Large buttons should have min-height > 44px
      const largeButtonMatch = componentsCSS.match(/\.btn--large\s*{[\s\S]*?min-height:\s*(\d+)px/);
      expect(largeButtonMatch).toBeTruthy();
      const minHeight = parseInt(largeButtonMatch[1]);
      expect(minHeight).toBeGreaterThan(44);
    });
  });

  describe('Requirement 7.1: Hover state feedback', () => {
    test('should define hover styles for primary buttons', () => {
      expect(componentsCSS).toMatch(/\.btn--primary:hover/);
    });

    test('should define hover styles for secondary buttons', () => {
      expect(componentsCSS).toMatch(/\.btn--secondary:hover/);
    });

    test('should include visual feedback on hover (transform or background change)', () => {
      // Check for transform or background change on hover
      const primaryHoverSection = componentsCSS.match(/\.btn--primary:hover\s*{([^}]+)}/);
      expect(primaryHoverSection).toBeTruthy();
      
      const hoverStyles = primaryHoverSection[1];
      const hasTransform = /transform:/.test(hoverStyles);
      const hasBackground = /background:/.test(hoverStyles);
      
      expect(hasTransform || hasBackground).toBe(true);
    });

    test('should include box-shadow change on hover for depth effect', () => {
      expect(componentsCSS).toMatch(/\.btn--primary:hover[\s\S]*box-shadow:/);
    });
  });

  describe('Requirement 7.4: CSS transitions for state changes', () => {
    test('should define transition property on base button', () => {
      expect(componentsCSS).toMatch(/\.btn\s*{[\s\S]*transition:/);
    });

    test('should use transition timing from variables', () => {
      // Check that transition uses var() for timing
      expect(componentsCSS).toMatch(/transition:.*var\(--transition-/);
    });

    test('should use easing function from variables', () => {
      // Check that transition uses var() for easing
      expect(componentsCSS).toMatch(/transition:.*var\(--easing-/);
    });

    test('should transition multiple properties (all or specific list)', () => {
      const transitionMatch = componentsCSS.match(/\.btn\s*{[\s\S]*?transition:\s*([^;]+);/);
      expect(transitionMatch).toBeTruthy();
      
      const transitionValue = transitionMatch[1];
      // Should either use 'all' or list multiple properties
      const hasAll = /\ball\b/.test(transitionValue);
      const hasMultiple = (transitionValue.match(/,/g) || []).length > 0;
      
      expect(hasAll || hasMultiple).toBe(true);
    });
  });

  describe('Requirement 7.7: Button click feedback', () => {
    test('should define active state for primary buttons', () => {
      expect(componentsCSS).toMatch(/\.btn--primary:active/);
    });

    test('should define active state for secondary buttons', () => {
      expect(componentsCSS).toMatch(/\.btn--secondary:active/);
    });

    test('should provide visual feedback on active state', () => {
      // Check for transform or box-shadow change on active
      const primaryActiveSection = componentsCSS.match(/\.btn--primary:active\s*{([^}]+)}/);
      expect(primaryActiveSection).toBeTruthy();
      
      const activeStyles = primaryActiveSection[1];
      const hasTransform = /transform:/.test(activeStyles);
      const hasShadow = /box-shadow:/.test(activeStyles);
      
      expect(hasTransform || hasShadow).toBe(true);
    });
  });

  describe('Size Variants', () => {
    test('should define small button variant', () => {
      expect(componentsCSS).toMatch(/\.btn--small/);
    });

    test('should define medium button variant', () => {
      expect(componentsCSS).toMatch(/\.btn--medium/);
    });

    test('should define large button variant', () => {
      expect(componentsCSS).toMatch(/\.btn--large/);
    });

    test('should have different padding for size variants', () => {
      const smallMatch = componentsCSS.match(/\.btn--small\s*{[\s\S]*?padding:\s*([^;]+);/);
      const largeMatch = componentsCSS.match(/\.btn--large\s*{[\s\S]*?padding:\s*([^;]+);/);
      
      expect(smallMatch).toBeTruthy();
      expect(largeMatch).toBeTruthy();
      expect(smallMatch[1]).not.toBe(largeMatch[1]);
    });
  });

  describe('Color Variants', () => {
    test('should define primary button variant', () => {
      expect(componentsCSS).toMatch(/\.btn--primary\s*{/);
    });

    test('should define secondary button variant', () => {
      expect(componentsCSS).toMatch(/\.btn--secondary\s*{/);
    });

    test('should use color palette variables', () => {
      // Primary buttons should use color variables
      expect(componentsCSS).toMatch(/\.btn--primary[\s\S]*var\(--color-/);
      
      // Secondary buttons should use color variables
      expect(componentsCSS).toMatch(/\.btn--secondary[\s\S]*var\(--color-/);
    });
  });

  describe('Accessibility Features', () => {
    test('should define focus styles', () => {
      expect(componentsCSS).toMatch(/\.btn--primary:focus/);
      expect(componentsCSS).toMatch(/\.btn--secondary:focus/);
    });

    test('should include visible focus indicator (outline)', () => {
      expect(componentsCSS).toMatch(/\.btn--primary:focus[\s\S]*outline:/);
    });

    test('should define disabled state', () => {
      expect(componentsCSS).toMatch(/\.btn:disabled/);
    });

    test('should support ARIA disabled attribute', () => {
      expect(componentsCSS).toMatch(/\.btn\[aria-disabled="true"\]/);
    });

    test('should include reduced motion support', () => {
      expect(componentsCSS).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
    });

    test('should disable transitions in reduced motion mode', () => {
      const reducedMotionSection = componentsCSS.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*{([\s\S]*?)}/);
      expect(reducedMotionSection).toBeTruthy();
      expect(reducedMotionSection[1]).toMatch(/\.btn[\s\S]*transition:\s*none/);
    });
  });

  describe('Button Structure', () => {
    test('should use flexbox for button layout', () => {
      expect(componentsCSS).toMatch(/\.btn\s*{[\s\S]*display:\s*inline-flex/);
    });

    test('should center button content', () => {
      expect(componentsCSS).toMatch(/\.btn\s*{[\s\S]*align-items:\s*center/);
      expect(componentsCSS).toMatch(/\.btn\s*{[\s\S]*justify-content:\s*center/);
    });

    test('should include proper cursor styling', () => {
      expect(componentsCSS).toMatch(/\.btn\s*{[\s\S]*cursor:\s*pointer/);
    });

    test('should prevent text selection', () => {
      expect(componentsCSS).toMatch(/\.btn\s*{[\s\S]*user-select:\s*none/);
    });
  });

  describe('Responsive Design', () => {
    test('should include mobile-specific styles', () => {
      expect(componentsCSS).toMatch(/@media\s*\(max-width:\s*767px\)/);
    });

    test('should maintain touch targets on mobile', () => {
      const mobileSection = componentsCSS.match(/@media\s*\(max-width:\s*767px\)\s*{([\s\S]*?)}\s*$/);
      expect(mobileSection).toBeTruthy();
      expect(mobileSection[1]).toMatch(/\.btn[\s\S]*min-width:\s*var\(--touch-target-min\)/);
      expect(mobileSection[1]).toMatch(/\.btn[\s\S]*min-height:\s*var\(--touch-target-min\)/);
    });
  });
});
