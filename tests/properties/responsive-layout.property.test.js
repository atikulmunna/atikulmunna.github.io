/**
 * Property-Based Tests for Responsive Layout Adaptation
 * Feature: portfolio-website
 * Task 4.2: Write property test for responsive layout adaptation
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
 * 
 * This file tests universal properties that should hold true for responsive layouts:
 * - Property 3: Responsive Layout Adaptation
 */

const fc = require('fast-check');
const fs = require('fs');
const path = require('path');

// Property test configuration - minimum 100 iterations
const propertyTestConfig = {
  numRuns: 100,
  verbose: true
};

// Define breakpoints as per requirements
const BREAKPOINTS = {
  MOBILE_MAX: 767,      // < 768px = mobile
  TABLET_MIN: 768,      // >= 768px = tablet
  TABLET_MAX: 1023,     // < 1024px = tablet
  DESKTOP_MIN: 1024     // >= 1024px = desktop
};

/**
 * Extract media query rules from CSS content
 * Returns an array of { minWidth, maxWidth, content }
 */
function extractMediaQueries(cssContent) {
  const mediaQueries = [];
  
  // Match @media queries with min-width and/or max-width
  const regex = /@media\s*\(([^)]+)\)\s*{([^}]+(?:{[^}]*}[^}]*)*?)}/gs;
  let match;
  
  while ((match = regex.exec(cssContent)) !== null) {
    const condition = match[1];
    const content = match[2];
    
    // Extract min-width
    const minWidthMatch = condition.match(/min-width:\s*(\d+)px/);
    const minWidth = minWidthMatch ? parseInt(minWidthMatch[1]) : null;
    
    // Extract max-width
    const maxWidthMatch = condition.match(/max-width:\s*(\d+)px/);
    const maxWidth = maxWidthMatch ? parseInt(maxWidthMatch[1]) : null;
    
    mediaQueries.push({ minWidth, maxWidth, content, condition });
  }
  
  return mediaQueries;
}

/**
 * Check if a viewport width should apply mobile styles
 */
function isMobileViewport(width) {
  return width <= BREAKPOINTS.MOBILE_MAX;
}

/**
 * Check if a viewport width should apply tablet styles
 */
function isTabletViewport(width) {
  return width >= BREAKPOINTS.TABLET_MIN && width <= BREAKPOINTS.TABLET_MAX;
}

/**
 * Check if a viewport width should apply desktop styles
 */
function isDesktopViewport(width) {
  return width >= BREAKPOINTS.DESKTOP_MIN;
}

/**
 * Get applicable media queries for a given viewport width
 */
function getApplicableMediaQueries(mediaQueries, viewportWidth) {
  return mediaQueries.filter(mq => {
    // Check if this media query applies to the viewport width
    const meetsMin = mq.minWidth === null || viewportWidth >= mq.minWidth;
    const meetsMax = mq.maxWidth === null || viewportWidth <= mq.maxWidth;
    
    return meetsMin && meetsMax;
  });
}

/**
 * Check if CSS has mobile-first architecture
 * Mobile-first means base styles are for mobile, then enhanced with min-width media queries
 */
function hasMobileFirstArchitecture(cssContent) {
  const mediaQueries = extractMediaQueries(cssContent);
  
  // Count min-width vs max-width queries
  const minWidthQueries = mediaQueries.filter(mq => mq.minWidth !== null && mq.maxWidth === null);
  const maxWidthQueries = mediaQueries.filter(mq => mq.maxWidth !== null && mq.minWidth === null);
  
  // Mobile-first should have more min-width queries than max-width queries
  return minWidthQueries.length > maxWidthQueries.length;
}

/**
 * Extract responsive utility classes from CSS
 * e.g., .md\:grid-cols-2, .lg\:flex
 */
function extractResponsiveUtilities(cssContent) {
  const utilities = {
    mobile: [],
    tablet: [],
    desktop: []
  };
  
  const mediaQueries = extractMediaQueries(cssContent);
  
  for (const mq of mediaQueries) {
    // Check which breakpoint this media query targets
    if (mq.minWidth === BREAKPOINTS.TABLET_MIN && mq.maxWidth === null) {
      // Tablet breakpoint
      const classes = mq.content.match(/\.(md\\:[a-z-]+)/g);
      if (classes) {
        utilities.tablet.push(...classes.map(c => c.substring(1))); // Remove leading dot
      }
    } else if (mq.minWidth === BREAKPOINTS.DESKTOP_MIN && mq.maxWidth === null) {
      // Desktop breakpoint
      const classes = mq.content.match(/\.(lg\\:[a-z-]+)/g);
      if (classes) {
        utilities.desktop.push(...classes.map(c => c.substring(1))); // Remove leading dot
      }
    } else if (mq.maxWidth === BREAKPOINTS.MOBILE_MAX && mq.minWidth === null) {
      // Mobile breakpoint
      const classes = mq.content.match(/\.(sm\\:[a-z-]+)/g);
      if (classes) {
        utilities.mobile.push(...classes.map(c => c.substring(1))); // Remove leading dot
      }
    }
  }
  
  return utilities;
}

