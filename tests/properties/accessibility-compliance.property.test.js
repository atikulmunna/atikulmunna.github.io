/**
 * Property-Based Tests for Accessibility Compliance
 * Feature: portfolio-website
 * Task 17.4: Write property tests for accessibility
 *
 * Validates:
 * - Property 26: Semantic HTML Elements
 * - Property 27: ARIA Labels on Interactive Elements
 * - Property 28: Keyboard Navigation Support
 * - Property 29: Image Alternative Text
 * - Property 30: Logical Focus Order
 * - Property 31: Visible Focus Indicators
 * - Property 32: Form Input Labels (if forms exist)
 */

const fc = require('fast-check');
const fs = require('fs');
const path = require('path');

const propertyTestConfig = {
  numRuns: 100,
  verbose: true
};

function loadHtml() {
  const indexHTML = fs.readFileSync(path.join(__dirname, '../../index.html'), 'utf-8');
  document.body.innerHTML = indexHTML;
}

function loadAllCss() {
  const cssFiles = ['base.css', 'layout.css', 'components.css', 'sections.css', 'glassmorphism.css'];
  return cssFiles
    .map((file) => fs.readFileSync(path.join(__dirname, `../../css/${file}`), 'utf-8'))
    .join('\n');
}

function hasAccessibleName(element) {
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel && ariaLabel.trim().length > 0) return true;

  const ariaLabelledBy = element.getAttribute('aria-labelledby');
  if (ariaLabelledBy && ariaLabelledBy.trim().length > 0) return true;

  const text = (element.textContent || '').trim();
  if (text.length > 0) return true;

  const childImgWithAlt = element.querySelector('img[alt]');
  return !!(childImgWithAlt && childImgWithAlt.getAttribute('alt')?.trim().length);
}

describe('Property 26: Semantic HTML Elements', () => {
  test('property: semantic layout elements are present', () => {
    loadHtml();

    expect(document.querySelector('nav')).toBeTruthy();
    expect(document.querySelector('main')).toBeTruthy();
    expect(document.querySelector('footer')).toBeTruthy();
    expect(document.querySelectorAll('section').length).toBeGreaterThan(0);
    expect(document.querySelectorAll('article').length).toBeGreaterThan(0);
  });
});

describe('Property 27: ARIA Labels on Interactive Elements', () => {
  test('property: interactive elements have accessible names', () => {
    loadHtml();

    const interactiveElements = Array.from(document.querySelectorAll('a[href], button, input, select, textarea'));
    expect(interactiveElements.length).toBeGreaterThan(0);

    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: interactiveElements.length - 1 }),
        (index) => hasAccessibleName(interactiveElements[index])
      ),
      propertyTestConfig
    );
  });
});

describe('Property 28: Keyboard Navigation Support', () => {
  test('property: focusable interactive elements do not use blocked tabindex', () => {
    loadHtml();

    const interactiveElements = Array.from(document.querySelectorAll('a[href], button, input, select, textarea'));
    expect(interactiveElements.length).toBeGreaterThan(0);

    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: interactiveElements.length - 1 }),
        (index) => {
          const tabindex = interactiveElements[index].getAttribute('tabindex');
          if (tabindex === null) return true;
          return Number(tabindex) >= 0;
        }
      ),
      propertyTestConfig
    );
  });
});

describe('Property 29: Image Alternative Text', () => {
  test('property: all meaningful images include alt text', () => {
    loadHtml();

    const images = Array.from(document.querySelectorAll('img'));
    expect(images.length).toBeGreaterThan(0);

    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: images.length - 1 }),
        (index) => images[index].hasAttribute('alt')
      ),
      propertyTestConfig
    );
  });
});

describe('Property 30: Logical Focus Order', () => {
  test('property: skip link is first focusable element and targets main content', () => {
    loadHtml();

    const firstFocusable = document.querySelector('a[href], button, input, select, textarea');
    expect(firstFocusable).toBeTruthy();
    expect(firstFocusable.classList.contains('skip-to-content')).toBe(true);
    expect(firstFocusable.getAttribute('href')).toBe('#main-content');
    expect(document.getElementById('main-content')).toBeTruthy();
  });
});

describe('Property 31: Visible Focus Indicators', () => {
  test('property: CSS defines visible focus styles for interactive elements', () => {
    const cssContent = loadAllCss();

    const hasFocusRule =
      /a:focus|a:focus-visible/.test(cssContent) &&
      /btn[^}]*:focus|btn[^}]*:focus-visible|\.btn:focus|\.btn:focus-visible/.test(cssContent) &&
      /outline:\s*[^;]+/.test(cssContent);

    expect(hasFocusRule).toBe(true);
  });
});

describe('Property 32: Form Input Labels', () => {
  test('property: form controls have associated labels when forms exist', () => {
    loadHtml();

    const controls = Array.from(document.querySelectorAll('form input:not([type="hidden"]), form textarea, form select'));
    if (controls.length === 0) {
      expect(controls.length).toBe(0);
      return;
    }

    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: controls.length - 1 }),
        (index) => {
          const control = controls[index];
          const id = control.getAttribute('id');
          const hasForLabel = id ? !!document.querySelector(`label[for="${id}"]`) : false;
          const hasAriaLabel = !!control.getAttribute('aria-label');
          const hasAriaLabelledBy = !!control.getAttribute('aria-labelledby');
          const wrappedByLabel = control.closest('label') !== null;
          return hasForLabel || hasAriaLabel || hasAriaLabelledBy || wrappedByLabel;
        }
      ),
      propertyTestConfig
    );
  });
});
