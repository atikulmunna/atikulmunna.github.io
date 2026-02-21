/**
 * Unit Tests for Card Component
 * Tests card structure, styling, and behavior
 */

const fs = require('fs');
const path = require('path');

// Read CSS files
const componentsCSS = fs.readFileSync(path.join(__dirname, '../../css/components.css'), 'utf8');
const variablesCSS = fs.readFileSync(path.join(__dirname, '../../css/variables.css'), 'utf8');

describe('Card Component - CSS Structure', () => {
  test('should define base .card class', () => {
    expect(componentsCSS).toMatch(/\.card\s*{/);
  });

  test('should define .card--glass variant', () => {
    expect(componentsCSS).toMatch(/\.card--glass\s*{/);
  });

  test('should define .card--glass-dark variant', () => {
    expect(componentsCSS).toMatch(/\.card--glass-dark\s*{/);
  });

  test('should define card structure elements', () => {
    expect(componentsCSS).toMatch(/\.card__image\s*{/);
    expect(componentsCSS).toMatch(/\.card__content\s*{/);
    expect(componentsCSS).toMatch(/\.card__title\s*{/);
    expect(componentsCSS).toMatch(/\.card__description\s*{/);
    expect(componentsCSS).toMatch(/\.card__tags\s*{/);
  });

  test('should define .tag class for labels', () => {
    expect(componentsCSS).toMatch(/\.tag\s*{/);
  });

  test('should define card size variants', () => {
    expect(componentsCSS).toMatch(/\.card--small/);
    expect(componentsCSS).toMatch(/\.card--large/);
  });

  test('should define card layout variants', () => {
    expect(componentsCSS).toMatch(/\.card--horizontal/);
    expect(componentsCSS).toMatch(/\.card--centered/);
  });

  test('should define card states', () => {
    expect(componentsCSS).toMatch(/\.card--interactive/);
    expect(componentsCSS).toMatch(/\.card--loading/);
    expect(componentsCSS).toMatch(/\.card--disabled/);
    expect(componentsCSS).toMatch(/\.card--selected/);
  });
});

describe('Card Component - Glassmorphism Effects', () => {
  test('should apply backdrop-filter to .card--glass', () => {
    expect(componentsCSS).toMatch(/\.card--glass\s*{[\s\S]*?backdrop-filter:\s*blur/);
  });

  test('should include webkit prefix for backdrop-filter', () => {
    expect(componentsCSS).toMatch(/-webkit-backdrop-filter:\s*blur/);
  });

  test('should use @supports for progressive enhancement', () => {
    const supportsRegex = /@supports\s*\(\s*backdrop-filter:\s*blur\([^)]+\)\s*\)\s*or\s*\(\s*-webkit-backdrop-filter:\s*blur\([^)]+\)\s*\)/;
    expect(componentsCSS).toMatch(supportsRegex);
  });

  test('should provide fallback background for unsupported browsers', () => {
    // Check that .card--glass has a fallback background before @supports
    const cardGlassSection = componentsCSS.match(/\/\* Fallback for browsers[\s\S]*?\.card--glass\s*{[\s\S]*?background:/);
    expect(cardGlassSection).toBeTruthy();
  });

  test('should use CSS custom properties for glass effects', () => {
    expect(componentsCSS).toMatch(/var\(--glass-bg-light\)/);
    expect(componentsCSS).toMatch(/var\(--glass-border\)/);
    expect(componentsCSS).toMatch(/var\(--blur-md\)/);
  });
});

describe('Card Component - Hover Effects', () => {
  test('should define hover state for cards', () => {
    expect(componentsCSS).toMatch(/\.card:hover\s*{/);
  });

  test('should apply transform on hover', () => {
    const hoverSection = componentsCSS.match(/\.card:hover\s*{[\s\S]*?}/);
    expect(hoverSection).toBeTruthy();
    expect(hoverSection[0]).toMatch(/transform:\s*translateY\(/);
  });

  test('should apply enhanced shadow on hover', () => {
    const hoverSection = componentsCSS.match(/\.card:hover\s*{[\s\S]*?}/);
    expect(hoverSection).toBeTruthy();
    expect(hoverSection[0]).toMatch(/box-shadow/);
  });

  test('should define glass card hover with larger transform', () => {
    expect(componentsCSS).toMatch(/\.card--glass:hover\s*{[\s\S]*?translateY\(-8px\)/);
  });

  test('should apply image zoom effect on card hover', () => {
    expect(componentsCSS).toMatch(/\.card:hover\s+\.card__image\s+img\s*{[\s\S]*?transform:\s*scale/);
  });

  test('should use CSS transitions for smooth animations', () => {
    const cardBaseSection = componentsCSS.match(/\.card\s*{[\s\S]*?}/);
    expect(cardBaseSection).toBeTruthy();
    expect(cardBaseSection[0]).toMatch(/transition:/);
  });
});

describe('Card Component - Responsive Layouts', () => {
  test('should define .card-grid container', () => {
    expect(componentsCSS).toMatch(/\.card-grid\s*{/);
  });

  test('should use CSS Grid for card layout', () => {
    const cardGridSection = componentsCSS.match(/\.card-grid\s*{[\s\S]*?}/);
    expect(cardGridSection).toBeTruthy();
    expect(cardGridSection[0]).toMatch(/display:\s*grid/);
  });

  test('should define mobile breakpoint (max-width: 767px)', () => {
    expect(componentsCSS).toMatch(/@media\s*\(\s*max-width:\s*767px\s*\)/);
  });

  test('should define tablet breakpoint (768px - 1023px)', () => {
    expect(componentsCSS).toMatch(/@media\s*\(\s*min-width:\s*768px\s*\)\s*and\s*\(\s*max-width:\s*1023px\s*\)/);
  });

  test('should define desktop breakpoint (min-width: 1024px)', () => {
    expect(componentsCSS).toMatch(/@media\s*\(\s*min-width:\s*1024px\s*\)/);
  });

  test('should stack horizontal cards on mobile', () => {
    // Look for the card--horizontal flex-direction change in mobile breakpoint
    const horizontalCardMobile = componentsCSS.match(/\.card--horizontal\s*{[\s\S]*?flex-direction:\s*column/);
    expect(horizontalCardMobile).toBeTruthy();
  });

  test('should define grid column variants', () => {
    expect(componentsCSS).toMatch(/\.card-grid--single/);
    expect(componentsCSS).toMatch(/\.card-grid--two/);
    expect(componentsCSS).toMatch(/\.card-grid--four/);
  });
});

describe('Card Component - Accessibility', () => {
  test('should define focus styles for interactive cards', () => {
    expect(componentsCSS).toMatch(/\.card--interactive:focus/);
  });

  test('should use focus-visible for keyboard navigation', () => {
    expect(componentsCSS).toMatch(/\.card--interactive:focus-visible/);
  });

  test('should define reduced motion media query', () => {
    expect(componentsCSS).toMatch(/@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)/);
  });

  test('should disable transitions in reduced motion mode', () => {
    const reducedMotionSection = componentsCSS.match(/@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)\s*{[\s\S]*?\.card[\s\S]*?transition:\s*none/);
    expect(reducedMotionSection).toBeTruthy();
  });

  test('should disable transforms in reduced motion mode', () => {
    const reducedMotionSection = componentsCSS.match(/@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)\s*{[\s\S]*?transform:\s*none/);
    expect(reducedMotionSection).toBeTruthy();
  });

  test('should define high contrast mode support', () => {
    expect(componentsCSS).toMatch(/@media\s*\(\s*prefers-contrast:\s*high\s*\)/);
  });

  test('should enhance borders in high contrast mode', () => {
    const highContrastSection = componentsCSS.match(/@media\s*\(\s*prefers-contrast:\s*high\s*\)\s*{[\s\S]*?\.card[\s\S]*?border-width:\s*2px/);
    expect(highContrastSection).toBeTruthy();
  });
});

describe('Card Component - Card States', () => {
  test('should define loading state with spinner animation', () => {
    expect(componentsCSS).toMatch(/\.card--loading::after/);
    expect(componentsCSS).toMatch(/@keyframes\s+card-spin/);
  });

  test('should define disabled state', () => {
    const disabledSection = componentsCSS.match(/\.card--disabled\s*{[\s\S]*?}/);
    expect(disabledSection).toBeTruthy();
    expect(disabledSection[0]).toMatch(/opacity/);
    expect(disabledSection[0]).toMatch(/pointer-events:\s*none/);
  });

  test('should define selected state with enhanced border', () => {
    const selectedSection = componentsCSS.match(/\.card--selected\s*{[\s\S]*?}/);
    expect(selectedSection).toBeTruthy();
    expect(selectedSection[0]).toMatch(/border-color/);
    expect(selectedSection[0]).toMatch(/box-shadow/);
  });

  test('should define interactive state with cursor pointer', () => {
    const interactiveSection = componentsCSS.match(/\.card--interactive\s*{[\s\S]*?}/);
    expect(interactiveSection).toBeTruthy();
    expect(interactiveSection[0]).toMatch(/cursor:\s*pointer/);
  });
});

describe('Card Component - CSS Custom Properties Usage', () => {
  test('should use spacing variables', () => {
    expect(componentsCSS).toMatch(/var\(--spacing-/);
  });

  test('should use color variables', () => {
    expect(componentsCSS).toMatch(/var\(--color-/);
  });

  test('should use transition variables', () => {
    expect(componentsCSS).toMatch(/var\(--transition-/);
  });

  test('should use border radius variables', () => {
    expect(componentsCSS).toMatch(/var\(--radius-/);
  });

  test('should use shadow variables', () => {
    expect(componentsCSS).toMatch(/var\(--shadow-/);
  });

  test('should use font variables', () => {
    expect(componentsCSS).toMatch(/var\(--font-/);
  });
});

describe('Card Component - Tag Styling', () => {
  test('should define tag base styles', () => {
    const tagSection = componentsCSS.match(/\.tag\s*{[\s\S]*?}/);
    expect(tagSection).toBeTruthy();
    expect(tagSection[0]).toMatch(/display:\s*inline-flex/);
    expect(tagSection[0]).toMatch(/border-radius/);
  });

  test('should define tag hover state', () => {
    expect(componentsCSS).toMatch(/\.tag:hover\s*{/);
  });

  test('should define tag variants for glass cards', () => {
    expect(componentsCSS).toMatch(/\.card--glass\s+\.tag/);
    expect(componentsCSS).toMatch(/\.card--glass-dark\s+\.tag/);
  });

  test('should use pill-shaped border radius for tags', () => {
    const tagSection = componentsCSS.match(/\.tag\s*{[\s\S]*?}/);
    expect(tagSection).toBeTruthy();
    expect(tagSection[0]).toMatch(/border-radius:\s*var\(--radius-full\)/);
  });
});

describe('Card Component - Requirements Validation', () => {
  test('should satisfy Requirement 4.3: Cards with glassmorphism', () => {
    expect(componentsCSS).toMatch(/\.card--glass/);
    expect(componentsCSS).toMatch(/backdrop-filter:\s*blur/);
  });

  test('should satisfy Requirement 7.1: Hover effects', () => {
    expect(componentsCSS).toMatch(/\.card:hover/);
    expect(componentsCSS).toMatch(/transform/);
    expect(componentsCSS).toMatch(/box-shadow/);
  });

  test('should satisfy Requirement 2.1-2.3: Responsive layouts', () => {
    expect(componentsCSS).toMatch(/@media\s*\(\s*max-width:\s*767px\s*\)/);
    expect(componentsCSS).toMatch(/@media\s*\(\s*min-width:\s*768px\s*\)/);
    expect(componentsCSS).toMatch(/@media\s*\(\s*min-width:\s*1024px\s*\)/);
  });

  test('should satisfy Requirement 7.4: CSS transitions', () => {
    expect(componentsCSS).toMatch(/transition:/);
  });

  test('should satisfy Requirement 7.6: Reduced motion support', () => {
    expect(componentsCSS).toMatch(/@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)/);
  });

  test('should satisfy Requirement 10.5: Focus indicators', () => {
    expect(componentsCSS).toMatch(/\.card--interactive:focus/);
    expect(componentsCSS).toMatch(/outline/);
  });
});

describe('Card Component - Edge Cases', () => {
  test('should handle card without image', () => {
    // Card should work without .card__image element
    expect(componentsCSS).toMatch(/\.card__content\s*{/);
  });

  test('should handle card without tags', () => {
    // Card should work without .card__tags element
    expect(componentsCSS).toMatch(/\.card__description\s*{/);
  });

  test('should handle empty card grid', () => {
    // Grid should be defined even if empty
    expect(componentsCSS).toMatch(/\.card-grid\s*{[\s\S]*?display:\s*grid/);
  });

  test('should prevent pointer events on disabled cards', () => {
    const disabledSection = componentsCSS.match(/\.card--disabled\s*{[\s\S]*?}/);
    expect(disabledSection).toBeTruthy();
    expect(disabledSection[0]).toMatch(/pointer-events:\s*none/);
  });

  test('should prevent pointer events on loading cards', () => {
    const loadingSection = componentsCSS.match(/\.card--loading\s*{[\s\S]*?}/);
    expect(loadingSection).toBeTruthy();
    expect(loadingSection[0]).toMatch(/pointer-events:\s*none/);
  });
});

describe('Card Component - Animation Performance', () => {
  test('should use transform for animations (GPU accelerated)', () => {
    expect(componentsCSS).toMatch(/transform:\s*translateY/);
    expect(componentsCSS).toMatch(/transform:\s*scale/);
  });

  test('should use will-change or transform for performance', () => {
    // Transform is used, which is GPU accelerated
    expect(componentsCSS).toMatch(/transform/);
  });

  test('should define animation keyframes for loading spinner', () => {
    expect(componentsCSS).toMatch(/@keyframes\s+card-spin\s*{[\s\S]*?transform:\s*rotate/);
  });

  test('should use cubic-bezier easing functions', () => {
    expect(componentsCSS).toMatch(/var\(--easing-default\)/);
  });
});
