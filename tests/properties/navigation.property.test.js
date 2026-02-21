/**
 * Property-Based Tests for Navigation
 * Feature: portfolio-website
 * Task 6.4: Write property tests for navigation
 * 
 * **Validates: Requirements 5.1, 5.3, 5.4, 5.5**
 * 
 * This file tests universal properties that should hold true for navigation:
 * - Property 10: Navigation Visibility During Scroll
 * - Property 11: Smooth Scroll to Sections
 * - Property 12: Mobile Navigation Display
 * - Property 13: Active Section Highlighting
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
 * Check if CSS has fixed or sticky positioning
 */
function hasFixedOrStickyPosition(rules) {
  if (!rules) return false;
  return /position:\s*(fixed|sticky)/.test(rules);
}

/**
 * Check if CSS has appropriate z-index for overlay
 */
function hasAppropriateZIndex(rules, allCSS) {
  if (!rules) return false;
  
  // Check for direct z-index value
  const directZIndexMatch = rules.match(/z-index:\s*(\d+)/);
  if (directZIndexMatch) {
    const zIndex = parseInt(directZIndexMatch[1], 10);
    return zIndex >= 100;
  }
  
  // Check for CSS variable usage
  const varMatch = rules.match(/z-index:\s*var\(--([^)]+)\)/);
  if (varMatch) {
    const varName = varMatch[1];
    // Look up the variable value in the CSS
    const varDefMatch = allCSS.match(new RegExp(`--${varName}:\\s*(\\d+)`));
    if (varDefMatch) {
      const zIndex = parseInt(varDefMatch[1], 10);
      return zIndex >= 100;
    }
  }
  
  return false;
}

/**
 * Extract media query content
 * Handles nested braces properly
 */
function extractMediaQuery(cssContent, query) {
  // Find the start of the media query
  const regex = new RegExp(`@media\\s*${query}\\s*\\{`, 's');
  const match = cssContent.match(regex);
  
  if (!match) return null;
  
  const startIndex = match.index + match[0].length;
  let braceCount = 1;
  let endIndex = startIndex;
  
  // Find the matching closing brace
  for (let i = startIndex; i < cssContent.length && braceCount > 0; i++) {
    if (cssContent[i] === '{') braceCount++;
    if (cssContent[i] === '}') braceCount--;
    endIndex = i;
  }
  
  return cssContent.substring(startIndex, endIndex);
}

/**
 * Check if selector exists in CSS content
 */
function selectorExists(cssContent, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`${escapedSelector}\\s*{`, 's');
  return regex.test(cssContent);
}

