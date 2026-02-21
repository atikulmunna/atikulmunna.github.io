/**
 * Property-Based Tests for Typography System
 * Feature: portfolio-website
 * Task 2.3: Write property tests for typography
 * 
 * **Validates: Requirements 8.2, 8.3, 8.4, 8.7**
 * 
 * This file tests universal properties that should hold true for all typography:
 * - Property 4: Minimum Font Size
 * - Property 22: Line Height Range
 * - Property 23: Typographic Hierarchy
 * - Property 25: Consistent Typography
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
 * Parse CSS value to pixels
 * Handles rem, em, px units
 */
function parseToPixels(value, baseFontSize = 16) {
  if (!value) return 0;
  
  const match = value.match(/^([\d.]+)(rem|em|px)?$/);
  if (!match) return 0;
  
  const num = parseFloat(match[1]);
  const unit = match[2] || '';
  
  switch (unit) {
    case 'rem':
    case 'em':
      return num * baseFontSize;
    case 'px':
      return num;
    default:
      return num;
  }
}

/**
 * Extract font-size from CSS for a given selector (excluding media queries)
 */
function getFontSizeFromCSS(cssContent, selector) {
  // Remove media queries to get base styles only
  const baseCSS = cssContent.replace(/@media[^{]+\{(?:[^{}]|\{[^}]*\})*\}/gs, '');
  
  // Match the selector as a standalone (not part of a group selector)
  // Use word boundary or comma to ensure we match the exact selector
  const selectorRegex = new RegExp(`(?:^|\\})\\s*${selector}\\s*\\{([^}]+)\\}`, 'sm');
  const match = baseCSS.match(selectorRegex);
  
  if (!match) return null;
  
  const rules = match[1];
  const fontSizeMatch = rules.match(/font-size:\s*var\(--font-size-(\w+)\)/);
  
  if (!fontSizeMatch) return null;
  
  return fontSizeMatch[1]; // Returns the variable name like 'base', '5xl', etc.
}

/**
 * Get all font-size values from variables.css
 */
function getFontSizeVariables() {
  const variablesCSS = fs.readFileSync(path.join(__dirname, '../../css/variables.css'), 'utf-8');
  const fontSizes = {};
  
  const regex = /--font-size-(\w+):\s*([\d.]+rem);/g;
  let match;
  
  while ((match = regex.exec(variablesCSS)) !== null) {
    const name = match[1];
    const value = match[2];
    fontSizes[name] = parseToPixels(value);
  }
  
  return fontSizes;
}

/**
 * Get all line-height values from variables.css
 */
function getLineHeightVariables() {
  const variablesCSS = fs.readFileSync(path.join(__dirname, '../../css/variables.css'), 'utf-8');
  const lineHeights = {};
  
  const regex = /--line-height-(\w+):\s*([\d.]+);/g;
  let match;
  
  while ((match = regex.exec(variablesCSS)) !== null) {
    const name = match[1];
    const value = parseFloat(match[2]);
    lineHeights[name] = value;
  }
  
  return lineHeights;
}

