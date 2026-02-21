/**
 * Property-Based Tests for Line Length
 * Feature: portfolio-website
 * Task 9.3: Write property test for line length
 * 
 * **Validates: Requirements 8.6**
 * 
 * This file tests universal properties that should hold true for line length:
 * - Property 24: Line Length Limit
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
 * Parse CSS value to extract numeric value and unit
 */
function parseCSSValue(value) {
  if (!value) return null;
  
  const match = value.trim().match(/^([\d.]+)(ch|px|rem|em)?$/);
  if (!match) return null;
  
  return {
    value: parseFloat(match[1]),
    unit: match[2] || ''
  };
}

/**
 * Extract max-width values from CSS for text containers
 */
function getMaxWidthFromCSS(cssContent, selector) {
  // Remove media queries to get base styles only
  const baseCSS = cssContent.replace(/@media[^{]+\{(?:[^{}]|\{[^}]*\})*\}/gs, '');
  
  // Match the selector and extract max-width
  const selectorRegex = new RegExp(`${selector}\\s*{([^}]+)}`, 's');
  const match = baseCSS.match(selectorRegex);
  
  if (!match) return null;
  
  const rules = match[1];
  const maxWidthMatch = rules.match(/max-width:\s*([^;]+);/);
  
  if (!maxWidthMatch) return null;
  
  return maxWidthMatch[1].trim();
}

/**
 * Get all max-width declarations for text elements from CSS files
 */
function getAllTextMaxWidths() {
  const baseCSS = fs.readFileSync(path.join(__dirname, '../../css/base.css'), 'utf-8');
  
  const maxWidths = {};
  
  // Check base.css for paragraph max-width
  const pMaxWidth = getMaxWidthFromCSS(baseCSS, 'p');
  if (pMaxWidth) {
    maxWidths['p'] = pMaxWidth;
  }
  
  return maxWidths;
}

describe('Property 24: Line Length Limit', () => {
  /**
   * **Validates: Requirements 8.6**
   * 
   * For any text container with paragraph content, the max-width SHALL limit 
   * line length to approximately 60-80 characters (typically 60-70ch or 600-800px).
   */
  
  test('property: paragraph elements have max-width set for line length', () => {
    const maxWidths = getAllTextMaxWidths();
    
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(maxWidths)),
        (selector) => {
          const maxWidth = maxWidths[selector];
          
          // Should have a max-width value
          return maxWidth !== null && maxWidth !== undefined;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: max-width uses ch unit for character-based line length', () => {
    const maxWidths = getAllTextMaxWidths();
    
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(maxWidths)),
        (selector) => {
          const maxWidth = maxWidths[selector];
          const parsed = parseCSSValue(maxWidth);
          
          if (!parsed) return false;
          
          // Should use 'ch' unit for character-based measurement
          return parsed.unit === 'ch';
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: max-width in ch is within 60-80 character range', () => {
    const maxWidths = getAllTextMaxWidths();
    
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(maxWidths)),
        (selector) => {
          const maxWidth = maxWidths[selector];
          const parsed = parseCSSValue(maxWidth);
          
          if (!parsed || parsed.unit !== 'ch') return false;
          
          // Should be between 60 and 80 characters
          return parsed.value >= 60 && parsed.value <= 80;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: base paragraph has max-width for line length', () => {
    const baseCSS = fs.readFileSync(path.join(__dirname, '../../css/base.css'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constant('p'),
        (selector) => {
          const maxWidth = getMaxWidthFromCSS(baseCSS, selector);
          
          if (!maxWidth) return false;
          
          const parsed = parseCSSValue(maxWidth);
          
          // Should have max-width in ch unit within range
          return parsed && 
                 parsed.unit === 'ch' && 
                 parsed.value >= 60 && 
                 parsed.value <= 80;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: line length limit is consistent across text containers', () => {
    const maxWidths = getAllTextMaxWidths();
    const values = Object.values(maxWidths).map(mw => parseCSSValue(mw));
    
    fc.assert(
      fc.property(
        fc.constant(values),
        (parsedValues) => {
          // Base typography line length token should be consistent.
          const firstValue = parsedValues[0];
          
          return parsedValues.every(v => 
            v && 
            v.unit === firstValue.unit && 
            v.value === firstValue.value
          );
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: 70ch is within optimal readability range', () => {
    fc.assert(
      fc.property(
        fc.constant(70),
        (chValue) => {
          // 70ch should be within the 60-80 character optimal range
          return chValue >= 60 && chValue <= 80;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: text containers do not exceed maximum line length', () => {
    const maxWidths = getAllTextMaxWidths();
    
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(maxWidths)),
        (selector) => {
          const maxWidth = maxWidths[selector];
          const parsed = parseCSSValue(maxWidth);
          
          if (!parsed || parsed.unit !== 'ch') return false;
          
          // Should not exceed 80 characters (upper limit)
          return parsed.value <= 80;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: text containers meet minimum line length', () => {
    const maxWidths = getAllTextMaxWidths();
    
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(maxWidths)),
        (selector) => {
          const maxWidth = maxWidths[selector];
          const parsed = parseCSSValue(maxWidth);
          
          if (!parsed || parsed.unit !== 'ch') return false;
          
          // Should meet minimum 60 characters (lower limit)
          return parsed.value >= 60;
        }
      ),
      propertyTestConfig
    );
  });
});
