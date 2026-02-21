/**
 * Property-Based Tests for Component Accessibility
 * Feature: portfolio-website
 * Task 5.3: Write property tests for component accessibility
 * 
 * **Validates: Requirements 2.6, 7.1, 7.4, 7.7**
 * 
 * This file tests universal properties that should hold true for component accessibility:
 * - Property 5: Touch Target Size
 * - Property 16: Hover State Feedback
 * - Property 18: CSS Transitions on State Changes
 * - Property 21: Button Click Feedback
 */

const fc = require('fast-check');
const fs = require('fs');
const path = require('path');

// Property test configuration - minimum 100 iterations
const propertyTestConfig = {
  numRuns: 100,
  verbose: true
};

/**
 * Extract CSS rules for a given selector
 * Returns the rules within the selector block
 */
function extractCSSRules(cssContent, selector) {
  // Escape special regex characters in selector
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Match the selector and its rules (handle multi-line)
  const regex = new RegExp(`${escapedSelector}\\s*{([^}]+)}`, 's');
  const match = cssContent.match(regex);
  
  return match ? match[1] : null;
}

/**
 * Extract numeric value from CSS property
 */
function extractNumericValue(rules, property) {
  if (!rules) return null;
  
  const regex = new RegExp(`${property}:\\s*([\\d.]+)(px|rem|em|%)?`, 'i');
  const match = rules.match(regex);
  
  if (!match) return null;
  
  const value = parseFloat(match[1]);
  const unit = match[2] || 'px';
  
  // Convert to pixels (assuming 16px = 1rem)
  if (unit === 'rem' || unit === 'em') {
    return value * 16;
  }
  
  return value;
}

/**
 * Check if selector has a specific CSS property
 */
function hasProperty(rules, property) {
  if (!rules) return false;
  const regex = new RegExp(`${property}:\\s*[^;]+`, 'i');
  return regex.test(rules);
}

/**
 * Get all interactive element selectors from CSS
 */
