/**
 * Hero Split Layout + portrait shimmer + gaze.
 * Default layout (opt back to the classic centered hero with ?hero=classic).
 * Left-aligns the hero copy; on the right sits an ASCII portrait where the
 * status feed used to be. This module reveals the portrait with a quiet fade,
 * runs a subtle monochrome "shimmer" (each frame a few non-blank glyphs are
 * nudged to a neighbour on the density ramp), and draws two pupils that ease
 * toward the pointer so the eyes follow the cursor. Honors reduced-motion and
 * no-JS by leaving the static portrait in place, and pauses while off-screen.
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

  // Eyes located in the ASCII grid (col, row); pupils ride within these sockets.
  eyeL: { cx: 53, cy: 47 },
  eyeR: { cx: 68, cy: 47 },
  eyeMaxX: 3.2,   // max pupil travel in cells
  eyeMaxY: 1.4,
  pupil: '@',
  // Live gaze state ([-1..1] each axis) eased toward the pointer target.
  gx: 0, gy: 0, tgx: 0, tgy: 0,
  mx: null, my: null,

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

    // Track the pointer; the target gaze is resolved against the portrait rect
    // inside the throttled loop so mousemove stays cheap.
    window.addEventListener('pointermove', (e) => {
      this.mx = e.clientX;
      this.my = e.clientY;
    }, { passive: true });

    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  },

  loop(now) {
    requestAnimationFrame(this.loop);
    if (!this.visible) return;
    if (now - this.last < 1000 / this.fps) return;
    this.last = now;

    this.aim();
    // Ease the gaze toward the pointer target for a natural glide.
    this.gx += (this.tgx - this.gx) * 0.16;
    this.gy += (this.tgy - this.gy) * 0.16;

    this.art.textContent = this.render();
  },

  // Resolve the pointer position into a clamped [-1..1] gaze target relative to
  // the portrait's centre. A generous divisor means the eyes reach their limit
  // well before the pointer leaves the hero.
  aim() {
    if (this.mx == null) return;
    const r = this.wrap.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const nx = (this.mx - cx) / (r.width * 0.9 || 1);
    const ny = (this.my - cy) / (r.height * 0.9 || 1);
    this.tgx = Math.max(-1, Math.min(1, nx));
    this.tgy = Math.max(-1, Math.min(1, ny));
  },

  render() {
    const rows = this.rows;
    const DENS = this.DENS;
    const rate = this.rate;
    const out = new Array(this.H);
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
      out[y] = line;
    }

    // Pupils on top, eased toward the pointer.
    const ox = Math.round(this.gx * this.eyeMaxX);
    const oy = Math.round(this.gy * this.eyeMaxY);
    this.drawPupil(out, this.eyeL.cx + ox, this.eyeL.cy + oy);
    this.drawPupil(out, this.eyeR.cx + ox, this.eyeR.cy + oy);

    return out.join('\n');
  },

  drawPupil(out, x, y) {
    this.setCell(out, x, y, this.pupil);
    this.setCell(out, x + 1, y, this.pupil);
  },

  setCell(out, x, y, ch) {
    if (y < 0 || y >= out.length) return;
    const r = out[y];
    if (x < 0 || x >= r.length) return;
    out[y] = r.slice(0, x) + ch + r.slice(x + 1);
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
