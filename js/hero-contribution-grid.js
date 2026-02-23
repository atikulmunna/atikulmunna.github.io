/**
 * Hero Contribution Grid
 * GitHub-like flashing contribution blocks using portfolio palette tones.
 */
const HeroContributionGrid = {
  canvas: null,
  ctx: null,
  hero: null,
  cells: [],
  rafId: null,
  visibilityObserver: null,
  isVisible: true,
  reduceMotion: false,
  width: 0,
  height: 0,
  dpr: 1,
  cellSize: 14,
  gap: 3,
  cols: 0,
  rows: 0,

  init() {
    this.canvas = document.querySelector('.hero__contrib-grid');
    if (!this.canvas) return;

    this.hero = this.canvas.closest('.hero');
    if (!this.hero) return;

    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) return;

    this.reduceMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.setupCanvas();
    this.setupVisibilityObserver();
    this.setupListeners();

    if (this.reduceMotion) {
      this.drawStatic();
      return;
    }

    this.animate();
  },

  setupListeners() {
    this.onResize = () => {
      this.setupCanvas();
    };
    window.addEventListener('resize', this.onResize, { passive: true });

    this.onVisibility = () => {
      if (document.hidden) {
        this.stop();
      } else if (this.isVisible) {
        this.animate();
      }
    };
    document.addEventListener('visibilitychange', this.onVisibility);
  },

  setupVisibilityObserver() {
    if (!('IntersectionObserver' in window)) return;
    this.visibilityObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        this.isVisible = entry.isIntersecting;
        if (this.isVisible && !document.hidden && !this.reduceMotion) {
          this.animate();
        } else {
          this.stop();
        }
      });
    }, { threshold: 0.1 });

    this.visibilityObserver.observe(this.hero);
  },

  setupCanvas() {
    const rect = this.hero.getBoundingClientRect();
    this.width = Math.max(1, Math.floor(rect.width));
    this.height = Math.max(1, Math.floor(rect.height));
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    this.cols = Math.max(8, Math.floor((this.width - this.gap) / (this.cellSize + this.gap)));
    this.rows = Math.max(6, Math.floor((this.height - this.gap) / (this.cellSize + this.gap)));
    this.buildCells();
  },

  randomLevel() {
    const roll = Math.random();
    if (roll < 0.38) return 0;
    if (roll < 0.66) return 1;
    if (roll < 0.84) return 2;
    if (roll < 0.95) return 3;
    return 4;
  },

  buildCells() {
    this.cells = [];
    for (let row = 0; row < this.rows; row += 1) {
      for (let col = 0; col < this.cols; col += 1) {
        this.cells.push({
          x: this.gap + col * (this.cellSize + this.gap),
          y: this.gap + row * (this.cellSize + this.gap),
          level: this.randomLevel(),
          glow: 0
        });
      }
    }
  },

  drawCell(cell, isStatic = false) {
    const base = 0.05 + (cell.level * 0.08);
    const flash = isStatic ? 0 : cell.glow * 0.88;
    const alpha = Math.min(0.92, base + flash);
    this.ctx.fillStyle = `rgba(245, 245, 245, ${alpha})`;
    this.roundedRect(cell.x, cell.y, this.cellSize, this.cellSize, 3);
    this.ctx.fill();
  },

  roundedRect(x, y, w, h, r) {
    const radius = Math.min(r, w * 0.5, h * 0.5);
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + w - radius, y);
    this.ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    this.ctx.lineTo(x + w, y + h - radius);
    this.ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    this.ctx.lineTo(x + radius, y + h);
    this.ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  },

  drawStatic() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    for (let i = 0; i < this.cells.length; i += 1) {
      this.drawCell(this.cells[i], true);
    }
  },

  updateCells() {
    for (let i = 0; i < this.cells.length; i += 1) {
      const cell = this.cells[i];
      cell.glow *= 0.92;

      // Higher "commit level" cells flash more often and brighter.
      const chance = 0.0012 + (cell.level * 0.0014);
      if (Math.random() < chance) {
        const burst = 0.18 + (cell.level * 0.16) + (Math.random() * 0.18);
        cell.glow = Math.max(cell.glow, burst);
      }
    }
  },

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    for (let i = 0; i < this.cells.length; i += 1) {
      this.drawCell(this.cells[i]);
    }
  },

  animate() {
    if (this.rafId !== null) return;
    const tick = () => {
      this.rafId = requestAnimationFrame(tick);
      this.updateCells();
      this.render();
    };
    this.rafId = requestAnimationFrame(tick);
  },

  stop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => HeroContributionGrid.init());
} else {
  HeroContributionGrid.init();
}

if (typeof window !== 'undefined') {
  window.HeroContributionGrid = HeroContributionGrid;
}
