/**
 * Hero Shader Lines (vanilla canvas)
 * Lightweight animated lines effect inspired by shader backgrounds.
 */

const ShaderLines = {
  canvas: null,
  ctx: null,
  lines: [],
  rafId: null,
  width: 0,
  height: 0,
  dpr: 1,
  active: false,
  reduceMotion: false,

  init() {
    this.canvas = document.querySelector('.hero__shader');
    if (!this.canvas) return;

    this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (this.reduceMotion) return;

    this.ctx = this.canvas.getContext('2d', { alpha: true });
    if (!this.ctx) return;

    this.onResize = this.resize.bind(this);
    this.onVisibilityChange = this.handleVisibilityChange.bind(this);

    window.addEventListener('resize', this.onResize, { passive: true });
    document.addEventListener('visibilitychange', this.onVisibilityChange);

    this.resize();
    this.start();
  },

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = Math.max(1, rect.width);
    this.height = Math.max(1, rect.height);
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.buildLines();
  },

  buildLines() {
    const mobile = window.matchMedia('(max-width: 767px)').matches;
    const count = mobile ? 12 : 20;
    this.lines = [];

    for (let i = 0; i < count; i += 1) {
      const progress = (i + 1) / (count + 1);
      this.lines.push({
        baseY: progress * this.height,
        ampA: (mobile ? 10 : 16) + Math.random() * (mobile ? 12 : 20),
        ampB: (mobile ? 5 : 8) + Math.random() * (mobile ? 8 : 12),
        freqA: 0.006 + Math.random() * 0.006,
        freqB: 0.002 + Math.random() * 0.004,
        speed: 0.00045 + Math.random() * 0.00065,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.09 + Math.random() * 0.12,
        width: 0.8 + Math.random() * 1.1
      });
    }
  },

  drawFrame(time) {
    this.ctx.clearRect(0, 0, this.width, this.height);
    const step = window.matchMedia('(max-width: 767px)').matches ? 16 : 12;

    for (const line of this.lines) {
      this.ctx.beginPath();

      for (let x = 0; x <= this.width; x += step) {
        const waveA = Math.sin((x * line.freqA) + (time * line.speed) + line.phase) * line.ampA;
        const waveB = Math.cos((x * line.freqB) - (time * (line.speed * 0.6)) + line.phase) * line.ampB;
        const y = line.baseY + waveA + waveB;

        if (x === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      }

      this.ctx.strokeStyle = `rgba(245, 245, 245, ${line.alpha})`;
      this.ctx.lineWidth = line.width;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = 'rgba(245, 245, 245, 0.18)';
      this.ctx.stroke();
    }

    this.ctx.shadowBlur = 0;
    this.rafId = requestAnimationFrame((t) => this.drawFrame(t));
  },

  start() {
    if (this.active) return;
    this.active = true;
    this.rafId = requestAnimationFrame((t) => this.drawFrame(t));
  },

  stop() {
    this.active = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  },

  handleVisibilityChange() {
    if (document.hidden) this.stop();
    else this.start();
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ShaderLines.init());
} else {
  ShaderLines.init();
}

if (typeof window !== 'undefined') {
  window.ShaderLines = ShaderLines;
}

