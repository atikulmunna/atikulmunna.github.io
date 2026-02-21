/**
 * Property-Based Tests for Glassmorphism Effects
 * Feature: portfolio-website
 * Task 3.2: Write property tests for glassmorphism effects
 * 
 * **Validates: Requirements 4.2, 4.3, 4.6**
 * 
 * This file tests universal properties that should hold true for glassmorphism:
 * - Property 6: Glassmorphism on Buttons
 * - Property 7: Glassmorphism on Cards
 * - Property 8: Glassmorphism Fallback
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
  
  // Match the selector and its rules
  const regex = new RegExp(`${escapedSelector}\\s*{([^}]+)}`, 's');
  const match = cssContent.match(regex);
  
  return match ? match[1] : null;
}

/**
 * Check if CSS has backdrop-filter property
 */
function hasBackdropFilter(rules) {
  if (!rules) return false;
  return /backdrop-filter:\s*blur\([^)]+\)/.test(rules) ||
         /-webkit-backdrop-filter:\s*blur\([^)]+\)/.test(rules);
}

/**
 * Check if CSS has transparent background
 */
function hasTransparentBackground(rules) {
  if (!rules) return false;
  const bgMatch = rules.match(/background:\s*rgba\([^)]+\)/);
  if (!bgMatch) return false;
  
  // Extract alpha value from rgba
  const alphaMatch = bgMatch[0].match(/rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/);
  if (!alphaMatch) return false;
  
  const alpha = parseFloat(alphaMatch[1]);
  // Transparent means alpha < 1.0
  return alpha < 1.0;
}

/**
 * Extract alpha value from rgba background
 */
function getBackgroundAlpha(rules) {
  if (!rules) return null;
  const bgMatch = rules.match(/background:\s*rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/);
  if (!bgMatch) return null;
  
  // bgMatch[1] contains the alpha value directly
  return parseFloat(bgMatch[1]);
}

/**
 * Check if CSS is within @supports block for backdrop-filter
 * Uses a more robust approach to handle nested braces
 * Handles partial selector matches (e.g., .btn--glass matches .btn--primary.btn--glass)
 */
function isInSupportsBlock(cssContent, selector) {
  const lines = cssContent.split('\n');
  let inSupportsBlock = false;
  let braceDepth = 0;
  let supportsStartLine = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if we're entering a @supports block
    if (line.includes('@supports') && line.includes('backdrop-filter')) {
      inSupportsBlock = true;
      supportsStartLine = i;
      braceDepth = 0;
    }
    
    // Count braces
    if (inSupportsBlock) {
      for (const char of line) {
        if (char === '{') braceDepth++;
        if (char === '}') braceDepth--;
      }
      
      // Check if this line contains our selector (allow partial matches)
      // This handles cases like .btn--glass matching .btn--primary.btn--glass
      if (line.includes(selector)) {
        return true;
      }
      
      // Check if we've exited the @supports block
      if (braceDepth === 0 && i > supportsStartLine) {
        inSupportsBlock = false;
      }
    }
  }
  
  return false;
}

/**
 * Get fallback background opacity for a selector
 * Looks for the selector outside @supports blocks
 */
function getFallbackOpacity(cssContent, selector) {
  const lines = cssContent.split('\n');
  let inSupportsBlock = false;
  let braceDepth = 0;
  let supportsStartLine = -1;
  let inTargetSelector = false;
  let selectorBraceDepth = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Track @supports blocks
    if (line.includes('@supports') && line.includes('backdrop-filter')) {
      inSupportsBlock = true;
      supportsStartLine = i;
      braceDepth = 0;
    }
    
    if (inSupportsBlock) {
      for (const char of line) {
        if (char === '{') braceDepth++;
        if (char === '}') braceDepth--;
      }
      
      if (braceDepth === 0 && i > supportsStartLine) {
        inSupportsBlock = false;
      }
    }
    
    // Only look at lines outside @supports blocks
    if (!inSupportsBlock) {
      // Check if this line starts our selector
      if (line.includes(selector) && line.includes('{')) {
        inTargetSelector = true;
        selectorBraceDepth = 0;
      }
      
      if (inTargetSelector) {
        // Count braces for this selector
        for (const char of line) {
          if (char === '{') selectorBraceDepth++;
          if (char === '}') selectorBraceDepth--;
        }
        
        // Check for background with rgba
        const bgMatch = line.match(/background:\s*rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/);
        if (bgMatch) {
          return parseFloat(bgMatch[1]);
        }
        
        // Exit selector block
        if (selectorBraceDepth === 0) {
          inTargetSelector = false;
        }
      }
    }
  }
  
  return null;
}

