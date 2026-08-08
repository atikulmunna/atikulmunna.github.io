/**
 * Hero Split Layout + robot head-turn (plays once).
 * Default layout (opt back to the classic centered hero with ?hero=classic).
 * Left-aligns the hero copy; on the right (and, on mobile, between the name and
 * the role) sits an ASCII robot. When the frame set (window.HERO_ROBOT_FRAMES)
 * is present it plays the frames once the first time the hero is on-screen: from
 * the default pose the robot looks up at you, holds your gaze a moment, then
 * settles back to the default pose and holds. Under reduced-motion / no-JS it
 * just holds the default frame.
 */
const HeroSplit = {
  hero: null,
  wrap: null,
  art: null,
  frames: null,
  seq: [1, 2, 3, 4], // play the frames once: default -> look up at you -> settle back to default, and hold
                     // (frames 1 and 5 are identical, so this is a single up-then-down gesture)
  i: -1,
  hold: 460,      // ms per frame
  dwell: 1500,    // longer pause on the look-at-you frame before going back
  lookFrame: 2,   // frame index the robot faces you on
  played: false,

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

    const frames = typeof window !== 'undefined' && window.HERO_ROBOT_FRAMES;
    const reduceMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // No frames, reduced motion, or no timers: hold the embedded default frame.
    if (!frames || !frames.length || reduceMotion || !('setTimeout' in window)) return;
    this.frames = frames;

    // Play the gesture once, the first time the hero scrolls into view.
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          this.observer.disconnect();
          this.play();
        }
      }, { threshold: 0.2 });
      this.observer.observe(this.hero);
    } else {
      this.play();
    }
  },

  play() {
    if (this.played) return;
    this.played = true;
    // Hold the default pose briefly, then run the single cycle.
    window.setTimeout(() => this.step(), this.hold);
  },

  step() {
    this.i++;
    if (this.i >= this.seq.length) return; // done: rests on the default frame (index 0)
    const frame = this.seq[this.i];
    this.art.textContent = this.frames[frame];
    // Hold a beat while facing you, then continue back to the default pose.
    const wait = frame === this.lookFrame ? this.dwell : this.hold;
    window.setTimeout(() => this.step(), wait);
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