function getInteractiveSelectors(cssContent) {
  const selectors = [];
  
  // Match button selectors
  const buttonMatches = cssContent.matchAll(/\.(btn[^\s,:{]*)/g);
  for (const match of buttonMatches) {
    if (!selectors.includes(match[1])) {
      selectors.push(match[1]);
    }
  }
  
  // Match card interactive selectors
  const cardMatches = cssContent.matchAll(/\.(card--interactive[^\s,:{]*)/g);
  for (const match of cardMatches) {
    if (!selectors.includes(match[1])) {
      selectors.push(match[1]);
    }
  }
  
  return selectors;
}

/**
 * Check if element has hover state defined
 */
function hasHoverState(cssContent, selector) {
  const hoverRegex = new RegExp(`\\.${selector}:hover\\s*{`, 'g');
  return hoverRegex.test(cssContent);
}

/**
 * Check if element has active state defined
 */
function hasActiveState(cssContent, selector) {
  const activeRegex = new RegExp(`\\.${selector}:active\\s*{`, 'g');
  return activeRegex.test(cssContent);
}

/**
 * Extract hover state rules
 */
function getHoverRules(cssContent, selector) {
  const hoverRegex = new RegExp(`\\.${selector}:hover\\s*{([^}]+)}`, 's');
  const match = cssContent.match(hoverRegex);
  return match ? match[1] : null;
}

/**
 * Extract active state rules
 */
function getActiveRules(cssContent, selector) {
  const activeRegex = new RegExp(`\\.${selector}:active\\s*{([^}]+)}`, 's');
  const match = cssContent.match(activeRegex);
  return match ? match[1] : null;
}

describe('Property 5: Touch Target Size', () => {
  /**
   * **Validates: Requirements 2.6**
   * 
   * For any interactive element (button, link, input), the minimum touch target size 
   * SHALL be at least 44x44 pixels to ensure accessibility on touch devices.
   */
  
  const interactiveSelectors = [
    'btn',
    'btn--small',
    'btn--medium',
    'btn--large',
    'btn--primary',
    'btn--secondary'
  ];
  
  test('property: interactive elements have minimum width of 44px', () => {
    const componentsCSS = fs.readFileSync(path.join(__dirname, '../../css/components.css'), 'utf-8');
    const variablesCSS = fs.readFileSync(path.join(__dirname, '../../css/variables.css'), 'utf-8');
    
    // Check that touch-target-min is defined as 44px
    const touchTargetMatch = variablesCSS.match(/--touch-target-min:\s*(\d+)px/);
    expect(touchTargetMatch).toBeTruthy();
    const touchTargetMin = parseInt(touchTargetMatch[1]);
    expect(touchTargetMin).toBe(44);
    
    fc.assert(
      fc.property(
        fc.constantFrom(...interactiveSelectors),
        (selector) => {
          // Check the selector and its base class (e.g., btn--primary inherits from btn)
          const baseSelector = selector.split('--')[0]; // Get base class (e.g., 'btn' from 'btn--primary')
          
          // Try the specific selector first
          let rules = extractCSSRules(componentsCSS, `.${selector}`);
          
          // If not found or no min-width, check base class
          if (!rules || !hasProperty(rules, 'min-width')) {
            rules = extractCSSRules(componentsCSS, `.${baseSelector}`);
          }
          
          if (!rules) return true; // Selector might not exist
          
          // Check for min-width property
          const minWidth = extractNumericValue(rules, 'min-width');
          
          if (minWidth === null) {
            // Check if it uses the CSS variable
            return rules.includes('var(--touch-target-min)');
          }
          
          // Should be at least 44px
          return minWidth >= 44;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: interactive elements have minimum height of 44px', () => {
    const componentsCSS = fs.readFileSync(path.join(__dirname, '../../css/components.css'), 'utf-8');
    const variablesCSS = fs.readFileSync(path.join(__dirname, '../../css/variables.css'), 'utf-8');
    
    // Check that touch-target-min is defined as 44px
    const touchTargetMatch = variablesCSS.match(/--touch-target-min:\s*(\d+)px/);
    expect(touchTargetMatch).toBeTruthy();
    const touchTargetMin = parseInt(touchTargetMatch[1]);
    expect(touchTargetMin).toBe(44);
    
    fc.assert(
      fc.property(
        fc.constantFrom(...interactiveSelectors),
        (selector) => {
          // Check the selector and its base class (e.g., btn--primary inherits from btn)
          const baseSelector = selector.split('--')[0]; // Get base class (e.g., 'btn' from 'btn--primary')
          
          // Try the specific selector first
          let rules = extractCSSRules(componentsCSS, `.${selector}`);
          
          // If not found or no min-height, check base class
          if (!rules || !hasProperty(rules, 'min-height')) {
            rules = extractCSSRules(componentsCSS, `.${baseSelector}`);
          }
          
          if (!rules) return true; // Selector might not exist
          
          // Check for min-height property
          const minHeight = extractNumericValue(rules, 'min-height');
          
          if (minHeight === null) {
            // Check if it uses the CSS variable
            return rules.includes('var(--touch-target-min)');
          }
          
          // Should be at least 44px
          return minHeight >= 44;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: button variants maintain minimum touch target', () => {
    const componentsCSS = fs.readFileSync(path.join(__dirname, '../../css/components.css'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constantFrom('btn--small', 'btn--medium', 'btn--large'),
        (selector) => {
          const rules = extractCSSRules(componentsCSS, `.${selector}`);
          
          if (!rules) return true;
          
          // Extract min-width and min-height
          const minWidth = extractNumericValue(rules, 'min-width');
          const minHeight = extractNumericValue(rules, 'min-height');
          
          // Check if uses CSS variable or has explicit value >= 44px
          const hasValidWidth = minWidth === null ? 
            rules.includes('var(--touch-target-min)') : 
            minWidth >= 44;
          
          const hasValidHeight = minHeight === null ? 
            rules.includes('var(--touch-target-min)') : 
            minHeight >= 44;
          
          return hasValidWidth && hasValidHeight;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: touch targets are maintained on mobile devices', () => {
    const componentsCSS = fs.readFileSync(path.join(__dirname, '../../css/components.css'), 'utf-8');
    
    // Extract mobile media query section
    const mobileRegex = /@media\s*\(\s*max-width:\s*767px\s*\)\s*{([\s\S]*?)}\s*(?:\/\*|$)/;
    const mobileMatch = componentsCSS.match(mobileRegex);
    
    if (!mobileMatch) return; // No mobile styles
    
    const mobileCSS = mobileMatch[1];
    
    fc.assert(
      fc.property(
        fc.constantFrom('btn', 'btn--large'),
        (selector) => {
          // Check if mobile styles maintain touch targets
          const rules = extractCSSRules(mobileCSS, `.${selector}`);
          
          if (!rules) return true; // No mobile override
          
          // If mobile styles exist, they should maintain min dimensions
          const minWidth = extractNumericValue(rules, 'min-width');
          const minHeight = extractNumericValue(rules, 'min-height');
          
          const hasValidWidth = minWidth === null || minWidth >= 44 || 
            rules.includes('var(--touch-target-min)');
          
          const hasValidHeight = minHeight === null || minHeight >= 44 || 
            rules.includes('var(--touch-target-min)');
          
          return hasValidWidth && hasValidHeight;
        }
      ),
      propertyTestConfig
    );
  });
});

describe('Property 16: Hover State Feedback', () => {
  /**
   * **Validates: Requirements 7.1**
   * 
   * For any interactive element (button, link, card), the element SHALL have 
   * defined :hover styles that provide visual feedback.
   */
  
  const interactiveSelectors = [
    'btn--primary',
    'btn--secondary',
    'card',
    'card--glass',
    'card--interactive',
    'tag'
  ];
  
  test('property: interactive elements have hover state defined', () => {
    const componentsCSS = fs.readFileSync(path.join(__dirname, '../../css/components.css'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constantFrom(...interactiveSelectors),
        (selector) => {
          // Check the selector and its base class for hover state
          const baseSelector = selector.split('--')[0];
          
          // Check if either the specific selector or base class has hover state
          return hasHoverState(componentsCSS, selector) || 
                 hasHoverState(componentsCSS, baseSelector);
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: hover states provide visual feedback', () => {
    const componentsCSS = fs.readFileSync(path.join(__dirname, '../../css/components.css'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constantFrom(...interactiveSelectors),
        (selector) => {
          // Check the selector and its base class for hover rules
          const baseSelector = selector.split('--')[0];
          
          let hoverRules = getHoverRules(componentsCSS, selector);
          
          // If not found, check base class
          if (!hoverRules) {
            hoverRules = getHoverRules(componentsCSS, baseSelector);
          }
          
          if (!hoverRules) return false; // Should have hover state
          
          // Visual feedback can be: transform, background, box-shadow, opacity, color
          const hasTransform = hasProperty(hoverRules, 'transform');
          const hasBackground = hasProperty(hoverRules, 'background');
          const hasShadow = hasProperty(hoverRules, 'box-shadow');
          const hasOpacity = hasProperty(hoverRules, 'opacity');
          const hasColor = hasProperty(hoverRules, 'color');
          
          // At least one visual feedback property should be present
          return hasTransform || hasBackground || hasShadow || hasOpacity || hasColor;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: button hover states include transform or background change', () => {
    const componentsCSS = fs.readFileSync(path.join(__dirname, '../../css/components.css'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constantFrom('btn--primary', 'btn--secondary'),
        (selector) => {
          const hoverRules = getHoverRules(componentsCSS, selector);
          
          if (!hoverRules) return false;
          
          // Buttons should have transform or background change
          const hasTransform = hasProperty(hoverRules, 'transform');
          const hasBackground = hasProperty(hoverRules, 'background');
          
          return hasTransform || hasBackground;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: card hover states include transform', () => {
    const componentsCSS = fs.readFileSync(path.join(__dirname, '../../css/components.css'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constantFrom('card', 'card--glass'),
        (selector) => {
          const hoverRules = getHoverRules(componentsCSS, selector);
          
          if (!hoverRules) return false;
          
          // Cards should have transform on hover
          return hasProperty(hoverRules, 'transform');
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: hover feedback includes box-shadow enhancement', () => {
    const componentsCSS = fs.readFileSync(path.join(__dirname, '../../css/components.css'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constantFrom('btn--primary', 'card', 'card--glass'),
        (selector) => {
          const hoverRules = getHoverRules(componentsCSS, selector);
          
          if (!hoverRules) return false;
          
          // Should have box-shadow for depth effect
          return hasProperty(hoverRules, 'box-shadow');
        }
      ),
      propertyTestConfig
    );
  });
});

describe('Property 18: CSS Transitions on State Changes', () => {
  /**
   * **Validates: Requirements 7.4**
   * 
   * For any interactive element, state changes (hover, focus, active) SHALL be 
   * animated using CSS transition properties.
   */
  
  const interactiveSelectors = [
    'btn',
    'btn--primary',
    'btn--secondary',
    'card',
    'card--glass',
    'card--interactive',
    'tag'
  ];
  
  test('property: interactive elements have transition property defined', () => {
    const componentsCSS = fs.readFileSync(path.join(__dirname, '../../css/components.css'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constantFrom(...interactiveSelectors),
        (selector) => {
          // Check the selector and its base class for transition
          const baseSelector = selector.split('--')[0];
          
          let rules = extractCSSRules(componentsCSS, `.${selector}`);
          
          // If not found or no transition, check base class
          if (!rules || !hasProperty(rules, 'transition')) {
            rules = extractCSSRules(componentsCSS, `.${baseSelector}`);
          }
          
          if (!rules) return true; // Selector might not exist
          
          // Should have transition property
          return hasProperty(rules, 'transition');
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: transitions use timing variables from design system', () => {
    const componentsCSS = fs.readFileSync(path.join(__dirname, '../../css/components.css'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constantFrom(...interactiveSelectors),
        (selector) => {
          const rules = extractCSSRules(componentsCSS, `.${selector}`);
          
          if (!rules) return true;
          
          // Check if transition uses CSS variables
          const transitionMatch = rules.match(/transition:\s*([^;]+);/);
          
          if (!transitionMatch) return true; // No transition
          
          const transitionValue = transitionMatch[1];
          
          // Should use var(--transition-*) or var(--easing-*)
          return transitionValue.includes('var(--transition-') || 
                 transitionValue.includes('var(--easing-');
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: transitions animate multiple properties or use "all"', () => {
    const componentsCSS = fs.readFileSync(path.join(__dirname, '../../css/components.css'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constantFrom('btn', 'card'),
        (selector) => {
          const rules = extractCSSRules(componentsCSS, `.${selector}`);
          
          if (!rules) return true;
          
          const transitionMatch = rules.match(/transition:\s*([^;]+);/);
          
          if (!transitionMatch) return true;
          
          const transitionValue = transitionMatch[1];
          
          // Should use 'all' or list multiple properties (contains comma)
          const usesAll = /\ball\b/.test(transitionValue);
          const hasMultiple = transitionValue.includes(',');
          
          return usesAll || hasMultiple;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: transitions are disabled in reduced motion mode', () => {
    const componentsCSS = fs.readFileSync(path.join(__dirname, '../../css/components.css'), 'utf-8');
    
    // Extract reduced motion media query
    const reducedMotionRegex = /@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)\s*{([\s\S]*?)}\s*(?:\/\*|@media|$)/;
    const reducedMotionMatch = componentsCSS.match(reducedMotionRegex);
    
    if (!reducedMotionMatch) {
      throw new Error('No reduced motion support found');
    }
    
    const reducedMotionCSS = reducedMotionMatch[1];
    
    fc.assert(
      fc.property(
        fc.constantFrom('btn', 'card', 'tag'),
        (selector) => {
          // Check if transition is disabled in reduced motion
          const rules = extractCSSRules(reducedMotionCSS, `.${selector}`);
          
          if (!rules) return true; // No override needed
          
          // Should set transition to none
          return rules.includes('transition: none') || 
                 rules.includes('transition:none');
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: image transitions are smooth', () => {
    const componentsCSS = fs.readFileSync(path.join(__dirname, '../../css/components.css'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constant('card__image img'),
        (selector) => {
          const rules = extractCSSRules(componentsCSS, `.${selector}`);
          
          if (!rules) return true;
          
          // Should have transition for smooth scaling
          return hasProperty(rules, 'transition');
        }
      ),
      propertyTestConfig
    );
  });
});

describe('Property 21: Button Click Feedback', () => {
  /**
   * **Validates: Requirements 7.7**
   * 
   * For any button element, the button SHALL have defined :active styles that 
   * provide immediate visual feedback on click.
   */
  
  const buttonSelectors = [
    'btn--primary',
    'btn--secondary',
    'card--interactive'
  ];
  
  test('property: buttons have active state defined', () => {
    const componentsCSS = fs.readFileSync(path.join(__dirname, '../../css/components.css'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constantFrom(...buttonSelectors),
        (selector) => {
          // Check if active state exists
          return hasActiveState(componentsCSS, selector);
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: active states provide visual feedback', () => {
    const componentsCSS = fs.readFileSync(path.join(__dirname, '../../css/components.css'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constantFrom(...buttonSelectors),
        (selector) => {
          const activeRules = getActiveRules(componentsCSS, selector);
          
          if (!activeRules) return false; // Should have active state
          
          // Visual feedback can be: transform, box-shadow, background, opacity
          const hasTransform = hasProperty(activeRules, 'transform');
          const hasShadow = hasProperty(activeRules, 'box-shadow');
          const hasBackground = hasProperty(activeRules, 'background');
          const hasOpacity = hasProperty(activeRules, 'opacity');
          
          // At least one visual feedback property should be present
          return hasTransform || hasShadow || hasBackground || hasOpacity;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: button active state uses transform or shadow', () => {
    const componentsCSS = fs.readFileSync(path.join(__dirname, '../../css/components.css'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constantFrom('btn--primary', 'btn--secondary'),
        (selector) => {
          const activeRules = getActiveRules(componentsCSS, selector);
          
          if (!activeRules) return false;
          
          // Buttons should have transform or box-shadow change
          const hasTransform = hasProperty(activeRules, 'transform');
          const hasShadow = hasProperty(activeRules, 'box-shadow');
          
          return hasTransform || hasShadow;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: active state provides "pressed" effect', () => {
    const componentsCSS = fs.readFileSync(path.join(__dirname, '../../css/components.css'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constantFrom('btn--primary', 'btn--secondary'),
        (selector) => {
          const activeRules = getActiveRules(componentsCSS, selector);
          
          if (!activeRules) return false;
          
          // Check for "pressed" effect - typically translateY(0) or reduced shadow
          const hasTransform = activeRules.includes('translateY(0)');
          const hasShadow = hasProperty(activeRules, 'box-shadow');
          
          return hasTransform || hasShadow;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: active transforms are disabled in reduced motion mode', () => {
    const componentsCSS = fs.readFileSync(path.join(__dirname, '../../css/components.css'), 'utf-8');
    
    // Extract reduced motion media query
    const reducedMotionRegex = /@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)\s*{([\s\S]*?)}\s*(?:\/\*|@media|$)/;
    const reducedMotionMatch = componentsCSS.match(reducedMotionRegex);
    
    if (!reducedMotionMatch) {
      throw new Error('No reduced motion support found');
    }
    
    const reducedMotionCSS = reducedMotionMatch[1];
    
    fc.assert(
      fc.property(
        fc.constantFrom('btn:hover', 'btn:active'),
        (selector) => {
          // Check if transforms are disabled in reduced motion
          const selectorParts = selector.split(':');
          const baseSelector = selectorParts[0];
          const pseudoClass = selectorParts[1];
          
          // Look for the pseudo-class in reduced motion section
          const pseudoRegex = new RegExp(`\\.${baseSelector}:${pseudoClass}\\s*{([^}]+)}`, 's');
          const match = reducedMotionCSS.match(pseudoRegex);
          
          if (!match) return true; // No override needed
          
          const rules = match[1];
          
          // Should set transform to none
          return rules.includes('transform: none') || 
                 rules.includes('transform:none');
        }
      ),
      propertyTestConfig
    );
  });
});
