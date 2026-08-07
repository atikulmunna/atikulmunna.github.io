/**
 * Hero Split Layout.
 * Default layout (opt back to the classic centered hero with ?hero=classic).
 * Left-aligns the hero copy; on the right (and, on mobile, between the name and
 * the role) sits a static ASCII portrait where the status feed used to be. This
 * module only enables the split layout and fades the portrait in once, there is
 * no ongoing animation.
 */
const HeroSplit = {
  hero: null,

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

    // Fade the static portrait in on the next frame. CSS handles the transition;
    // reduced-motion and no-JS both leave it visible.
    const wrap = this.hero.querySelector('.hero__portrait');
    if (wrap) requestAnimationFrame(() => wrap.classList.add('is-revealed'));
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
