/**
 * Hero Split Layout + portrait shimmer.
 * Default layout (opt back to the classic centered hero with ?hero=classic).
 * Left-aligns the hero copy; on the right sits an ASCII portrait where the
 * status feed used to be. This module reveals the portrait with a quiet fade,
 * then runs a subtle monochrome "shimmer": each frame a few non-blank glyphs are
 * nudged to a neighbour on the density ramp, so the portrait stays alive without
 * ever pulling focus. Honors reduced-motion and no-JS by leaving the static
 * portrait in place, and pauses the shimmer while the hero is off-screen.
 */
const HeroSplit = {
  hero: null,
  wrap: null,
  art: null,
  rows: [],
  H: 0,
  visible: true,
  last: 0,
  fps: 20,
  rate: 0.035, // fraction of glyphs nudged per frame
  DENS: ' .:-=+*#%@',

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

    // Parse the embedded portrait once. A <pre> keeps a single leading newline
    // after the tag; drop it, and trim trailing blank lines.
    let src = this.art.textContent.replace(/^\n/, '').replace(/\s+$/, '');
    this.rows = src.split('\n');
    this.H = this.rows.length;
    if (!this.H) return;

    // Fade the portrait in on the next frame (hero is at the top of the page).
    requestAnimationFrame(() => this.wrap.classList.add('is-revealed'));

    const reduceMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Reduced motion or no rAF: leave the static portrait as-is (still revealed).
    if (reduceMotion || !('requestAnimationFrame' in window)) return;

    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        this.visible = entries[0].isIntersecting;
      }, { threshold: 0.01 });
      this.observer.observe(this.hero);
    }

    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  },

  loop(now) {
    requestAnimationFrame(this.loop);
    if (!this.visible) return;
    if (now - this.last < 1000 / this.fps) return;
    this.last = now;
    this.art.textContent = this.shimmer();
  },

  // Rebuild the portrait with a few glyphs shifted one step along the density
  // ramp, so the image gently scintillates in place.
  shimmer() {
    const rows = this.rows;
    const DENS = this.DENS;
    const rate = this.rate;
    let out = '';
    for (let y = 0; y < this.H; y++) {
      const r = rows[y];
      let line = '';
      for (let x = 0; x < r.length; x++) {
        const c = r[x];
        if (c !== ' ' && Math.random() < rate) {
          const i = DENS.indexOf(c);
          if (i >= 1) {
            let j = i + (Math.random() < 0.5 ? -1 : 1);
            if (j < 1) j = 1;
            if (j > DENS.length - 1) j = DENS.length - 1;
            line += DENS[j];
          } else {
            line += c;
          }
        } else {
          line += c;
        }
      }
      out += line;
      if (y < this.H - 1) out += '\n';
    }
    return out;
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