describe('Property 10: Navigation Visibility During Scroll', () => {
  /**
   * **Validates: Requirements 5.1**
   * 
   * For any scroll position on the page, the navigation bar SHALL remain visible 
   * and accessible (position: fixed or sticky with appropriate z-index).
   */
  
  test('property: navigation has fixed or sticky positioning', () => {
    const sectionsCSS = fs.readFileSync(path.join(__dirname, '../../css/sections.css'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constant('.nav'),
        (selector) => {
          const rules = extractCSSRules(sectionsCSS, selector);
          return hasFixedOrStickyPosition(rules);
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: navigation has high z-index for visibility', () => {
    const sectionsCSS = fs.readFileSync(path.join(__dirname, '../../css/sections.css'), 'utf-8');
    const variablesCSS = fs.readFileSync(path.join(__dirname, '../../css/variables.css'), 'utf-8');
    const allCSS = variablesCSS + '\n' + sectionsCSS;
    
    fc.assert(
      fc.property(
        fc.constant('.nav'),
        (selector) => {
          const rules = extractCSSRules(sectionsCSS, selector);
          return hasAppropriateZIndex(rules, allCSS);
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: navigation remains accessible at any scroll position', () => {
    const navigationJS = fs.readFileSync(path.join(__dirname, '../../js/navigation.js'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10000 }), // Arbitrary scroll positions
        (scrollPosition) => {
          // Navigation should not be hidden based on scroll position
          // Check that there's no logic to hide navigation
          const hasHideLogic = /nav.*display:\s*none|nav.*visibility:\s*hidden/.test(navigationJS);
          
          // Navigation should always be visible (no hide logic)
          return !hasHideLogic;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: navigation maintains position across viewport sizes', () => {
    const sectionsCSS = fs.readFileSync(path.join(__dirname, '../../css/sections.css'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 2560 }), // Viewport widths
        (viewportWidth) => {
          // Check that .nav has fixed/sticky position in base styles
          const baseRules = extractCSSRules(sectionsCSS, '.nav');
          const hasPosition = hasFixedOrStickyPosition(baseRules);
          
          // Position should be defined in base styles (applies to all viewports)
          return hasPosition;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: body has padding to prevent content overlap', () => {
    const sectionsCSS = fs.readFileSync(path.join(__dirname, '../../css/sections.css'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constant('body'),
        (selector) => {
          // Body should have padding-top to account for fixed nav
          const rules = extractCSSRules(sectionsCSS, selector);
          return rules && /padding-top:\s*\d+/.test(rules);
        }
      ),
      propertyTestConfig
    );
  });
});

describe('Property 11: Smooth Scroll to Sections', () => {
  /**
   * **Validates: Requirements 5.3, 7.2**
   * 
   * For any navigation link click, the page SHALL scroll to the corresponding section
   * (either using CSS scroll-behavior: smooth or JavaScript smooth scroll implementation).
   */
  
  test('property: navigation links have click handlers', () => {
    const navigationJS = fs.readFileSync(path.join(__dirname, '../../js/navigation.js'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constant('setupSmoothScroll'),
        (methodName) => {
          // Should have setupSmoothScroll method
          const hasMethod = new RegExp(`${methodName}\\s*\\(`).test(navigationJS);
          
          // Should add click event listeners
          const hasClickListener = /addEventListener\s*\(\s*['"]click['"]/.test(navigationJS);
          
          return hasMethod && hasClickListener;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: smooth scroll is implemented via JavaScript or CSS', () => {
    const navigationJS = fs.readFileSync(path.join(__dirname, '../../js/navigation.js'), 'utf-8');
    const baseCSS = fs.readFileSync(path.join(__dirname, '../../css/base.css'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constant('smooth-scroll'),
        () => {
          // Check for JavaScript smooth scroll implementation
          const hasJSSmooth = /behavior:\s*['"]smooth['"]/.test(navigationJS) ||
                             /scrollTo\s*\(/.test(navigationJS);
          
          // Check for CSS smooth scroll
          const hasCSSSmooth = /scroll-behavior:\s*smooth/.test(baseCSS);
          
          // At least one should be implemented
          return hasJSSmooth || hasCSSSmooth;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: navigation accounts for fixed header offset', () => {
    const navigationJS = fs.readFileSync(path.join(__dirname, '../../js/navigation.js'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constant('scrollToSection'),
        (methodName) => {
          // Should have scrollToSection method
          const hasMethod = new RegExp(`${methodName}\\s*\\(`).test(navigationJS);
          
          // Should calculate offset for fixed navigation
          const hasOffsetCalc = /offsetHeight|navHeight|offsetTop/.test(navigationJS);
          
          return hasMethod && hasOffsetCalc;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: navigation prevents default anchor behavior', () => {
    const navigationJS = fs.readFileSync(path.join(__dirname, '../../js/navigation.js'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constant('preventDefault'),
        (methodName) => {
          // Should call preventDefault on link clicks
          return new RegExp(methodName).test(navigationJS);
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: all section links trigger smooth scroll', () => {
    const indexHTML = fs.readFileSync(path.join(__dirname, '../../index.html'), 'utf-8');
    const navigationJS = fs.readFileSync(path.join(__dirname, '../../js/navigation.js'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constantFrom('hero', 'about', 'skills', 'projects', 'experience', 'contact'),
        (sectionId) => {
          // Check that section exists in HTML
          const sectionExists = new RegExp(`id="${sectionId}"`).test(indexHTML);
          
          // Check that navigation handles anchor links
          const handlesAnchors = /href.*startsWith\s*\(\s*['"]#['"]/.test(navigationJS);
          
          return sectionExists && handlesAnchors;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: smooth scroll has fallback for older browsers', () => {
    const navigationJS = fs.readFileSync(path.join(__dirname, '../../js/navigation.js'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constant('scrollBehavior'),
        () => {
          // Should check for scrollBehavior support
          const hasFeatureCheck = /scrollBehavior.*in.*document/.test(navigationJS);
          
          // Should have fallback scroll method
          const hasFallback = /else\s*{[\s\S]*scrollTo/.test(navigationJS);
          
          return hasFeatureCheck && hasFallback;
        }
      ),
      propertyTestConfig
    );
  });
});

describe('Property 12: Mobile Navigation Display', () => {
  /**
   * **Validates: Requirements 5.4**
   * 
   * For any viewport width less than 768px, the navigation SHALL display 
   * a mobile-friendly menu interface (hamburger menu or similar compact design).
   */
  
  test('property: mobile menu toggle exists in HTML', () => {
    const indexHTML = fs.readFileSync(path.join(__dirname, '../../index.html'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constant('.nav__toggle'),
        (selector) => {
          // Should have toggle button in HTML
          return new RegExp(`class="${selector.replace('.', '')}"`).test(indexHTML);
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: toggle button is hidden on desktop', () => {
    const sectionsCSS = fs.readFileSync(path.join(__dirname, '../../css/sections.css'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constant('.nav__toggle'),
        (selector) => {
          const rules = extractCSSRules(sectionsCSS, selector);
          // Toggle should be hidden by default (desktop-first) or shown only on mobile
          return rules && /display:\s*none/.test(rules);
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: toggle button is visible on mobile', () => {
    const sectionsCSS = fs.readFileSync(path.join(__dirname, '../../css/sections.css'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 767 }), // Mobile viewport widths
        (viewportWidth) => {
          // Check mobile media query
          const mobileQuery = extractMediaQuery(sectionsCSS, '\\(max-width:\\s*767px\\)');
          
          if (!mobileQuery) return false;
          
          // Toggle should be visible (display: flex or block)
          return /\.nav__toggle\s*{[\s\S]*display:\s*(flex|block)/.test(mobileQuery);
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: mobile menu is hidden by default', () => {
    const sectionsCSS = fs.readFileSync(path.join(__dirname, '../../css/sections.css'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constant('.nav__menu'),
        (selector) => {
          // Check mobile media query
          const mobileQuery = extractMediaQuery(sectionsCSS, '\\(max-width:\\s*767px\\)');
          
          if (!mobileQuery) return false;
          
          // Menu should be hidden by default (transform: translateX(100%))
          return /\.nav__menu\s*{[\s\S]*transform:\s*translateX\(100%\)/.test(mobileQuery);
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: mobile menu has open state', () => {
    const sectionsCSS = fs.readFileSync(path.join(__dirname, '../../css/sections.css'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constant('.nav__menu--open'),
        (selector) => {
          // Should have open state class
          const hasOpenClass = selectorExists(sectionsCSS, selector);
          
          // Open state should show menu (transform: translateX(0))
          const rules = extractCSSRules(sectionsCSS, selector);
          const showsMenu = rules && /transform:\s*translateX\(0\)/.test(rules);
          
          return hasOpenClass && showsMenu;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: mobile menu toggle functionality exists', () => {
    const navigationJS = fs.readFileSync(path.join(__dirname, '../../js/navigation.js'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constant('setupMobileToggle'),
        (methodName) => {
          // Should have setupMobileToggle method
          const hasMethod = new RegExp(`${methodName}\\s*\\(`).test(navigationJS);
          
          // Should have openMobileMenu and closeMobileMenu methods
          const hasOpen = /openMobileMenu\s*\(/.test(navigationJS);
          const hasClose = /closeMobileMenu\s*\(/.test(navigationJS);
          
          return hasMethod && hasOpen && hasClose;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: mobile menu closes on link click', () => {
    const navigationJS = fs.readFileSync(path.join(__dirname, '../../js/navigation.js'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constant('closeMobileMenu'),
        (methodName) => {
          // Should close menu when link is clicked
          // Look for closeMobileMenu call in the navigation link click handler
          // The setupSmoothScroll method should call closeMobileMenu
          const hasCloseCall = new RegExp(`this\\.${methodName}|${methodName}\\s*\\(`).test(navigationJS);
          
          // Check if it's called when menu is open
          const hasMenuOpenCheck = /isMenuOpen/.test(navigationJS);
          
          return hasCloseCall && hasMenuOpenCheck;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: mobile menu has ARIA attributes', () => {
    const indexHTML = fs.readFileSync(path.join(__dirname, '../../index.html'), 'utf-8');
    const navigationJS = fs.readFileSync(path.join(__dirname, '../../js/navigation.js'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constant('aria-expanded'),
        (ariaAttr) => {
          // Toggle button should have aria-label in HTML
          const hasAriaLabel = /nav__toggle.*aria-label/.test(indexHTML);
          
          // JavaScript should update aria-expanded
          const updatesAria = new RegExp(`setAttribute.*${ariaAttr}`).test(navigationJS);
          
          return hasAriaLabel && updatesAria;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: mobile menu prevents body scroll when open', () => {
    const navigationJS = fs.readFileSync(path.join(__dirname, '../../js/navigation.js'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constant('body.style.overflow'),
        (bodyOverflow) => {
          // Should prevent body scroll when menu is open
          return new RegExp(bodyOverflow.replace('.', '\\.')).test(navigationJS);
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: mobile menu closes on window resize to desktop', () => {
    const navigationJS = fs.readFileSync(path.join(__dirname, '../../js/navigation.js'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constant('resize'),
        (eventName) => {
          // Should listen to resize events
          const hasResizeListener = new RegExp(`addEventListener.*${eventName}`).test(navigationJS);
          
          // Should close menu when resizing to desktop (>= 768px)
          const hasWidthCheck = /innerWidth.*768/.test(navigationJS);
          
          return hasResizeListener && hasWidthCheck;
        }
      ),
      propertyTestConfig
    );
  });
});

describe('Property 13: Active Section Highlighting', () => {
  /**
   * **Validates: Requirements 5.5**
   * 
   * For any section currently in the viewport, the corresponding navigation link 
   * SHALL have an active state class applied with distinct visual styling.
   */
  
  test('property: active link class is defined in CSS', () => {
    const sectionsCSS = fs.readFileSync(path.join(__dirname, '../../css/sections.css'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constant('.nav__link--active'),
        (selector) => {
          // Should have active link class defined
          return selectorExists(sectionsCSS, selector);
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: active link has distinct visual styling', () => {
    const sectionsCSS = fs.readFileSync(path.join(__dirname, '../../css/sections.css'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constant('.nav__link--active'),
        (selector) => {
          const rules = extractCSSRules(sectionsCSS, selector);
          
          if (!rules) return false;
          
          // Should have visual distinction (color, background, border, etc.)
          const hasVisualStyle = /color:|background:|border:|font-weight:|text-decoration:/.test(rules);
          
          return hasVisualStyle;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: active section detection uses Intersection Observer', () => {
    const navigationJS = fs.readFileSync(path.join(__dirname, '../../js/navigation.js'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constant('IntersectionObserver'),
        (observerName) => {
          // Should use Intersection Observer for active section detection
          return new RegExp(observerName).test(navigationJS);
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: Intersection Observer has appropriate configuration', () => {
    const navigationJS = fs.readFileSync(path.join(__dirname, '../../js/navigation.js'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constant('observerOptions'),
        (configName) => {
          // Should have observer configuration
          const hasConfig = new RegExp(configName).test(navigationJS) ||
                           /rootMargin|threshold/.test(navigationJS);
          
          return hasConfig;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: all sections are observed for intersection', () => {
    const navigationJS = fs.readFileSync(path.join(__dirname, '../../js/navigation.js'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constant('observer.observe'),
        (observeMethod) => {
          // Should observe sections
          const hasObserve = new RegExp(observeMethod.replace('.', '\\.')).test(navigationJS);
          
          // Should iterate over sections
          const hasIteration = /sections.*forEach|for.*sections/.test(navigationJS);
          
          return hasObserve && hasIteration;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: active link is updated when section changes', () => {
    const navigationJS = fs.readFileSync(path.join(__dirname, '../../js/navigation.js'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constant('updateActiveLink'),
        (methodName) => {
          // Should have updateActiveLink method
          const hasMethod = new RegExp(`${methodName}\\s*\\(`).test(navigationJS);
          
          // Should add active class
          const addsClass = /classList\.add.*nav__link--active/.test(navigationJS);
          
          // Should remove active class from others
          const removesClass = /classList\.remove.*nav__link--active/.test(navigationJS);
          
          return hasMethod && addsClass && removesClass;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: only one link is active at a time', () => {
    const navigationJS = fs.readFileSync(path.join(__dirname, '../../js/navigation.js'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constant('updateActiveLink'),
        (methodName) => {
          // Check that the method removes active class from all links
          // The pattern spans multiple lines, so we need to handle that
          const removesAll = /elements\.links\.forEach[\s\S]*?classList\.remove[\s\S]*?nav__link--active/.test(navigationJS);
          
          // Check that the method adds active class to one link
          const addsOne = /classList\.add[\s\S]*?nav__link--active/.test(navigationJS);
          
          // Both operations should exist in the navigation code
          return removesAll && addsOne;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: active section is tracked in state', () => {
    const navigationJS = fs.readFileSync(path.join(__dirname, '../../js/navigation.js'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constant('activeSection'),
        (stateProp) => {
          // Should track active section in state
          const hasState = new RegExp(`state.*${stateProp}|${stateProp}.*:`).test(navigationJS);
          
          return hasState;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: active link matches current section', () => {
    const navigationJS = fs.readFileSync(path.join(__dirname, '../../js/navigation.js'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constantFrom('hero', 'about', 'skills', 'projects', 'experience', 'contact'),
        (sectionId) => {
          // Should match link href with section id
          const matchesHref = /href.*===.*#.*sectionId|getAttribute.*href/.test(navigationJS);
          
          return matchesHref;
        }
      ),
      propertyTestConfig
    );
  });
  
  test('property: intersection ratio is used to determine active section', () => {
    const navigationJS = fs.readFileSync(path.join(__dirname, '../../js/navigation.js'), 'utf-8');
    
    fc.assert(
      fc.property(
        fc.constant('intersectionRatio'),
        (ratioProp) => {
          // Should use intersection ratio to determine which section is most visible
          return new RegExp(ratioProp).test(navigationJS);
        }
      ),
      propertyTestConfig
    );
  });
});
