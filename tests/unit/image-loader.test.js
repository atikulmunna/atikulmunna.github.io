/**
 * Unit Tests for ImageLoader Module
 * Tests lazy-loading fallback and image error handling
 */

describe('ImageLoader Module', () => {
  let ImageLoader;
  let originalIntersectionObserver;
  let originalHTMLImageElement;

  beforeEach(() => {
    jest.resetModules();

    originalIntersectionObserver = global.IntersectionObserver;
    originalHTMLImageElement = global.HTMLImageElement;

    document.body.innerHTML = '';
    ImageLoader = require('../../js/image-loader.js');
  });

  afterEach(() => {
    global.IntersectionObserver = originalIntersectionObserver;
    global.HTMLImageElement = originalHTMLImageElement;
  });

  test('should cache and initialize lazy images', () => {
    document.body.innerHTML = `
      <img src="assets/images/a.png" loading="lazy" alt="A" width="100" height="100">
      <img src="assets/images/b.png" loading="lazy" alt="B" width="100" height="100">
    `;

    ImageLoader.init();

    expect(ImageLoader.elements.images).toHaveLength(2);
  });

  test('should apply placeholder when image fails to load', () => {
    document.body.innerHTML = `
      <img src="assets/images/missing.png" loading="lazy" alt="" width="100" height="100">
    `;

    ImageLoader.init();

    const image = document.querySelector('img');
    image.dispatchEvent(new Event('error'));

    expect(image.classList.contains('image-fallback')).toBe(true);
    expect(image.getAttribute('src')).toContain('data:image/svg+xml');
    expect(image.getAttribute('alt')).toBe('Image unavailable');
  });

  test('should use IntersectionObserver fallback when native lazy-loading is unavailable', () => {
    document.body.innerHTML = `
      <img src="assets/images/placeholder.png" data-src="assets/images/real.png" loading="lazy" alt="Deferred" width="100" height="100">
    `;

    const observeMock = jest.fn();
    const unobserveMock = jest.fn();
    let observerCallback = null;

    global.IntersectionObserver = jest.fn((callback) => {
      observerCallback = callback;
      return {
        observe: observeMock,
        unobserve: unobserveMock
      };
    });

    global.HTMLImageElement = function MockImageElement() {};
    global.HTMLImageElement.prototype = {};

    ImageLoader.init();

    const image = document.querySelector('img');
    expect(global.IntersectionObserver).toHaveBeenCalled();
    expect(observeMock).toHaveBeenCalledWith(image);

    observerCallback([{ isIntersecting: true, target: image }], { unobserve: unobserveMock });

    expect(image.getAttribute('src')).toBe('assets/images/real.png');
    expect(image.dataset.src).toBeUndefined();
    expect(unobserveMock).toHaveBeenCalledWith(image);
  });
});