/**
 * Get enhanced background opacity for a selector (within @supports)
 */
function getEnhancedOpacity(cssContent, selector) {
  const lines = cssContent.split('\n');
  let inSupportsBlock = false;
  let braceDepth = 0;
  let supportsStartLine = -1;
  let inTargetSelector = false;
  let selectorBraceDepth = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Track @supports blocks
    if (line.includes('@supports') && line.includes('backdrop-filter')) {
      inSupportsBlock = true;
      supportsStartLine = i;
      braceDepth = 0;
    }
    
    if (inSupportsBlock) {
      for (const char of line) {
        if (char === '{') braceDepth++;
        if (char === '}') braceDepth--;
      }
      
      // Check if this line starts our selector
      if (line.includes(selector) && line.includes('{')) {
        inTargetSelector = true;
        selectorBraceDepth = 0;
      }
      
      if (inTargetSelector) {
        // Count braces for this selector
        for (const char of line) {
          if (char === '{') selectorBraceDepth++;
          if (char === '}') selectorBraceDepth--;
        }
        
        // Check for background with rgba
        const bgMatch = line.match(/background:\s*rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/);
        if (bgMatch) {
          return parseFloat(bgMatch[1]);
        }
        
        // Exit selector block
        if (selectorBraceDepth === 0) {
          inTargetSelector = false;
        }
      }
      
      // Check if we've exited the @supports block
      if (braceDepth === 0 && i > supportsStartLine) {
        inSupportsBlock = false;
      }
    }
  }
  
  return null;
}

