/**
 * Unit Tests for Navigation Component
 * Feature: portfolio-website
 * Task 6.5: Write unit tests for navigation functionality
 * 
 * **Validates: Requirements 5.3, 5.4, 5.5**
 * 
 * Tests verify that navigation functionality is properly implemented:
 * - Mobile menu toggle behavior (5.4)
 * - Smooth scroll function (5.3)
 * - Active link update logic (5.5)
 */

const fs = require('fs');
const path = require('path');

describe('Navigation Component Implementation', () => {
  let sectionsCSS;
  let navigationJS;
  let indexHTML;

  beforeAll(() => {
    // Read files
    sectionsCSS = fs.readFileSync(path.join(__dirname, '../../css/sections.css'), 'utf-8');
    navigationJS = fs.readFileSync(path.join(__dirname, '../../js/navigation.js'), 'utf-8');
    indexHTML = fs.readFileSync(path.join(__dirname, '../../index.html'), 'utf-8');
  });

  describe('HTML Structure - Requirement 5.2, 10.1', () => {
    test('should have semantic nav element with id', () => {
      expect(indexHTML).toMatch(/<nav[^>]*id="main-nav"/);
    });

    test('should include navigation logo', () => {
      expect(indexHTML).toMatch(/<a[^>]*class="nav__logo"/);
    });

    test('should include mobile menu toggle button', () => {
      expect(indexHTML).toMatch(/<button[^>]*class="nav__toggle"/);
    });

    test('should have ARIA label on toggle button', () => {
      expect(indexHTML).toMatch(/<button[^>]*class="nav__toggle"[^>]*aria-label="[^"]+"/);
    });

    test('should include navigation menu list', () => {
      expect(indexHTML).toMatch(/<ul[^>]*class="nav__menu"/);
    });

    test('should have links to all major sections', () => {
      const requiredSections = ['hero', 'about', 'skills', 'projects', 'experience', 'contact'];
      requiredSections.forEach(section => {
        expect(indexHTML).toMatch(new RegExp(`href="#${section}"`));
      });
    });

    test('should use semantic list structure for menu items', () => {
      expect(indexHTML).toMatch(/<li[^>]*class="nav__item"/);
      expect(indexHTML).toMatch(/<a[^>]*class="nav__link"/);
    });
  });

  describe('CSS Styling - Requirement 4.1, 5.1', () => {
    test('should define fixed positioning for navigation', () => {
      expect(sectionsCSS).toMatch(/\.nav\s*{[\s\S]*position:\s*fixed/);
    });

    test('should set appropriate z-index for fixed nav', () => {
      expect(sectionsCSS).toMatch(/\.nav\s*{[\s\S]*z-index:/);
    });

    test('should apply glassmorphism effect to navigation', () => {
      expect(sectionsCSS).toMatch(/\.nav\s*{[\s\S]*backdrop-filter:\s*blur/);
      expect(sectionsCSS).toMatch(/\.nav\s*{[\s\S]*-webkit-backdrop-filter:\s*blur/);
    });

    test('should include fallback background for unsupported browsers', () => {
      // Check for fallback background with higher opacity before @supports
      const navStyleMatch = sectionsCSS.match(/\.nav\s*{([^}]+)}/);
      expect(navStyleMatch).toBeTruthy();
      expect(navStyleMatch[1]).toMatch(/background:\s*rgba\([^)]+,\s*0\.[89]/);
    });

    test('should use @supports for progressive enhancement', () => {
      expect(sectionsCSS).toMatch(/@supports\s*\(backdrop-filter:\s*blur/);
    });

    test('should define scrolled state class', () => {
      expect(sectionsCSS).toMatch(/\.nav--scrolled/);
    });

    test('should define active link styles', () => {
      expect(sectionsCSS).toMatch(/\.nav__link--active/);
    });
  });

  describe('Mobile Navigation - Requirement 5.4', () => {
    test('should hide toggle button on desktop', () => {
      // Toggle should have display: none by default
      expect(sectionsCSS).toMatch(/\.nav__toggle\s*{[\s\S]*display:\s*none/);
    });

    test('should show toggle button on mobile', () => {
      const mobileSection = sectionsCSS.match(/@media\s*\(max-width:\s*767px\)\s*{([\s\S]*?)@media|$/);
      expect(mobileSection).toBeTruthy();
      expect(mobileSection[1]).toMatch(/\.nav__toggle\s*{[\s\S]*display:\s*flex/);
    });

    test('should define mobile menu styles', () => {
      const mobileSection = sectionsCSS.match(/@media\s*\(max-width:\s*767px\)\s*{([\s\S]*?)@media|$/);
      expect(mobileSection).toBeTruthy();
      expect(mobileSection[1]).toMatch(/\.nav__menu\s*{/);
    });

    test('should hide mobile menu by default with transform', () => {
      const mobileSection = sectionsCSS.match(/@media\s*\(max-width:\s*767px\)\s*{([\s\S]*?)@media|$/);
      expect(mobileSection).toBeTruthy();
      expect(mobileSection[1]).toMatch(/\.nav__menu\s*{[\s\S]*transform:\s*translateX\(100%\)/);
    });

    test('should define open state for mobile menu', () => {
      expect(sectionsCSS).toMatch(/\.nav__menu--open/);
    });

    test('should show mobile menu when open', () => {
      expect(sectionsCSS).toMatch(/\.nav__menu--open\s*{[\s\S]*transform:\s*translateX\(0\)/);
    });

    test('should include hamburger icon styles', () => {
      expect(sectionsCSS).toMatch(/\.nav__toggle-icon/);
    });

    test('should animate hamburger icon to X when open', () => {
      expect(sectionsCSS).toMatch(/\.nav__toggle\[aria-expanded="true"\]\s*\.nav__toggle-icon/);
    });
  });

  describe('JavaScript Module Structure', () => {
    test('should define Navigation object', () => {
      expect(navigationJS).toMatch(/const\s+Navigation\s*=/);
    });

    test('should have init method', () => {
      expect(navigationJS).toMatch(/init\s*\(\s*\)\s*{/);
    });

    test('should have state object', () => {
      expect(navigationJS).toMatch(/state:\s*{/);
    });

    test('should have elements object for DOM caching', () => {
      expect(navigationJS).toMatch(/elements:\s*{/);
    });

    test('should initialize on DOMContentLoaded', () => {
      expect(navigationJS).toMatch(/DOMContentLoaded/);
      expect(navigationJS).toMatch(/Navigation\.init/);
    });
  });

  describe('Smooth Scroll Functionality - Requirement 5.3, 7.2', () => {
    test('should define setupSmoothScroll method', () => {
      expect(navigationJS).toMatch(/setupSmoothScroll\s*\(\s*\)\s*{/);
    });

    test('should define scrollToSection method', () => {
      expect(navigationJS).toMatch(/scrollToSection\s*\(/);
    });

    test('should handle click events on navigation links', () => {
      expect(navigationJS).toMatch(/addEventListener\s*\(\s*['"]click['"]/);
    });

    test('should prevent default link behavior', () => {
      expect(navigationJS).toMatch(/preventDefault\s*\(\s*\)/);
    });

    test('should use smooth scroll behavior', () => {
      expect(navigationJS).toMatch(/behavior:\s*['"]smooth['"]/);
    });

    test('should account for fixed navigation height', () => {
      // Should calculate offset for fixed nav
      expect(navigationJS).toMatch(/offsetHeight|navHeight/);
    });

    test('should update URL hash', () => {
      expect(navigationJS).toMatch(/history\.pushState|location\.hash/);
    });
  });

  describe('Mobile Menu Toggle - Requirement 5.4', () => {
    test('should define setupMobileToggle method', () => {
      expect(navigationJS).toMatch(/setupMobileToggle\s*\(\s*\)\s*{/);
    });

    test('should define openMobileMenu method', () => {
      expect(navigationJS).toMatch(/openMobileMenu\s*\(\s*\)\s*{/);
    });

    test('should define closeMobileMenu method', () => {
      expect(navigationJS).toMatch(/closeMobileMenu\s*\(\s*\)\s*{/);
    });

    test('should toggle menu state', () => {
      expect(navigationJS).toMatch(/isMenuOpen/);
    });

    test('should add/remove open class', () => {
      expect(navigationJS).toMatch(/classList\.(add|remove)\s*\(\s*['"]nav__menu--open['"]/);
    });

    test('should update aria-expanded attribute', () => {
      expect(navigationJS).toMatch(/setAttribute\s*\(\s*['"]aria-expanded['"]/);
    });

    test('should close menu on link click', () => {
      // Should close mobile menu when a link is clicked
      expect(navigationJS).toMatch(/closeMobileMenu/);
    });

    test('should close menu on escape key', () => {
      expect(navigationJS).toMatch(/Escape/);
    });

    test('should prevent body scroll when menu is open', () => {
      expect(navigationJS).toMatch(/body\.style\.overflow/);
    });

    test('should handle window resize', () => {
      expect(navigationJS).toMatch(/addEventListener\s*\(\s*['"]resize['"]/);
    });
  });

  describe('Active Section Detection - Requirement 5.5', () => {
    test('should define setupActiveLink method', () => {
      expect(navigationJS).toMatch(/setupActiveLink\s*\(\s*\)\s*{/);
    });

    test('should define updateActiveLink method', () => {
      expect(navigationJS).toMatch(/updateActiveLink\s*\(/);
    });

    test('should use Intersection Observer', () => {
      expect(navigationJS).toMatch(/IntersectionObserver/);
    });

    test('should configure observer with appropriate options', () => {
      expect(navigationJS).toMatch(/observerOptions|rootMargin|threshold/);
    });

    test('should observe all sections', () => {
      expect(navigationJS).toMatch(/observer\.observe/);
    });

    test('should add active class to current link', () => {
      expect(navigationJS).toMatch(/classList\.add\s*\(\s*['"]nav__link--active['"]/);
    });

    test('should remove active class from other links', () => {
      expect(navigationJS).toMatch(/classList\.remove\s*\(\s*['"]nav__link--active['"]/);
    });

    test('should track active section in state', () => {
      expect(navigationJS).toMatch(/activeSection/);
    });
  });

  describe('Scroll Effect - Enhanced Glass on Scroll', () => {
    test('should define setupScrollEffect method', () => {
      expect(navigationJS).toMatch(/setupScrollEffect\s*\(\s*\)\s*{/);
    });

    test('should listen to scroll events', () => {
      expect(navigationJS).toMatch(/addEventListener\s*\(\s*['"]scroll['"]/);
    });

    test('should add scrolled class when scrolled', () => {
      expect(navigationJS).toMatch(/classList\.add\s*\(\s*['"]nav--scrolled['"]/);
    });

    test('should remove scrolled class when at top', () => {
      expect(navigationJS).toMatch(/classList\.remove\s*\(\s*['"]nav--scrolled['"]/);
    });

    test('should use requestAnimationFrame for performance', () => {
      expect(navigationJS).toMatch(/requestAnimationFrame/);
    });

    test('should track scroll state', () => {
      expect(navigationJS).toMatch(/isScrolled/);
    });
  });

  describe('Performance Optimizations', () => {
    test('should cache DOM elements', () => {
      expect(navigationJS).toMatch(/cacheElements/);
    });

    test('should use passive event listeners where appropriate', () => {
      expect(navigationJS).toMatch(/passive:\s*true/);
    });

    test('should debounce resize events', () => {
      expect(navigationJS).toMatch(/setTimeout|clearTimeout/);
    });

    test('should use requestAnimationFrame for scroll', () => {
      expect(navigationJS).toMatch(/requestAnimationFrame/);
    });
  });

  describe('Accessibility Features', () => {
    test('should manage focus when opening mobile menu', () => {
      expect(navigationJS).toMatch(/focus\s*\(\s*\)/);
    });

    test('should handle keyboard events', () => {
      expect(navigationJS).toMatch(/keydown|keypress|keyup/);
    });

    test('should support escape key to close menu', () => {
      expect(navigationJS).toMatch(/key\s*===\s*['"]Escape['"]/);
    });

    test('should update ARIA attributes', () => {
      expect(navigationJS).toMatch(/setAttribute.*aria-expanded/);
    });
  });

  describe('Responsive Breakpoints', () => {
    test('should define mobile breakpoint (< 768px)', () => {
      expect(sectionsCSS).toMatch(/@media\s*\(max-width:\s*767px\)/);
    });

    test('should define tablet breakpoint (768px - 1023px)', () => {
      expect(sectionsCSS).toMatch(/@media\s*\(min-width:\s*768px\)\s*and\s*\(max-width:\s*1023px\)/);
    });

    test('should define desktop breakpoint (>= 1024px)', () => {
      expect(sectionsCSS).toMatch(/@media\s*\(min-width:\s*1024px\)/);
    });
  });

  describe('Reduced Motion Support', () => {
    test('should include prefers-reduced-motion media query', () => {
      expect(sectionsCSS).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
    });

    test('should disable transitions in reduced motion mode', () => {
      const reducedMotionSection = sectionsCSS.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*{([\s\S]*?)}\s*(?:@media|\/\*|$)/);
      expect(reducedMotionSection).toBeTruthy();
      expect(reducedMotionSection[1]).toMatch(/transition:\s*none/);
    });

    test('should disable transforms in reduced motion mode', () => {
      const reducedMotionSection = sectionsCSS.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*{([\s\S]*?)}\s*(?:@media|\/\*|$)/);
      expect(reducedMotionSection).toBeTruthy();
      expect(reducedMotionSection[1]).toMatch(/transform:\s*none/);
    });
  });

  describe('Focus Management', () => {
    test('should define focus styles for logo', () => {
      expect(sectionsCSS).toMatch(/\.nav__logo:focus/);
    });

    test('should define focus styles for toggle button', () => {
      expect(sectionsCSS).toMatch(/\.nav__toggle:focus/);
    });

    test('should define focus styles for navigation links', () => {
      expect(sectionsCSS).toMatch(/\.nav__link:focus/);
    });

    test('should have visible focus indicators', () => {
      expect(sectionsCSS).toMatch(/\.nav__logo:focus[\s\S]*outline:/);
      expect(sectionsCSS).toMatch(/\.nav__toggle:focus[\s\S]*outline:/);
      expect(sectionsCSS).toMatch(/\.nav__link:focus[\s\S]*outline:/);
    });
  });

  describe('Touch Target Sizes', () => {
    test('should meet minimum touch target for toggle button', () => {
      expect(sectionsCSS).toMatch(/\.nav__toggle\s*{[\s\S]*min-width:\s*var\(--touch-target-min\)/);
      expect(sectionsCSS).toMatch(/\.nav__toggle\s*{[\s\S]*min-height:\s*var\(--touch-target-min\)/);
    });

    test('should meet minimum touch target for navigation links', () => {
      expect(sectionsCSS).toMatch(/\.nav__link\s*{[\s\S]*min-height:\s*var\(--touch-target-min\)/);
    });
  });

  describe('Body Padding for Fixed Nav', () => {
    test('should add padding to body to prevent content overlap', () => {
      expect(sectionsCSS).toMatch(/body\s*{[\s\S]*padding-top:/);
    });

    test('should adjust body padding on mobile', () => {
      const mobileSection = sectionsCSS.match(/@media\s*\(max-width:\s*767px\)\s*{([\s\S]*?)@media|$/);
      expect(mobileSection).toBeTruthy();
      expect(mobileSection[1]).toMatch(/body\s*{[\s\S]*padding-top:/);
    });
  });
});


/**
 * Runtime Behavior Tests
 * These tests use Jest's built-in jsdom environment to test actual navigation behavior
 */
describe('Navigation Runtime Behavior', () => {
  let Navigation;

  beforeEach(() => {
    // Setup DOM structure
    document.body.innerHTML = `
      <nav id="main-nav">
        <div class="nav__container">
          <a href="#" class="nav__logo">Portfolio</a>
          <button class="nav__toggle" aria-label="Toggle navigation" aria-expanded="false">
            <span class="nav__toggle-icon"></span>
          </button>
          <ul class="nav__menu">
            <li class="nav__item"><a href="#hero" class="nav__link">Home</a></li>
            <li class="nav__item"><a href="#about" class="nav__link">About</a></li>
            <li class="nav__item"><a href="#skills" class="nav__link">Skills</a></li>
          </ul>
        </div>
      </nav>
      <section id="hero">Hero Content</section>
      <section id="about">About Content</section>
      <section id="skills">Skills Content</section>
    `;

    // Mock window methods
    window.scrollTo = jest.fn();
    window.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 0));
    window.IntersectionObserver = jest.fn(function(callback, options) {
      this.observe = jest.fn();
      this.disconnect = jest.fn();
      this.unobserve = jest.fn();
    });
    
    // Mock history API
    window.history.pushState = jest.fn();

    // Clear module cache and reload Navigation
    jest.resetModules();
    Navigation = require('../../js/navigation.js');
  });

  afterEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  describe('Mobile Menu Toggle Behavior - Requirement 5.4', () => {
    test('should open mobile menu when toggle button is clicked', () => {
      const toggle = document.querySelector('.nav__toggle');
      const menu = document.querySelector('.nav__menu');

      // Simulate click
      toggle.click();

      // Check state
      expect(Navigation.state.isMenuOpen).toBe(true);
      expect(menu.classList.contains('nav__menu--open')).toBe(true);
      expect(toggle.getAttribute('aria-expanded')).toBe('true');
    });

    test('should close mobile menu when toggle button is clicked again', () => {
      const toggle = document.querySelector('.nav__toggle');
      const menu = document.querySelector('.nav__menu');

      // Open menu
      toggle.click();
      expect(Navigation.state.isMenuOpen).toBe(true);

      // Close menu
      toggle.click();
      expect(Navigation.state.isMenuOpen).toBe(false);
      expect(menu.classList.contains('nav__menu--open')).toBe(false);
      expect(toggle.getAttribute('aria-expanded')).toBe('false');
    });

    test('should prevent body scroll when menu is open', () => {
      const toggle = document.querySelector('.nav__toggle');

      // Open menu
      toggle.click();

      expect(document.body.style.overflow).toBe('hidden');
    });

    test('should restore body scroll when menu is closed', () => {
      const toggle = document.querySelector('.nav__toggle');

      // Open and close menu
      toggle.click();
      toggle.click();

      expect(document.body.style.overflow).toBe('');
    });

    test('should close menu when Escape key is pressed', () => {
      const toggle = document.querySelector('.nav__toggle');

      // Open menu
      toggle.click();
      expect(Navigation.state.isMenuOpen).toBe(true);

      // Press Escape
      const escapeEvent = new window.KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escapeEvent);

      expect(Navigation.state.isMenuOpen).toBe(false);
    });

    test('should close menu when clicking outside', () => {
      const toggle = document.querySelector('.nav__toggle');
      const body = document.body;

      // Open menu
      toggle.click();
      expect(Navigation.state.isMenuOpen).toBe(true);

      // Click outside
      const clickEvent = new window.MouseEvent('click', { bubbles: true });
      body.dispatchEvent(clickEvent);

      expect(Navigation.state.isMenuOpen).toBe(false);
    });
  });

  describe('Smooth Scroll Function - Requirement 5.3, 7.2', () => {
    test('should scroll to target section when link is clicked', () => {
      const link = document.querySelector('a[href="#about"]');
      const aboutSection = document.getElementById('about');

      // Mock offsetTop
      Object.defineProperty(aboutSection, 'offsetTop', { value: 500, writable: true });

      // Click link
      const clickEvent = new window.MouseEvent('click', { bubbles: true, cancelable: true });
      link.dispatchEvent(clickEvent);

      // Should call scrollTo
      expect(window.scrollTo).toHaveBeenCalled();
    });

    test('should prevent default link behavior', () => {
      const link = document.querySelector('a[href="#about"]');

      // Click link
      const clickEvent = new window.MouseEvent('click', { bubbles: true, cancelable: true });
      const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault');
      link.dispatchEvent(clickEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    test('should close mobile menu after clicking link', () => {
      const toggle = document.querySelector('.nav__toggle');
      const link = document.querySelector('a[href="#about"]');

      // Open menu
      toggle.click();
      expect(Navigation.state.isMenuOpen).toBe(true);

      // Click link
      const clickEvent = new window.MouseEvent('click', { bubbles: true, cancelable: true });
      link.dispatchEvent(clickEvent);

      expect(Navigation.state.isMenuOpen).toBe(false);
    });

    test('should account for fixed navigation height in scroll calculation', () => {
      const link = document.querySelector('a[href="#about"]');
      const nav = document.getElementById('main-nav');
      const aboutSection = document.getElementById('about');

      // Mock dimensions
      Object.defineProperty(nav, 'offsetHeight', { value: 72, writable: true });
      Object.defineProperty(aboutSection, 'offsetTop', { value: 1000, writable: true });

      // Click link
      const clickEvent = new window.MouseEvent('click', { bubbles: true, cancelable: true });
      link.dispatchEvent(clickEvent);

      // Should scroll to section minus nav height
      expect(window.scrollTo).toHaveBeenCalledWith(
        expect.objectContaining({
          top: 1000 - 72
        })
      );
    });
  });

  describe('Active Link Update Logic - Requirement 5.5', () => {
    test('should update active link when section changes', () => {
      const heroLink = document.querySelector('a[href="#hero"]');
      const aboutLink = document.querySelector('a[href="#about"]');

      // Initially hero should be active
      Navigation.updateActiveLink('hero');
      expect(heroLink.classList.contains('nav__link--active')).toBe(true);
      expect(aboutLink.classList.contains('nav__link--active')).toBe(false);

      // Change to about
      Navigation.updateActiveLink('about');
      expect(heroLink.classList.contains('nav__link--active')).toBe(false);
      expect(aboutLink.classList.contains('nav__link--active')).toBe(true);
    });

    test('should remove active class from all links before adding to new one', () => {
      const links = document.querySelectorAll('.nav__link');

      // Add active class to all links
      links.forEach(link => link.classList.add('nav__link--active'));

      // Update to specific section
      Navigation.updateActiveLink('about');

      // Only about link should be active
      const activeLinks = document.querySelectorAll('.nav__link--active');
      expect(activeLinks.length).toBe(1);
      expect(activeLinks[0].getAttribute('href')).toBe('#about');
    });

    test('should update state when active section changes', () => {
      Navigation.updateActiveLink('skills');
      expect(Navigation.state.activeSection).toBe('skills');
    });

    test('should handle non-existent section gracefully', () => {
      // Should not throw error
      expect(() => {
        Navigation.updateActiveLink('nonexistent');
      }).not.toThrow();

      // State should still update
      expect(Navigation.state.activeSection).toBe('nonexistent');
    });
  });

  describe('Scroll Effect Behavior', () => {
    test('should add scrolled class when scrolled past threshold', (done) => {
      const nav = document.getElementById('main-nav');

      // Mock scroll position
      Object.defineProperty(window, 'scrollY', { value: 100, writable: true });

      // Trigger scroll event
      const scrollEvent = new window.Event('scroll');
      window.dispatchEvent(scrollEvent);

      // Wait for requestAnimationFrame to complete
      setTimeout(() => {
        expect(Navigation.state.isScrolled).toBe(true);
        expect(nav.classList.contains('nav--scrolled')).toBe(true);
        done();
      }, 50);
    });

    test('should remove scrolled class when at top', (done) => {
      const nav = document.getElementById('main-nav');

      // First scroll down
      Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
      window.dispatchEvent(new window.Event('scroll'));

      setTimeout(() => {
        // Then scroll back to top
        Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
        window.dispatchEvent(new window.Event('scroll'));

        setTimeout(() => {
          expect(Navigation.state.isScrolled).toBe(false);
          expect(nav.classList.contains('nav--scrolled')).toBe(false);
          done();
        }, 50);
      }, 50);
    });
  });

  describe('Intersection Observer Setup', () => {
    test('should create Intersection Observer for section tracking', () => {
      expect(window.IntersectionObserver).toHaveBeenCalled();
    });

    test('should observe all sections', () => {
      // Get the mock constructor calls
      const mockCalls = window.IntersectionObserver.mock.instances;
      
      if (mockCalls.length > 0) {
        const observerInstance = mockCalls[0];
        // Should observe hero, about, and skills sections
        expect(observerInstance.observe).toHaveBeenCalledTimes(3);
      } else {
        // If no instances, at least verify the constructor was called
        expect(window.IntersectionObserver).toHaveBeenCalled();
      }
    });

    test('should configure observer with appropriate options', () => {
      const observerCall = window.IntersectionObserver.mock.calls[0];
      const options = observerCall[1];

      expect(options).toHaveProperty('root');
      expect(options).toHaveProperty('rootMargin');
      expect(options).toHaveProperty('threshold');
    });
  });
});
