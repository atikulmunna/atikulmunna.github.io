/**
 * Hero Split Layout + ASCII cube loop.
 * Default layout (opt back to the classic centered hero with ?hero=classic).
 * Left-aligns the hero copy; on the right (and, on mobile, between the name and
 * the role) sits an ASCII cube. When the frame set (window.HERO_CUBE_FRAMES) is
 * present it loops the cube's rotation while the cube is on-screen, and pauses
 * when it scrolls away (requestAnimationFrame also pauses in hidden tabs).
 * Under reduced-motion / no-JS it just holds the default frame.
 */
const HeroSplit = {
  hero: null,
  wrap: null,
  art: null,
  frames: null,
  fps: 24,        // the source renders at 30fps; a touch slower reads calmer
  liteFps: 12,    // half speed in perf-lite mode
  i: 0,
  running: false,
  raf: 0,
  last: 0,

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

    this.art = this.hero.querySelector('[data-hero-portrait]');
    if (!this.art) return;
    this.wrap = this.art.closest('.hero__portrait') || this.art.parentNode;

    // Fade in on the next frame. CSS handles the transition; reduced-motion and
    // no-JS both leave the default frame visible.
    requestAnimationFrame(() => this.wrap.classList.add('is-revealed'));

    const frames = typeof window !== 'undefined' && window.HERO_CUBE_FRAMES;
    const reduceMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // No frames, reduced motion, or no rAF: hold the embedded default frame.
    if (!frames || !frames.length || reduceMotion || !('requestAnimationFrame' in window)) return;
    this.frames = frames;
    this.tick = this.tick.bind(this);

    // Loop only while the cube is visible.
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          this.start();
        } else {
          this.stop();
        }
      }, { threshold: 0.05 });
      this.observer.observe(this.wrap);
    } else {
      this.start();
    }
  },

  start() {
    if (this.running) return;
    this.running = true;
    this.last = 0;
    this.raf = requestAnimationFrame(this.tick);
  },

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  },

  tick(now) {
    if (!this.running) return;
    const lite = document.documentElement.classList.contains('perf-lite');
    const interval = 1000 / (lite ? this.liteFps : this.fps);
    if (now - this.last >= interval) {
      this.last = now;
      this.i = (this.i + 1) % this.frames.length;
      this.art.textContent = this.frames[this.i];
    }
    this.raf = requestAnimationFrame(this.tick);
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
