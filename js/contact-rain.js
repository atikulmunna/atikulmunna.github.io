/**
 * Contact section character rain background.
 * Subtle theme-aware rain that sits behind the contact content.
 */
const ContactRain = {
  canvas: null,
  ctx: null,
  section: null,
  drops: [],
  rafId: null,
  width: 0,
  height: 0,
  dpr: 1,
  fontSize: 15,
  columnStep: 18,
  chars: '01',
  isVisible: true,
  reduceMotion: false,
  performanceLite: false,
  lastFrameTs: 0,
  frameIntervalMs: 28,
  observer: null,

  init() {
    this.canvas = document.querySelector('.contact__rain');
    if (!this.canvas) return;

    this.section = this.canvas.closest('#contact');
    if (!this.section) return;

    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) return;

    this.reduceMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.performanceLite = this.isPerformanceLite();

    this.setupCanvas();
    this.setupObserver();
    this.bindEvents();

    if (this.reduceMotion || this.performanceLite) {
      this.renderStatic();
      return;
    }

    this.animate();
  },

  isPerformanceLite() {
    const rootLite = document.documentElement &&
      document.documentElement.classList.contains('perf-lite');
    const mobileCoarse = window.matchMedia &&
      window.matchMedia('(max-width: 767px) and (pointer: coarse)').matches;
    const saveData = navigator.connection && navigator.connection.saveData;
    const memory = Number(navigator.deviceMemory || 0);
    const lowMemory = memory > 0 && memory <= 4;

    return Boolean(rootLite || saveData || (mobileCoarse && lowMemory));
  },

  isLightThemeActive() {
    return Boolean(document.body && document.body.classList.contains('theme-light'));
  },

  bindEvents() {
    this.onResize = () => this.setupCanvas();
    window.addEventListener('resize', this.onResize, { passive: true });

    this.onVisibility = () => {
      if (document.hidden) {
        this.stop();
      } else if (this.isVisible && !this.reduceMotion && !this.performanceLite) {
        this.animate();
      }
    };
    document.addEventListener('visibilitychange', this.onVisibility);
  },

  setupObserver() {
    if (!('IntersectionObserver' in window)) return;
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        this.isVisible = entry.isIntersecting;
        if (this.isVisible && !document.hidden && !this.reduceMotion && !this.performanceLite) {
          this.animate();
        } else {
          this.stop();
        }
      });
    }, { threshold: 0.08 });

    this.observer.observe(this.section);
  },

  setupCanvas() {
    const rect = this.section.getBoundingClientRect();
    this.width = Math.max(1, Math.floor(rect.width));
    this.height = Math.max(1, Math.floor(rect.height));
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.buildDrops();
  },

  buildDrops() {
    const cols = Math.max(8, Math.floor(this.width / this.columnStep));
    this.drops = [];

    for (let i = 0; i < cols; i += 1) {
      this.drops.push({
        x: i * this.columnStep + 6,
        y: -Math.random() * this.height,
        speed: 0.95 + Math.random() * 1.25,
        length: 5 + Math.floor(Math.random() * 8),
        tick: Math.random() * 100
      });
    }
  },

  randomChar() {
    const idx = Math.floor(Math.random() * this.chars.length);
    return this.chars.charAt(idx);
  },

  renderStatic() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.font = `${this.fontSize}px Merriweather, serif`;
    this.ctx.textBaseline = 'top';
    const color = this.isLightThemeActive()
      ? 'rgba(17, 17, 17, 0.18)'
      : 'rgba(245, 245, 245, 0.12)';
    this.ctx.fillStyle = color;

    this.drops.forEach((drop) => {
      for (let i = 0; i < Math.min(4, drop.length); i += 1) {
        this.ctx.fillText(this.randomChar(), drop.x, i * this.fontSize * 1.15);
      }
    });
  },

  renderFrame() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.font = `${this.fontSize}px Merriweather, serif`;
    this.ctx.textBaseline = 'top';

    const bodyColor = this.isLightThemeActive()
      ? 'rgba(17, 17, 17, 0.24)'
      : 'rgba(245, 245, 245, 0.16)';
    const headColor = this.isLightThemeActive()
      ? 'rgba(17, 17, 17, 0.42)'
      : 'rgba(255, 255, 255, 0.34)';

    this.drops.forEach((drop) => {
      for (let i = 0; i < drop.length; i += 1) {
        const y = drop.y - (i * this.fontSize * 1.08);
        if (y < -this.fontSize || y > this.height + this.fontSize) continue;

        this.ctx.fillStyle = i === 0 ? headColor : bodyColor;
        this.ctx.fillText(this.randomChar(), drop.x, y);
      }

      drop.y += drop.speed;
      drop.tick += 1;
      if (drop.y - (drop.length * this.fontSize * 1.08) > this.height + 8) {
        drop.y = -Math.random() * 140;
        drop.speed = 0.95 + Math.random() * 1.25;
        drop.length = 5 + Math.floor(Math.random() * 8);
      }
    });
  },

  animate() {
    if (this.rafId !== null) return;

    const tick = (ts) => {
      this.rafId = requestAnimationFrame(tick);
      const now = typeof ts === 'number' ? ts : performance.now();
      if (now - this.lastFrameTs < this.frameIntervalMs) return;
      this.lastFrameTs = now;
      this.renderFrame();
    };

    this.rafId = requestAnimationFrame(tick);
  },

  stop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.lastFrameTs = 0;
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ContactRain.init());
} else {
  ContactRain.init();
}

if (typeof window !== 'undefined') {
  window.ContactRain = ContactRain;
}
