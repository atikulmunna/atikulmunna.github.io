/**
 * Hero Split Layout
 * Default layout (opt back to classic centered hero with ?hero=classic).
 * Left-aligns the hero copy and types out a glass "status" terminal on the
 * right: a few command/output lines describing current work and availability,
 * with a blinking caret. Honors reduced-motion (renders the text instantly)
 * and types once when the hero scrolls into view.
 */
const HeroSplit = {
  hero: null,
  body: null,
  lines: [],
  reduceMotion: false,
  observer: null,
  started: false,
  timers: [],

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

    this.body = this.hero.querySelector('[data-hero-terminal]');
    if (!this.body) return;

    this.reduceMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // The `whoami` identity block is CSS-hidden on desktop (the hero heading
    // carries the name there) and shown on mobile. Skip hidden lines so the
    // typing sequence never stalls "typing" an invisible line.
    this.lines = Array.from(this.body.querySelectorAll('.hero__terminal-line'))
      .filter((line) => this.isVisible(line));

    // Capture each line's text, then clear the animated targets so they can be
    // typed back in. The HTML keeps the real text for no-JS and crawlers.
    this.lines.forEach((line) => {
      const tx = line.querySelector('.hero__terminal-tx');
      if (tx) {
        tx.dataset.full = tx.textContent;
        tx.textContent = '';
      }
    });

    if (this.reduceMotion) {
      this.revealAll();
      return;
    }
    this.observe();
  },

  isVisible(el) {
    try {
      return window.getComputedStyle(el).display !== 'none';
    } catch {
      return true;
    }
  },

  revealAll() {
    this.lines.forEach((line) => {
      const tx = line.querySelector('.hero__terminal-tx');
      if (tx) tx.textContent = tx.dataset.full || '';
      line.classList.add('is-shown');
    });
    const last = this.lines[this.lines.length - 1];
    if (last) last.classList.add('is-active');
  },

  observe() {
    if (!('IntersectionObserver' in window)) {
      this.run();
      return;
    }
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !this.started) {
          this.started = true;
          this.observer.disconnect();
          this.run();
        }
      });
    }, { threshold: 0.25 });
    this.observer.observe(this.hero);
  },

  run() {
    let i = 0;
    const next = () => {
      if (i >= this.lines.length) return;
      const line = this.lines[i];
      const tx = line.querySelector('.hero__terminal-tx');
      const full = tx ? (tx.dataset.full || '') : '';
      const isCmd = line.classList.contains('hero__terminal-line--cmd');
      line.classList.add('is-shown');

      const proceed = () => { i += 1; next(); };

      if (isCmd && full) {
        // Commands type character by character.
        const isLast = i === this.lines.length - 1;
        line.classList.add('is-active');
        this.type(tx, full, () => {
          // The final line (e.g. the mobile tagline sign-off) keeps its caret
          // blinking instead of clearing it and ending the sequence.
          if (isLast) return;
          line.classList.remove('is-active');
          this.after(240, proceed);
        });
      } else if (!isCmd) {
        // Output lines appear at once after a short beat.
        if (tx) tx.textContent = full;
        this.after(170, proceed);
      } else {
        // Empty command line = the resting prompt; keep the caret blinking.
        line.classList.add('is-active');
      }
    };
    next();
  },

  type(el, text, done) {
    let n = 0;
    const tick = () => {
      el.textContent = text.slice(0, n);
      if (n >= text.length) {
        done();
        return;
      }
      n += 1;
      this.after(34 + Math.random() * 26, tick);
    };
    tick();
  },

  after(ms, fn) {
    this.timers.push(window.setTimeout(fn, ms));
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
