/**
 * Hero Split Layout
 * Default layout (opt back to the classic centered hero with ?hero=classic).
 * Left-aligns the hero copy and, on the right, reveals a floating "currently"
 * feed: a label, a featured line, and hairline-divided status rows. The items
 * fade in with a short stagger when the hero scrolls into view. Honors
 * reduced-motion and no-JS by leaving everything visible immediately.
 */
const HeroSplit = {
  hero: null,
  feed: null,
  items: [],
  observer: null,
  started: false,

  isEnabled() {
    // Split layout is the default; opt back to the classic centered hero with
    // ?hero=classic (or ?hero=full), mirroring the ?perf=full escape hatch.
    try {
      const hero = new URLSearchParams(window.location.search).get('hero');
      return hero !== 'classic' && hero !== 'full';
    } catch {
      return true;
    }
  },

  init() {
    this.hero = document.querySelector('.hero');
    if (!this.hero) return;

    if (!this.isEnabled()) {
      this.hero.classList.remove('hero--split');
      return;
    }
    this.hero.classList.add('hero--split');

    this.feed = this.hero.querySelector('[data-hero-feed]');
    if (!this.feed) return;

    this.items = Array.from(
      this.feed.querySelectorAll(
        '.hero__feed-label, .hero__feed-featured, .hero__feed-rows li'
      )
    );
    if (!this.items.length) return;

    const reduceMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Reduced motion or no IntersectionObserver: reveal at once (the CSS keeps
    // the items hidden by default so there is no flash before this runs).
    if (reduceMotion || !('IntersectionObserver' in window)) {
      this.reveal();
      return;
    }

    // Stagger each item, then reveal once the hero scrolls into view.
    this.items.forEach((el, i) => {
      el.style.transitionDelay = (i * 90) + 'ms';
    });
    this.observe();
  },

  reveal() {
    if (this.feed) this.feed.classList.add('is-revealed');
  },

  observe() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !this.started) {
          this.started = true;
          this.observer.disconnect();
          this.reveal();
        }
      });
    }, { threshold: 0.25 });
    this.observer.observe(this.hero);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => HeroSplit.init());
} else {
  HeroSplit.init();
}

if (typeof window !== 'undefined') {
  window.HeroSplit = HeroSplit;
}
