/**
 * Hero Split Layout
 * Default layout (opt back to the classic centered hero with ?hero=classic).
 * Left-aligns the hero copy and, on the right, reveals a floating "currently"
 * feed: a label, a featured line, and hairline-divided status rows. The items
 * fade in with a short stagger when the hero scrolls into view; then, about a
 * second later, an arrow bullet arrives on each row one-by-one, pushing its
 * text to the right. Honors reduced-motion and no-JS by showing the final
 * state (rows and arrows visible) immediately.
 */
const HeroSplit = {
  hero: null,
  feed: null,
  items: [],
  observer: null,
  started: false,
  timers: [],
  markerStartMs: 1000,
  markerStepMs: 400,

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

    // Reduced motion or no IntersectionObserver: show the final state at once
    // (content revealed, arrows in place). The CSS keeps everything hidden by
    // default so there is no flash before this runs.
    if (reduceMotion || !('IntersectionObserver' in window)) {
      this.feed.classList.add('is-revealed');
      this.rows().forEach((li) => li.classList.add('is-marked'));
      return;
    }

    // Stagger each item, then reveal once the hero scrolls into view.
    this.items.forEach((el, i) => {
      el.style.transitionDelay = (i * 90) + 'ms';
    });
    this.observe();
  },

  rows() {
    return this.feed ? Array.from(this.feed.querySelectorAll('.hero__feed-rows li')) : [];
  },

  reveal() {
    this.feed.classList.add('is-revealed');

    // After the content has settled, bring in the arrow bullets one-by-one.
    this.rows().forEach((li, i) => {
      this.timers.push(window.setTimeout(() => {
        li.classList.add('is-marked');
      }, this.markerStartMs + i * this.markerStepMs));
    });
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
