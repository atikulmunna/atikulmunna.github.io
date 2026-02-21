/**
 * Animations Module
 * Handles scroll animations and interactions
 * Requirements: 7.3, 7.5, 7.6
 */

const Animations = {
  state: {
    initialized: false,
    observer: null,
    heroDriftRaf: null
  },

  config: {
    targetSelectors: [
      '.section__title',
      '.hero__content',
      '.about__text p',
      '.education-item',
      '.skill-category',
      '.project-card',
      '.timeline-item',
      '.contact-card',
      '.social-links .btn'
    ],
    observerOptions: {
      root: null,
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.15
    }
  },

  init() {
    if (this.state.initialized) return;

    const elements = this.getAnimatableElements();
    if (elements.length === 0) {
      this.state.initialized = true;
      return;
    }

    this.prepareElements(elements);

    if (this.prefersReducedMotion()) {
      this.revealAll(elements);
      this.state.initialized = true;
      return;
    }

    if ('IntersectionObserver' in window) {
      this.setupObserver(elements);
    } else {
      this.revealAll(elements);
    }

    this.setupLiquidReactivity();
    this.setupHeroLiquidDrift();

    this.state.initialized = true;
  },

  getAnimatableElements() {
    const seen = new Set();
    const elements = [];

    this.config.targetSelectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        if (!seen.has(el)) {
          seen.add(el);
          elements.push(el);
        }
      });
    });

    return elements;
  },

  prepareElements(elements) {
    elements.forEach((el, index) => {
      el.classList.add('animate-on-scroll');
      el.style.setProperty('--stagger-index', String(index % 8));
    });
  },

  setupObserver(elements) {
    this.state.observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, this.config.observerOptions);

    elements.forEach((el) => this.state.observer.observe(el));
  },

  revealAll(elements) {
    elements.forEach((el) => el.classList.add('is-visible'));
  },

  prefersReducedMotion() {
    return (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  },

  supportsFinePointer() {
    return (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(pointer: fine)').matches
    );
  },

  setupLiquidReactivity() {
    if (this.prefersReducedMotion() || !this.supportsFinePointer()) {
      return;
    }

    const targets = Array.from(
      document.querySelectorAll('.card--glass, .btn--glass, .nav')
    );

    targets.forEach((target) => {
      target.addEventListener('pointermove', (event) => {
        const rect = target.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;

        target.style.setProperty('--liquid-pointer-x', `${Math.max(0, Math.min(100, x)).toFixed(2)}%`);
        target.style.setProperty('--liquid-pointer-y', `${Math.max(0, Math.min(100, y)).toFixed(2)}%`);
        target.style.setProperty('--liquid-pointer-o', '0.22');
      });

      target.addEventListener('pointerleave', () => {
        target.style.setProperty('--liquid-pointer-o', '0');
      });
    });
  },

  supportsDesktopViewport() {
    return (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(min-width: 1024px)').matches
    );
  },

  setupHeroLiquidDrift() {
    if (
      this.prefersReducedMotion() ||
      !this.supportsFinePointer() ||
      !this.supportsDesktopViewport()
    ) {
      return;
    }

    const hero = document.querySelector('.hero');
    if (!hero) return;

    const updateDrift = () => {
      const scrollY = window.scrollY || 0;

      // Keep movement subtle and bounded for a premium, non-distracting effect.
      const driftA = Math.max(-24, Math.min(24, scrollY * 0.035));
      const driftB = Math.max(-32, Math.min(32, scrollY * 0.05));

      hero.style.setProperty('--hero-liquid-drift-a', `${driftA.toFixed(2)}px`);
      hero.style.setProperty('--hero-liquid-drift-b', `${driftB.toFixed(2)}px`);
      this.state.heroDriftRaf = null;
    };

    window.addEventListener('scroll', () => {
      if (this.state.heroDriftRaf !== null) return;
      this.state.heroDriftRaf = window.requestAnimationFrame(updateDrift);
    }, { passive: true });

    updateDrift();
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Animations;
}

if (typeof window !== 'undefined') {
  window.Animations = Animations;
}