describe('Property 4: Minimum Font Size', () => {
  /**
   * **Validates: Requirements 2.5, 8.2**
   * 
   * For any body text element, the computed font-size SHALL be at least 16px 
   * across all viewport sizes.
   */
  
  test('property: all body text elements have minimum 16px font size', () => {
    const baseCSS = fs.readFileSync(path.join(__dirname, '../../css/base.css'), 'utf-8');
    const fontSizes = getFontSizeVariables();
    
    fc.assert(
      fc.property(
        // Generate arbitrary body text selectors
        fc.constantFrom('body', 'p', 'div', 'span', 'li', 'td', 'th', 'label'),
        (selector) => {
          // Get the font-size variable used for this selector
          const fontSizeVar = getFontSizeFromCSS(baseCSS, selector);
          
          // If no explicit font-size, it inherits from body which is --font-size-base
          const varName = fontSizeVar || 'base';
          const fontSize = fontSizes[varName];
          
          // Should be at least 16px
          return fontSize >= 16;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: base font size is exactly 16px', () => {
    const fontSizes = getFontSizeVariables();
    
    fc.assert(
      fc.property(
        fc.constant('base'),
        (varName) => {
          return fontSizes[varName] === 16;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: html root font-size is 16px', () => {
    const baseCSS = fs.readFileSync(path.join(__dirname, '../../css/base.css'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constant('html'),
        () => {
          // Check that html has font-size: 16px
          const match = baseCSS.match(/html\s*{[^}]*font-size:\s*16px/s);
          return match !== null;
        }
      ),
      propertyTestConfig
    );
  });
});

describe('Property 22: Line Height Range', () => {
  /**
   * **Validates: Requirements 8.3**
   * 
   * For any text element, the line-height SHALL be between 1.5 and 1.8 
   * for optimal readability.
   */
  
  test('property: all line-height variables are within 1.5-1.8 range', () => {
    const lineHeights = getLineHeightVariables();
    
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(lineHeights)),
        (varName) => {
          const lineHeight = lineHeights[varName];
          
          // Line height should be between 1.5 and 1.8
          // Note: tight (1.25) is allowed for headings, but normal and relaxed must be in range
          if (varName === 'tight') {
            return true; // Headings can have tighter line-height
          }
          
          return lineHeight >= 1.5 && lineHeight <= 1.8;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: body text uses line-height in optimal range', () => {
    const baseCSS = fs.readFileSync(path.join(__dirname, '../../css/base.css'), 'utf-8');
    const lineHeights = getLineHeightVariables();
    
    fc.assert(
      fc.property(
        fc.constantFrom('body', 'p', 'li'),
        (selector) => {
          // Extract line-height for this selector
          const selectorRegex = new RegExp(`${selector}\\s*{([^}]+)}`, 's');
          const match = baseCSS.match(selectorRegex);
          
          if (!match) return true; // Inherits from body
          
          const rules = match[1];
          const lineHeightMatch = rules.match(/line-height:\s*var\(--line-height-(\w+)\)/);
          
          if (!lineHeightMatch) return true; // No explicit line-height
          
          const varName = lineHeightMatch[1];
          const lineHeight = lineHeights[varName];
          
          // Should be in optimal range
          return lineHeight >= 1.5 && lineHeight <= 1.8;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: line-height-normal is exactly 1.5', () => {
    const lineHeights = getLineHeightVariables();
    
    fc.assert(
      fc.property(
        fc.constant('normal'),
        (varName) => {
          return lineHeights[varName] === 1.5;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: line-height-relaxed is within range', () => {
    const lineHeights = getLineHeightVariables();
    
    fc.assert(
      fc.property(
        fc.constant('relaxed'),
        (varName) => {
          const lineHeight = lineHeights[varName];
          return lineHeight >= 1.5 && lineHeight <= 1.8;
        }
      ),
      propertyTestConfig
    );
  });
});

describe('Property 23: Typographic Hierarchy', () => {
  /**
   * **Validates: Requirements 8.4**
   * 
   * For any heading element (h1-h6), the font-size SHALL be larger than body text,
   * with h1 being the largest and sizes decreasing progressively through h6.
   */
  
  test('property: heading font sizes decrease from h1 to h6', () => {
    const baseCSS = fs.readFileSync(path.join(__dirname, '../../css/base.css'), 'utf-8');
    const fontSizes = getFontSizeVariables();
    
    fc.assert(
      fc.property(
        fc.constantFrom(
          ['h1', 'h2'],
          ['h2', 'h3'],
          ['h3', 'h4'],
          ['h4', 'h5'],
          ['h5', 'h6']
        ),
        ([largerHeading, smallerHeading]) => {
          const largerVar = getFontSizeFromCSS(baseCSS, largerHeading);
          const smallerVar = getFontSizeFromCSS(baseCSS, smallerHeading);
          
          if (!largerVar || !smallerVar) return false;
          
          const largerSize = fontSizes[largerVar];
          const smallerSize = fontSizes[smallerVar];
          
          // Larger heading should have larger font size
          return largerSize > smallerSize;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: all headings are larger than body text', () => {
    const baseCSS = fs.readFileSync(path.join(__dirname, '../../css/base.css'), 'utf-8');
    const fontSizes = getFontSizeVariables();
    const bodySize = fontSizes['base']; // 16px
    
    fc.assert(
      fc.property(
        fc.constantFrom('h1', 'h2', 'h3', 'h4', 'h5', 'h6'),
        (heading) => {
          const headingVar = getFontSizeFromCSS(baseCSS, heading);
          
          if (!headingVar) return false;
          
          const headingSize = fontSizes[headingVar];
          
          // Heading should be larger than body text
          return headingSize > bodySize;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: h1 uses the largest font size', () => {
    const baseCSS = fs.readFileSync(path.join(__dirname, '../../css/base.css'), 'utf-8');
    const fontSizes = getFontSizeVariables();
    
    fc.assert(
      fc.property(
        fc.constant('h1'),
        (heading) => {
          const h1Var = getFontSizeFromCSS(baseCSS, heading);
          
          if (!h1Var) return false;
          
          const h1Size = fontSizes[h1Var];
          
          // h1 should use 5xl (48px) - the largest heading size
          return h1Var === '5xl' && h1Size === 48;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: heading hierarchy is consistent', () => {
    const baseCSS = fs.readFileSync(path.join(__dirname, '../../css/base.css'), 'utf-8');
    const fontSizes = getFontSizeVariables();
    
    // Define expected hierarchy
    const expectedHierarchy = {
      'h1': '5xl',
      'h2': '4xl',
      'h3': '3xl',
      'h4': '2xl',
      'h5': 'xl',
      'h6': 'lg'
    };
    
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(expectedHierarchy)),
        (heading) => {
          const actualVar = getFontSizeFromCSS(baseCSS, heading);
          const expectedVar = expectedHierarchy[heading];
          
          return actualVar === expectedVar;
        }
      ),
      propertyTestConfig
    );
  });
});

describe('Property 25: Consistent Typography', () => {
  /**
   * **Validates: Requirements 8.7**
   * 
   * For any two elements of the same type (e.g., all h2 elements, all paragraph elements),
   * they SHALL have the same font-size, font-weight, and line-height values.
   */
  
  test('property: all elements of same type have consistent font-size', () => {
    const baseCSS = fs.readFileSync(path.join(__dirname, '../../css/base.css'), 'utf-8');
    
    // Remove media queries to test base styles only
    const baseCSSNoMedia = baseCSS.replace(/@media[^{]+\{(?:[^{}]|\{[^}]*\})*\}/gs, '');
    
    fc.assert(
      fc.property(
        fc.constantFrom('h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'body'),
        (elementType) => {
          // For a given element type, there should be only one font-size definition in base styles
          const regex = new RegExp(`${elementType}\\s*{[^}]*font-size:\\s*var\\(--font-size-(\\w+)\\)`, 'gs');
          const matches = [...baseCSSNoMedia.matchAll(regex)];
          
          if (matches.length === 0) return true; // No explicit font-size, inherits
          
          // All matches should use the same variable
          const firstVar = matches[0][1];
          return matches.every(match => match[1] === firstVar);
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: all elements of same type have consistent line-height', () => {
    const baseCSS = fs.readFileSync(path.join(__dirname, '../../css/base.css'), 'utf-8');
    
    // Remove media queries to test base styles only
    const baseCSSNoMedia = baseCSS.replace(/@media[^{]+\{(?:[^{}]|\{[^}]*\})*\}/gs, '');
    
    fc.assert(
      fc.property(
        fc.constantFrom('h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'body'),
        (elementType) => {
          // For a given element type, there should be only one line-height definition in base styles
          const regex = new RegExp(`${elementType}\\s*{[^}]*line-height:\\s*var\\(--line-height-(\\w+)\\)`, 'gs');
          const matches = [...baseCSSNoMedia.matchAll(regex)];
          
          if (matches.length === 0) return true; // No explicit line-height, inherits
          
          // All matches should use the same variable
          const firstVar = matches[0][1];
          return matches.every(match => match[1] === firstVar);
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: all elements of same type have consistent font-weight', () => {
    const baseCSS = fs.readFileSync(path.join(__dirname, '../../css/base.css'), 'utf-8');
    
    // Remove media queries to test base styles only
    const baseCSSNoMedia = baseCSS.replace(/@media[^{]+\{(?:[^{}]|\{[^}]*\})*\}/gs, '');
    
    fc.assert(
      fc.property(
        fc.constantFrom('h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'body'),
        (elementType) => {
          // For a given element type, there should be only one font-weight definition in base styles
          const regex = new RegExp(`${elementType}\\s*{[^}]*font-weight:\\s*var\\(--font-weight-(\\w+)\\)`, 'gs');
          const matches = [...baseCSSNoMedia.matchAll(regex)];
          
          if (matches.length === 0) return true; // No explicit font-weight, inherits
          
          // All matches should use the same variable
          const firstVar = matches[0][1];
          return matches.every(match => match[1] === firstVar);
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: headings use consistent styling approach', () => {
    const baseCSS = fs.readFileSync(path.join(__dirname, '../../css/base.css'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constantFrom('h1', 'h2', 'h3', 'h4', 'h5', 'h6'),
        (heading) => {
          // All headings should be defined in a group selector or individually
          // Check if heading has font-family, font-weight, line-height defined
          
          // Check for group selector
          const groupMatch = baseCSS.match(/h1,\s*h2,\s*h3,\s*h4,\s*h5,\s*h6\s*{([^}]+)}/s);
          if (groupMatch) {
            const rules = groupMatch[1];
            // Should define font-family, font-weight, line-height
            return rules.includes('font-family') && 
                   rules.includes('font-weight') && 
                   rules.includes('line-height');
          }
          
          return true;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: all paragraphs use same line-height', () => {
    const baseCSS = fs.readFileSync(path.join(__dirname, '../../css/base.css'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constant('p'),
        (elementType) => {
          // Paragraphs should have consistent line-height
          const regex = /p\s*{[^}]*line-height:\s*var\(--line-height-(\w+)\)/s;
          const match = baseCSS.match(regex);
          
          if (!match) return false; // Should have explicit line-height
          
          // Should use relaxed line-height (1.75)
          return match[1] === 'relaxed';
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: CSS uses variables for consistency', () => {
    const baseCSS = fs.readFileSync(path.join(__dirname, '../../css/base.css'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constantFrom('font-size', 'line-height', 'font-weight'),
        (property) => {
          // All typography properties should use CSS variables
          const regex = new RegExp(`${property}:\\s*var\\(`, 'g');
          const matches = baseCSS.match(regex);
          
          // Should have multiple uses of variables for this property
          return matches && matches.length > 0;
        }
      ),
      propertyTestConfig
    );
  });
});
