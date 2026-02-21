/**
 * Image Loader Module
 * Handles lazy-loading fallback and image load error recovery
 * Requirements: 6.4, 10.3
 */

const ImageLoader = {
  config: {
    lazySelector: 'img[loading="lazy"]',
    fallbackClass: 'image-fallback'
  },

  elements: {
    images: []
  },

  observer: null,

  init() {
    this.cacheElements();

    if (!this.elements.images.length) {
      return;
    }

    this.setupErrorHandling();
    this.setupLazyLoadingFallback();
  },

  cacheElements() {
    this.elements.images = Array.from(document.querySelectorAll(this.config.lazySelector));
  },

  setupErrorHandling() {
    this.elements.images.forEach((image) => {
      image.addEventListener('error', () => this.handleImageError(image));
    });
  },

  setupLazyLoadingFallback() {
    if (this.supportsNativeLazyLoading()) {
      return;
    }

    const deferredImages = this.elements.images.filter((image) => image.dataset.src);
    if (!deferredImages.length) {
      return;
    }

    if (typeof IntersectionObserver === 'function') {
      this.observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          this.loadDeferredImage(entry.target);
          observer.unobserve(entry.target);
        });
      }, {
        root: null,
        rootMargin: '150px 0px',
        threshold: 0.01
      });

      deferredImages.forEach((image) => this.observer.observe(image));
      return;
    }

    deferredImages.forEach((image) => this.loadDeferredImage(image));
  },

  loadDeferredImage(image) {
    if (image.dataset.src) {
      image.src = image.dataset.src;
      delete image.dataset.src;
    }

    if (image.dataset.srcset) {
      image.srcset = image.dataset.srcset;
      delete image.dataset.srcset;
    }
  },

  handleImageError(image) {
    if (image.dataset.errorHandled === 'true') {
      return;
    }

    image.dataset.errorHandled = 'true';
    image.classList.add(this.config.fallbackClass);
    image.removeAttribute('srcset');
    image.src = this.getPlaceholderDataUri();

    if (!image.alt || !image.alt.trim()) {
      image.alt = 'Image unavailable';
    }
  },

  getPlaceholderDataUri() {
    const svg = "<svg xmlns='http://www.w3.org/2000/svg' width='640' height='360' viewBox='0 0 640 360'><rect width='100%' height='100%' fill='#e2e8f0'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#475569' font-family='Merriweather, serif' font-size='24'>Image unavailable</text></svg>";
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  },

  supportsNativeLazyLoading() {
    return typeof HTMLImageElement !== 'undefined' && 'loading' in HTMLImageElement.prototype;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageLoader;
}

if (typeof window !== 'undefined') {
  window.ImageLoader = ImageLoader;
}