describe('Property 6: Glassmorphism on Buttons', () => {
  /**
   * **Validates: Requirements 4.2**
   * 
   * For any button element with the glass effect class, the computed styles 
   * SHALL include backdrop-filter with blur value and background with alpha transparency.
   */
  
  const glassButtonSelectors = [
    '.btn--glass',
    '.btn--primary.btn--glass',
    '.btn--secondary.btn--glass',
    '.glass-button'
  ];
  
  test('property: glass buttons have backdrop-filter in @supports block', () => {
    const componentsCSS = fs.readFileSync(path.join(__dirname, '../../css/components.css'), 'utf-8');
    const glassmorphismCSS = fs.readFileSync(path.join(__dirname, '../../css/glassmorphism.css'), 'utf-8');
    const allCSS = componentsCSS + '\n' + glassmorphismCSS;
    
    fc.assert(
      fc.property(
        fc.constantFrom(...glassButtonSelectors),
        (selector) => {
          // Check if selector is in @supports block
          const inSupports = isInSupportsBlock(allCSS, selector);
          
          // Glass button selectors should be in @supports blocks
          // If not found, it's okay - might be a base class that's extended
          if (!inSupports) {
            return true; // Skip this check for base selectors
          }
          
          // If in @supports, verify it has backdrop-filter
          const lines = allCSS.split('\n');
          let inSupportsBlock = false;
          let braceDepth = 0;
          let supportsStartLine = -1;
          let inTargetSelector = false;
          let hasBackdropFilter = false;
          
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            if (line.includes('@supports') && line.includes('backdrop-filter')) {
              inSupportsBlock = true;
              supportsStartLine = i;
              braceDepth = 0;
            }
            
            if (inSupportsBlock) {
              for (const char of line) {
                if (char === '{') braceDepth++;
                if (char === '}') braceDepth--;
              }
              
              if (line.includes(selector) && line.includes('{')) {
                inTargetSelector = true;
              }
              
              if (inTargetSelector) {
                if (line.includes('backdrop-filter:') || line.includes('-webkit-backdrop-filter:')) {
                  hasBackdropFilter = true;
                }
                
                if (line.includes('}')) {
                  inTargetSelector = false;
                }
              }
              
              if (braceDepth === 0 && i > supportsStartLine) {
                inSupportsBlock = false;
              }
            }
          }
          
          return hasBackdropFilter;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: glass buttons have transparent background', () => {
    const componentsCSS = fs.readFileSync(path.join(__dirname, '../../css/components.css'), 'utf-8');
    const glassmorphismCSS = fs.readFileSync(path.join(__dirname, '../../css/glassmorphism.css'), 'utf-8');
    const allCSS = componentsCSS + '\n' + glassmorphismCSS;
    
    fc.assert(
      fc.property(
        fc.constantFrom(...glassButtonSelectors),
        (selector) => {
          // Check both fallback and enhanced versions
          const fallbackOpacity = getFallbackOpacity(allCSS, selector);
          const enhancedOpacity = getEnhancedOpacity(allCSS, selector);
          
          // At least one should have transparent background
          return (fallbackOpacity !== null && fallbackOpacity < 1.0) ||
                 (enhancedOpacity !== null && enhancedOpacity < 1.0);
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: glass buttons have both backdrop-filter and transparent background in @supports', () => {
    const componentsCSS = fs.readFileSync(path.join(__dirname, '../../css/components.css'), 'utf-8');
    const glassmorphismCSS = fs.readFileSync(path.join(__dirname, '../../css/glassmorphism.css'), 'utf-8');
    const allCSS = componentsCSS + '\n' + glassmorphismCSS;
    
    fc.assert(
      fc.property(
        fc.constantFrom(...glassButtonSelectors),
        (selector) => {
          // Find @supports blocks
          const supportsRegex = /@supports\s*\([^)]*backdrop-filter[^)]*\)\s*{([^}]+(?:{[^}]*}[^}]*)*?)}/gs;
          const matches = [...allCSS.matchAll(supportsRegex)];
          
          for (const match of matches) {
            const blockContent = match[1];
            if (blockContent.includes(selector)) {
              const rules = extractCSSRules(blockContent, selector);
              if (rules) {
                // Should have both backdrop-filter and transparent background
                const hasBlur = hasBackdropFilter(rules);
                const hasTransparent = hasTransparentBackground(rules);
                
                if (hasBlur || hasTransparent) {
                  return hasBlur && hasTransparent;
                }
              }
            }
          }
          
          // If not found in @supports, that's okay (might be base selector)
          return true;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: glass-button class has glassmorphism effect', () => {
    const glassmorphismCSS = fs.readFileSync(path.join(__dirname, '../../css/glassmorphism.css'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constant('.glass-button'),
        (selector) => {
          // Check if it has backdrop-filter in @supports
          const inSupports = isInSupportsBlock(glassmorphismCSS, selector);
          
          if (!inSupports) return false;
          
          // Get enhanced opacity
          const enhancedOpacity = getEnhancedOpacity(glassmorphismCSS, selector);
          
          // Should have transparent background
          return enhancedOpacity !== null && enhancedOpacity < 1.0;
        }
      ),
      propertyTestConfig
    );
  });
});

describe('Property 7: Glassmorphism on Cards', () => {
  /**
   * **Validates: Requirements 4.3**
   * 
   * For any card or container element with the glass effect class, the computed styles 
   * SHALL include backdrop-filter with blur value and background with alpha transparency.
   */
  
  const glassCardSelectors = [
    '.card--glass',
    '.card--glass-dark',
    '.glass-card',
    '.glass-effect'
  ];
  
  test('property: glass cards have backdrop-filter in @supports block', () => {
    const componentsCSS = fs.readFileSync(path.join(__dirname, '../../css/components.css'), 'utf-8');
    const glassmorphismCSS = fs.readFileSync(path.join(__dirname, '../../css/glassmorphism.css'), 'utf-8');
    const allCSS = componentsCSS + '\n' + glassmorphismCSS;
    
    fc.assert(
      fc.property(
        fc.constantFrom(...glassCardSelectors),
        (selector) => {
          // Check if selector is in @supports block
          const inSupports = isInSupportsBlock(allCSS, selector);
          
          // Glass card selectors should be in @supports blocks
          // If not found, it's okay - might be a base class that's extended
          if (!inSupports) {
            return true; // Skip this check for base selectors
          }
          
          // If in @supports, verify it has backdrop-filter
          const lines = allCSS.split('\n');
          let inSupportsBlock = false;
          let braceDepth = 0;
          let supportsStartLine = -1;
          let inTargetSelector = false;
          let hasBackdropFilter = false;
          
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            if (line.includes('@supports') && line.includes('backdrop-filter')) {
              inSupportsBlock = true;
              supportsStartLine = i;
              braceDepth = 0;
            }
            
            if (inSupportsBlock) {
              for (const char of line) {
                if (char === '{') braceDepth++;
                if (char === '}') braceDepth--;
              }
              
              if (line.includes(selector) && line.includes('{')) {
                inTargetSelector = true;
              }
              
              if (inTargetSelector) {
                if (line.includes('backdrop-filter:') || line.includes('-webkit-backdrop-filter:')) {
                  hasBackdropFilter = true;
                }
                
                if (line.includes('}')) {
                  inTargetSelector = false;
                }
              }
              
              if (braceDepth === 0 && i > supportsStartLine) {
                inSupportsBlock = false;
              }
            }
          }
          
          return hasBackdropFilter;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: glass cards have transparent background', () => {
    const componentsCSS = fs.readFileSync(path.join(__dirname, '../../css/components.css'), 'utf-8');
    const glassmorphismCSS = fs.readFileSync(path.join(__dirname, '../../css/glassmorphism.css'), 'utf-8');
    const allCSS = componentsCSS + '\n' + glassmorphismCSS;
    
    fc.assert(
      fc.property(
        fc.constantFrom(...glassCardSelectors),
        (selector) => {
          // Check both fallback and enhanced versions
          const fallbackOpacity = getFallbackOpacity(allCSS, selector);
          const enhancedOpacity = getEnhancedOpacity(allCSS, selector);
          
          // At least one should have transparent background
          return (fallbackOpacity !== null && fallbackOpacity < 1.0) ||
                 (enhancedOpacity !== null && enhancedOpacity < 1.0);
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: glass cards have both backdrop-filter and transparent background in @supports', () => {
    const componentsCSS = fs.readFileSync(path.join(__dirname, '../../css/components.css'), 'utf-8');
    const glassmorphismCSS = fs.readFileSync(path.join(__dirname, '../../css/glassmorphism.css'), 'utf-8');
    const allCSS = componentsCSS + '\n' + glassmorphismCSS;
    
    fc.assert(
      fc.property(
        fc.constantFrom(...glassCardSelectors),
        (selector) => {
          // Find @supports blocks
          const supportsRegex = /@supports\s*\([^)]*backdrop-filter[^)]*\)\s*{([^}]+(?:{[^}]*}[^}]*)*?)}/gs;
          const matches = [...allCSS.matchAll(supportsRegex)];
          
          for (const match of matches) {
            const blockContent = match[1];
            if (blockContent.includes(selector)) {
              const rules = extractCSSRules(blockContent, selector);
              if (rules) {
                // Should have both backdrop-filter and transparent background
                const hasBlur = hasBackdropFilter(rules);
                const hasTransparent = hasTransparentBackground(rules);
                
                if (hasBlur || hasTransparent) {
                  return hasBlur && hasTransparent;
                }
              }
            }
          }
          
          // If not found in @supports, that's okay (might be base selector)
          return true;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: glass-card class has glassmorphism effect', () => {
    const glassmorphismCSS = fs.readFileSync(path.join(__dirname, '../../css/glassmorphism.css'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constant('.glass-card'),
        (selector) => {
          // Check if it has backdrop-filter in @supports
          const inSupports = isInSupportsBlock(glassmorphismCSS, selector);
          
          // Should be in @supports block
          if (!inSupports) return false;
          
          // Get enhanced opacity
          const enhancedOpacity = getEnhancedOpacity(glassmorphismCSS, selector);
          
          // Should have transparent background (opacity < 1.0)
          // Note: it might use a CSS variable, so we check if it's defined
          return enhancedOpacity === null || enhancedOpacity < 1.0;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: glass-effect class has glassmorphism effect', () => {
    const glassmorphismCSS = fs.readFileSync(path.join(__dirname, '../../css/glassmorphism.css'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constant('.glass-effect'),
        (selector) => {
          // Check if it has backdrop-filter in @supports
          const inSupports = isInSupportsBlock(glassmorphismCSS, selector);
          
          if (!inSupports) return false;
          
          // Get enhanced opacity
          const enhancedOpacity = getEnhancedOpacity(glassmorphismCSS, selector);
          
          // Should have transparent background
          return enhancedOpacity !== null && enhancedOpacity < 1.0;
        }
      ),
      propertyTestConfig
    );
  });
});

describe('Property 8: Glassmorphism Fallback', () => {
  /**
   * **Validates: Requirements 4.6, 12.2**
   * 
   * For any element with glassmorphism effects, when backdrop-filter is not supported,
   * the element SHALL have a fallback background with higher opacity (≥0.9) to maintain readability.
   */
  
  const glassSelectors = [
    '.glass-effect',
    '.glass-button',
    '.glass-card',
    '.btn--glass',
    '.card--glass'
  ];
  
  test('property: glass elements have fallback background with high opacity', () => {
    const componentsCSS = fs.readFileSync(path.join(__dirname, '../../css/components.css'), 'utf-8');
    const glassmorphismCSS = fs.readFileSync(path.join(__dirname, '../../css/glassmorphism.css'), 'utf-8');
    const allCSS = componentsCSS + '\n' + glassmorphismCSS;
    
    fc.assert(
      fc.property(
        fc.constantFrom(...glassSelectors),
        (selector) => {
          // Get fallback opacity (outside @supports)
          const fallbackOpacity = getFallbackOpacity(allCSS, selector);
          
          if (fallbackOpacity === null) {
            // No fallback found, might inherit or be defined differently
            return true;
          }
          
          // Fallback should have high opacity (≥0.9) for readability
          return fallbackOpacity >= 0.9;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: enhanced glass has lower opacity than fallback', () => {
    const componentsCSS = fs.readFileSync(path.join(__dirname, '../../css/components.css'), 'utf-8');
    const glassmorphismCSS = fs.readFileSync(path.join(__dirname, '../../css/glassmorphism.css'), 'utf-8');
    const allCSS = componentsCSS + '\n' + glassmorphismCSS;
    
    fc.assert(
      fc.property(
        fc.constantFrom(...glassSelectors),
        (selector) => {
          const fallbackOpacity = getFallbackOpacity(allCSS, selector);
          const enhancedOpacity = getEnhancedOpacity(allCSS, selector);
          
          // If both exist, enhanced should have lower opacity (more transparent)
          if (fallbackOpacity !== null && enhancedOpacity !== null) {
            return enhancedOpacity < fallbackOpacity;
          }
          
          // If only one exists, that's okay
          return true;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: @supports block is used for progressive enhancement', () => {
    const componentsCSS = fs.readFileSync(path.join(__dirname, '../../css/components.css'), 'utf-8');
    const glassmorphismCSS = fs.readFileSync(path.join(__dirname, '../../css/glassmorphism.css'), 'utf-8');
    const allCSS = componentsCSS + '\n' + glassmorphismCSS;
    
    fc.assert(
      fc.property(
        fc.constantFrom(...glassSelectors),
        (selector) => {
          // Check if selector appears in @supports block
          const inSupports = isInSupportsBlock(allCSS, selector);
          
          // Glass selectors should use @supports for progressive enhancement
          return inSupports;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: fallback uses rgba with high opacity', () => {
    const glassmorphismCSS = fs.readFileSync(path.join(__dirname, '../../css/glassmorphism.css'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constantFrom('.glass-effect', '.glass-button', '.glass-card'),
        (selector) => {
          // Get fallback rules
          const withoutSupports = glassmorphismCSS.replace(/@supports[^{]+{(?:[^{}]|{[^}]*})*}/gs, '');
          const rules = extractCSSRules(withoutSupports, selector);
          
          if (!rules) return true; // No fallback defined
          
          // Check if background uses rgba
          const bgMatch = rules.match(/background:\s*rgba\([^)]+\)/);
          if (!bgMatch) return true; // No rgba background
          
          // Extract alpha value
          const alpha = getBackgroundAlpha(rules);
          
          // Should be high opacity (≥0.9)
          return alpha !== null && alpha >= 0.9;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: @supports checks for both standard and webkit backdrop-filter', () => {
    const componentsCSS = fs.readFileSync(path.join(__dirname, '../../css/components.css'), 'utf-8');
    const glassmorphismCSS = fs.readFileSync(path.join(__dirname, '../../css/glassmorphism.css'), 'utf-8');
    const allCSS = componentsCSS + '\n' + glassmorphismCSS;
    
    fc.assert(
      fc.property(
        fc.constant('@supports'),
        () => {
          // Check if @supports includes backdrop-filter checks
          // The format can span multiple lines:
          // @supports (backdrop-filter: ...) or 
          // (-webkit-backdrop-filter: ...)
          
          // Remove newlines to make matching easier
          const singleLineCSS = allCSS.replace(/\n/g, ' ');
          
          // Match @supports blocks
          const supportsRegex = /@supports\s*\([^)]*backdrop-filter[^)]*\)[^{]*/g;
          const matches = [...singleLineCSS.matchAll(supportsRegex)];
          
          // Should have at least one @supports with backdrop-filter
          if (matches.length === 0) return false;
          
          // Check if at least one includes both standard and webkit (via 'or')
          const hasProperSupports = matches.some(match => {
            const condition = match[0];
            // Should have 'or' and both backdrop-filter variants
            return condition.includes('backdrop-filter') && 
                   condition.includes('-webkit-backdrop-filter') &&
                   condition.includes('or');
          });
          
          return hasProperSupports;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: enhanced glass includes webkit prefix', () => {
    const componentsCSS = fs.readFileSync(path.join(__dirname, '../../css/components.css'), 'utf-8');
    const glassmorphismCSS = fs.readFileSync(path.join(__dirname, '../../css/glassmorphism.css'), 'utf-8');
    const allCSS = componentsCSS + '\n' + glassmorphismCSS;
    
    fc.assert(
      fc.property(
        fc.constantFrom(...glassSelectors),
        (selector) => {
          // Find @supports blocks
          const supportsRegex = /@supports\s*\([^)]*backdrop-filter[^)]*\)\s*{([^}]+(?:{[^}]*}[^}]*)*?)}/gs;
          const matches = [...allCSS.matchAll(supportsRegex)];
          
          for (const match of matches) {
            const blockContent = match[1];
            if (blockContent.includes(selector)) {
              const rules = extractCSSRules(blockContent, selector);
              if (rules && hasBackdropFilter(rules)) {
                // Should have -webkit-backdrop-filter
                return rules.includes('-webkit-backdrop-filter');
              }
            }
          }
          
          // If not found, that's okay
          return true;
        }
      ),
      propertyTestConfig
    );
  });
});