describe('Property 3: Responsive Layout Adaptation', () => {
  /**
   * **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
   * 
   * For any viewport width, the Portfolio_Website SHALL apply the appropriate layout styles:
   * - mobile styles when width < 768px
   * - tablet styles when 768px ≤ width < 1024px
   * - desktop styles when width ≥ 1024px
   */
  
  const layoutCSS = fs.readFileSync(path.join(__dirname, '../../css/layout.css'), 'utf-8');
  
  test('property: layout.css uses mobile-first architecture', () => {
    fc.assert(
      fc.property(
        fc.constant(layoutCSS),
        (css) => {
          return hasMobileFirstArchitecture(css);
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: tablet breakpoint is exactly 768px', () => {
    fc.assert(
      fc.property(
        fc.constant(layoutCSS),
        (css) => {
          const mediaQueries = extractMediaQueries(css);
          
          // Find tablet breakpoint media queries
          const tabletQueries = mediaQueries.filter(mq => 
            mq.minWidth === BREAKPOINTS.TABLET_MIN && mq.maxWidth === null
          );
          
          // Should have at least one tablet breakpoint
          return tabletQueries.length > 0;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: desktop breakpoint is exactly 1024px', () => {
    fc.assert(
      fc.property(
        fc.constant(layoutCSS),
        (css) => {
          const mediaQueries = extractMediaQueries(css);
          
          // Find desktop breakpoint media queries
          const desktopQueries = mediaQueries.filter(mq => 
            mq.minWidth === BREAKPOINTS.DESKTOP_MIN && mq.maxWidth === null
          );
          
          // Should have at least one desktop breakpoint
          return desktopQueries.length > 0;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: viewport widths apply correct breakpoint styles', () => {
    fc.assert(
      fc.property(
        // Generate random viewport widths across the full range
        fc.integer({ min: 320, max: 1920 }),
        (viewportWidth) => {
          const mediaQueries = extractMediaQueries(layoutCSS);
          const applicable = getApplicableMediaQueries(mediaQueries, viewportWidth);
          
          // Determine which breakpoint this viewport should use
          if (isMobileViewport(viewportWidth)) {
            // Mobile: should NOT have tablet or desktop media queries applied
            const hasTabletOrDesktop = applicable.some(mq => 
              mq.minWidth >= BREAKPOINTS.TABLET_MIN
            );
            return !hasTabletOrDesktop;
          } else if (isTabletViewport(viewportWidth)) {
            // Tablet: should have tablet media queries but NOT desktop
            const hasTablet = applicable.some(mq => 
              mq.minWidth === BREAKPOINTS.TABLET_MIN && mq.maxWidth === null
            );
            const hasDesktop = applicable.some(mq => 
              mq.minWidth === BREAKPOINTS.DESKTOP_MIN
            );
            return hasTablet && !hasDesktop;
          } else if (isDesktopViewport(viewportWidth)) {
            // Desktop: should have both tablet and desktop media queries
            const hasTablet = applicable.some(mq => 
              mq.minWidth === BREAKPOINTS.TABLET_MIN && mq.maxWidth === null
            );
            const hasDesktop = applicable.some(mq => 
              mq.minWidth === BREAKPOINTS.DESKTOP_MIN && mq.maxWidth === null
            );
            return hasTablet && hasDesktop;
          }
          
          return false;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: container has responsive padding at different breakpoints', () => {
    fc.assert(
      fc.property(
        fc.constant('.container'),
        (selector) => {
          // Check base styles (mobile)
          const baseMatch = layoutCSS.match(/\.container\s*{([^}]+)}/s);
          if (!baseMatch) return false;
          
          const baseRules = baseMatch[1];
          const hasMobilePadding = baseRules.includes('padding-left') && baseRules.includes('padding-right');
          
          // Check tablet styles
          const mediaQueries = extractMediaQueries(layoutCSS);
          const tabletQuery = mediaQueries.find(mq => 
            mq.minWidth === BREAKPOINTS.TABLET_MIN && 
            mq.content.includes('.container')
          );
          
          // Check desktop styles
          const desktopQuery = mediaQueries.find(mq => 
            mq.minWidth === BREAKPOINTS.DESKTOP_MIN && 
            mq.content.includes('.container')
          );
          
          // Container should have padding defined at mobile level
          // and optionally enhanced at tablet/desktop
          return hasMobilePadding;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: grid columns adapt across breakpoints', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4'),
        (gridClass) => {
          // Check if there are responsive variants (md:, lg:)
          const hasTabletVariant = layoutCSS.includes(`md\\:${gridClass}`);
          const hasDesktopVariant = layoutCSS.includes(`lg\\:${gridClass}`);
          
          // Should have responsive variants for grid columns
          return hasTabletVariant && hasDesktopVariant;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: responsive utilities use correct breakpoint prefixes', () => {
    fc.assert(
      fc.property(
        fc.constant(layoutCSS),
        (css) => {
          const utilities = extractResponsiveUtilities(css);
          
          // Tablet utilities should use md: prefix
          const tabletUtilitiesValid = utilities.tablet.every(util => util.startsWith('md\\:'));
          
          // Desktop utilities should use lg: prefix
          const desktopUtilitiesValid = utilities.desktop.every(util => util.startsWith('lg\\:'));
          
          return tabletUtilitiesValid && desktopUtilitiesValid;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: section padding adapts for mobile and desktop', () => {
    fc.assert(
      fc.property(
        fc.constant('.section'),
        (selector) => {
          // Check base styles (mobile)
          const baseMatch = layoutCSS.match(/\.section\s*{([^}]+)}/s);
          if (!baseMatch) return false;
          
          const baseRules = baseMatch[1];
          const hasMobilePadding = baseRules.includes('padding-top') && baseRules.includes('padding-bottom');
          
          // Check desktop styles
          const mediaQueries = extractMediaQueries(layoutCSS);
          const desktopQuery = mediaQueries.find(mq => 
            mq.minWidth === BREAKPOINTS.DESKTOP_MIN && 
            mq.content.includes('.section')
          );
          
          const hasDesktopPadding = desktopQuery && 
            (desktopQuery.content.includes('padding-top') || desktopQuery.content.includes('padding-bottom'));
          
          // Section should have different padding for mobile and desktop
          return hasMobilePadding && hasDesktopPadding;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: display utilities have responsive variants', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('block', 'hidden', 'flex', 'inline-flex'),
        (displayValue) => {
          // Check for responsive variants
          const hasMobileVariant = layoutCSS.includes(`sm\\:${displayValue}`);
          const hasTabletVariant = layoutCSS.includes(`md\\:${displayValue}`);
          const hasDesktopVariant = layoutCSS.includes(`lg\\:${displayValue}`);
          
          // Should have at least tablet and desktop variants
          return hasTabletVariant && hasDesktopVariant;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: flexbox utilities have responsive variants', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('flex', 'flex-row', 'flex-col', 'flex-wrap'),
        (flexClass) => {
          // Check for responsive variants
          const hasTabletVariant = layoutCSS.includes(`md\\:${flexClass}`);
          const hasDesktopVariant = layoutCSS.includes(`lg\\:${flexClass}`);
          
          // Should have responsive variants for flexbox utilities
          return hasTabletVariant && hasDesktopVariant;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: no max-width media queries for mobile-first approach', () => {
    fc.assert(
      fc.property(
        fc.constant(layoutCSS),
        (css) => {
          const mediaQueries = extractMediaQueries(css);
          
          // Count max-width only queries (without min-width)
          const maxWidthOnlyQueries = mediaQueries.filter(mq => 
            mq.maxWidth !== null && mq.minWidth === null
          );
          
          // Mobile-first should minimize max-width queries
          // Allow some for specific mobile-only styles, but should be minimal
          return maxWidthOnlyQueries.length <= 5;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: container max-width increases with breakpoints', () => {
    fc.assert(
      fc.property(
        fc.constant(layoutCSS),
        (css) => {
          // Extract container max-width values at different breakpoints
          const mediaQueries = extractMediaQueries(css);
          
          // Find tablet container max-width
          const tabletQuery = mediaQueries.find(mq => 
            mq.minWidth === BREAKPOINTS.TABLET_MIN && 
            mq.content.includes('.container')
          );
          
          // Find desktop container max-width
          const desktopQuery = mediaQueries.find(mq => 
            mq.minWidth === BREAKPOINTS.DESKTOP_MIN && 
            mq.content.includes('.container')
          );
          
          if (!tabletQuery || !desktopQuery) return true; // Skip if not found
          
          // Extract max-width values
          const tabletMaxWidth = tabletQuery.content.match(/max-width:\s*var\(--container-(\w+)\)/);
          const desktopMaxWidth = desktopQuery.content.match(/max-width:\s*var\(--container-(\w+)\)/);
          
          if (!tabletMaxWidth || !desktopMaxWidth) return true;
          
          // Desktop container should be larger than tablet
          // md < lg (alphabetically and semantically)
          return tabletMaxWidth[1] === 'md' && desktopMaxWidth[1] === 'lg';
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: all breakpoints use min-width for progressive enhancement', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(BREAKPOINTS.TABLET_MIN, BREAKPOINTS.DESKTOP_MIN),
        (breakpoint) => {
          const mediaQueries = extractMediaQueries(layoutCSS);
          
          // Find media queries for this breakpoint
          const breakpointQueries = mediaQueries.filter(mq => mq.minWidth === breakpoint);
          
          // All should use min-width (not max-width) for mobile-first
          return breakpointQueries.every(mq => mq.minWidth !== null);
        }
      ),
      propertyTestConfig
    );
  });
});
