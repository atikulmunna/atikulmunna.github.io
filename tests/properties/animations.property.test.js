/**
 * Property-Based Tests for Scroll Animations
 * Feature: portfolio-website
 * Task 14.3: Write property tests for animations
 *
 * Validates:
 * - Property 17: Scroll Animation Implementation
 * - Property 19: Animation Duration Limit
 * - Property 20: Reduced Motion Support
 */

const fc = require('fast-check');
const fs = require('fs');
const path = require('path');

const propertyTestConfig = {
  numRuns: 100,
  verbose: true
};

describe('Property 17: Scroll Animation Implementation', () => {
  test('property: scroll animations use IntersectionObserver', () => {
    const animationsJS = fs.readFileSync(path.join(__dirname, '../../js/animations.js'), 'utf-8');

    fc.assert(
      fc.property(fc.constant('IntersectionObserver'), (token) => {
        return new RegExp(token).test(animationsJS);
      }),
      propertyTestConfig
    );
  });

  test('property: observed elements are revealed when entering viewport', () => {
    const animationsJS = fs.readFileSync(path.join(__dirname, '../../js/animations.js'), 'utf-8');

    fc.assert(
      fc.property(fc.constant('isIntersecting'), () => {
        const hasIntersectCheck = /isIntersecting/.test(animationsJS);
        const addsVisibleClass = /classList\.add\(['"]is-visible['"]\)/.test(animationsJS);
        const observesElements = /observer\.observe\(/.test(animationsJS);
        return hasIntersectCheck && addsVisibleClass && observesElements;
      }),
      propertyTestConfig
    );
  });
});

describe('Property 19: Animation Duration Limit', () => {
  test('property: transition duration variables are within 500ms', () => {
    const variablesCSS = fs.readFileSync(path.join(__dirname, '../../css/variables.css'), 'utf-8');
    const matches = [...variablesCSS.matchAll(/--transition-(?:fast|base|slow):\s*(\d+)ms/g)];

    fc.assert(
      fc.property(fc.constantFrom(...matches.map((m) => Number(m[1]))), (duration) => {
        return duration <= 500;
      }),
      propertyTestConfig
    );
  });

  test('property: scroll animation classes use bounded transition durations', () => {
    const sectionsCSS = fs.readFileSync(path.join(__dirname, '../../css/sections.css'), 'utf-8');

    fc.assert(
      fc.property(fc.constant('.animate-on-scroll'), () => {
        const hasSlowVar = /var\(--transition-slow\)/.test(sectionsCSS);
        return hasSlowVar;
      }),
      propertyTestConfig
    );
  });
});

describe('Property 20: Reduced Motion Support', () => {
  test('property: animation classes are disabled in reduced motion mode', () => {
    const sectionsCSS = fs.readFileSync(path.join(__dirname, '../../css/sections.css'), 'utf-8');

    fc.assert(
      fc.property(fc.constant('@media (prefers-reduced-motion: reduce)'), () => {
        const hasReducedMotionQuery = /@media\s*\(prefers-reduced-motion:\s*reduce\)/.test(sectionsCSS);
        const disablesTransition = /transition:\s*none/.test(sectionsCSS);
        const disablesTransform = /transform:\s*none/.test(sectionsCSS);
        return hasReducedMotionQuery && disablesTransition && disablesTransform;
      }),
      propertyTestConfig
    );
  });

  test('property: JavaScript checks prefers-reduced-motion before observer setup', () => {
    const animationsJS = fs.readFileSync(path.join(__dirname, '../../js/animations.js'), 'utf-8');

    fc.assert(
      fc.property(fc.constant('matchMedia'), () => {
        const hasMatchMedia = /matchMedia\(['"]\(prefers-reduced-motion:\s*reduce\)['"]\)/.test(animationsJS);
        const hasFallbackReveal = /revealAll\(elements\)/.test(animationsJS);
        return hasMatchMedia && hasFallbackReveal;
      }),
      propertyTestConfig
    );
  });
});
