/**
 * Property-Based Tests for Image Handling
 * Feature: portfolio-website
 * Task 16.3: Write property tests for image handling
 *
 * Validates:
 * - Property 14: Image Lazy Loading
 * - Property 15: Image Optimization
 */

const fc = require('fast-check');
const fs = require('fs');
const path = require('path');

const propertyTestConfig = {
  numRuns: 100,
  verbose: true
};

describe('Property 14: Image Lazy Loading', () => {
  test('property: all images are configured for lazy loading', () => {
    const indexHTML = fs.readFileSync(path.join(__dirname, '../../index.html'), 'utf-8');
    document.body.innerHTML = indexHTML;

    const images = Array.from(document.querySelectorAll('img'));
    expect(images.length).toBeGreaterThan(0);

    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: images.length - 1 }),
        (index) => {
          const image = images[index];
          const loadingMode = image.getAttribute('loading');
          return loadingMode === 'lazy';
        }
      ),
      propertyTestConfig
    );
  });
});

describe('Property 15: Image Optimization', () => {
  test('property: each image includes optimization hints and stable dimensions', () => {
    const indexHTML = fs.readFileSync(path.join(__dirname, '../../index.html'), 'utf-8');
    document.body.innerHTML = indexHTML;

    const images = Array.from(document.querySelectorAll('img'));
    expect(images.length).toBeGreaterThan(0);

    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: images.length - 1 }),
        (index) => {
          const image = images[index];
          const hasDeferredSource = Boolean(image.getAttribute('src') || image.getAttribute('data-src'));
          const hasAsyncDecode = image.getAttribute('decoding') === 'async';
          const width = Number(image.getAttribute('width'));
          const height = Number(image.getAttribute('height'));
          const hasFixedDimensions = Number.isFinite(width) && width > 0 && Number.isFinite(height) && height > 0;

          return hasDeferredSource && hasAsyncDecode && hasFixedDimensions;
        }
      ),
      propertyTestConfig
    );
  });
});
