/**
 * Hero Split Layout (preview)
 * Opt-in via ?hero=split. Left-aligns the hero copy and renders a
 * monochrome AI/ML visual on the right: a particle halo orbiting a glass
 * disc that holds an animated neural network with forward-propagation
 * pulses. Honors reduced-motion and the shared performance profile, and
 * pauses when off-screen or the tab is hidden.
 */
const HeroSplit = {
  hero: null,
  canvas: null,
  ctx: null,
  netCanvas: null,
  netCtx: null,
  particles: [],
  layers: [],
  nodes: [],
  edges: [],
  rafId: null,
  visibilityObserver: null,
  isVisible: true,
  reduceMotion: false,
  performanceLite: false,
  width: 0,
  height: 0,
  dpr: 1,
  cx: 0,
  cy: 0,
  radius: 0,
  netW: 0,
  netH: 0,
  wave: 0,
  wavePeriod: 1,
  frameIntervalMs: 16.7,
  lastFrameTs: 0,
  t: 0,

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

    this.canvas = this.hero.querySelector('.hero__avatar-canvas');
    this.netCanvas = this.hero.querySelector('.hero__avatar-net');
    if (!this.canvas || !this.netCanvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.netCtx = this.netCanvas.getContext('2d');
    if (!this.ctx || !this.netCtx) return;

    this.reduceMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.performanceLite = this.isPerformanceLite();
    this.frameIntervalMs = this.performanceLite ? 40 : 16.7;
    this.layers = this.performanceLite ? [3, 4, 2] : [3, 5, 5, 2];
    this.wavePeriod = (this.layers.length - 1) + 0.85;

    this.setupCanvas();
    this.setupNet();
    this.buildParticles();
    this.buildNetwork();
    this.setupListeners();
    this.setupVisibilityObserver();

    if (this.reduceMotion) {
      this.wave = (this.layers.length - 1) * 0.5;
      this.render();
      this.renderNet();
      return;
    }
    this.animate();
  },

  isPerformanceLite() {
    return Boolean(
      typeof window !== 'undefined' &&
      typeof window.__portfolioIsPerfLite === 'function' &&
      window.__portfolioIsPerfLite()
    );
  },

  isLightThemeActive() {
    return Boolean(document.body && document.body.classList.contains('theme-light'));
  },

  themeRgb() {
    return this.isLightThemeActive() ? '17, 17, 17' : '245, 245, 245';
  },

  /* ----- Particle halo ----- */

  setupCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = Math.max(1, Math.floor(rect.width));
    this.height = Math.max(1, Math.floor(rect.height));
    this.dpr = this.performanceLite ? 1 : Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    this.cx = this.width / 2;
    this.cy = this.height / 2;
    this.radius = Math.min(this.width, this.height) * 0.42;
  },

  buildParticles() {
    const count = this.performanceLite ? 48 : 104;
    this.particles = [];
    for (let i = 0; i < count; i += 1) {
      const onRing = Math.random() < 0.32;
      const angle = Math.random() * Math.PI * 2;
      const orbit = onRing
        ? this.radius * (0.98 + Math.random() * 0.16)
        : this.radius * Math.sqrt(Math.random()) * 0.9;
      this.particles.push({
        angle,
        baseOrbit: orbit,
        speed: (onRing ? 0.12 : 0.05) * (0.5 + Math.random()) * (Math.random() < 0.5 ? -1 : 1),
        size: onRing ? 1.1 + Math.random() * 1.4 : 0.7 + Math.random() * 1.5,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.6 + Math.random() * 1.4,
        onRing
      });
    }
  },

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    const rgb = this.themeRgb();
    for (let i = 0; i < this.particles.length; i += 1) {
      const p = this.particles[i];
      const breathe = 1 + Math.sin(this.t * 0.6 + p.twinkle) * (p.onRing ? 0.015 : 0.05);
      const r = p.baseOrbit * breathe;
      const x = this.cx + Math.cos(p.angle) * r;
      const y = this.cy + Math.sin(p.angle) * r;
      const alpha = (p.onRing ? 0.55 : 0.4) +
        Math.sin(this.t * p.twinkleSpeed + p.twinkle) * 0.28;
      this.ctx.beginPath();
      this.ctx.fillStyle = `rgba(${rgb}, ${Math.max(0.05, Math.min(0.95, alpha))})`;
      this.ctx.arc(x, y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
  },

  /* ----- Neural network core ----- */

  setupNet() {
    const rect = this.netCanvas.getBoundingClientRect();
    this.netW = Math.max(1, Math.floor(rect.width));
    this.netH = Math.max(1, Math.floor(rect.height));
    this.netCanvas.width = Math.floor(this.netW * this.dpr);
    this.netCanvas.height = Math.floor(this.netH * this.dpr);
    this.netCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  },

  buildNetwork() {
    const padX = this.netW * 0.13;
    const padY = this.netH * 0.14;
    const usableW = this.netW - padX * 2;
    const usableH = this.netH - padY * 2;
    const lastLayer = this.layers.length - 1;

    this.nodes = [];
    this.layers.forEach((count, layerIndex) => {
      const x = padX + (lastLayer === 0 ? 0 : (layerIndex / lastLayer) * usableW);
      for (let j = 0; j < count; j += 1) {
        const y = padY + ((j + 1) / (count + 1)) * usableH;
        this.nodes.push({ x, y, layer: layerIndex, idx: this.nodes.length });
      }
    });

    this.edges = [];
    for (let i = 0; i < this.nodes.length; i += 1) {
      const a = this.nodes[i];
      for (let k = 0; k < this.nodes.length; k += 1) {
        const b = this.nodes[k];
        if (b.layer === a.layer + 1) {
          this.edges.push({ a, b, layer: a.layer });
        }
      }
    }
  },

  // Smooth bell curve, 1 at d=0, ~0 by |d|=0.6.
  bell(d) {
    return Math.exp(-(d * d) / 0.18);
  },

  renderNet() {
    this.netCtx.clearRect(0, 0, this.netW, this.netH);
    const rgb = this.themeRgb();

    // Edges (static wiring).
    this.netCtx.lineWidth = 1;
    for (let i = 0; i < this.edges.length; i += 1) {
      const e = this.edges[i];
      this.netCtx.beginPath();
      this.netCtx.strokeStyle = `rgba(${rgb}, 0.22)`;
      this.netCtx.moveTo(e.a.x, e.a.y);
      this.netCtx.lineTo(e.b.x, e.b.y);
      this.netCtx.stroke();
    }

    // Travelling signal pulses (forward pass, left to right).
    for (let i = 0; i < this.edges.length; i += 1) {
      const e = this.edges[i];
      const t = this.wave - e.layer;
      if (t <= 0 || t >= 1) continue;
      const x = e.a.x + (e.b.x - e.a.x) * t;
      const y = e.a.y + (e.b.y - e.a.y) * t;
      const alpha = this.bell(t - 0.5);
      this.netCtx.beginPath();
      this.netCtx.fillStyle = `rgba(${rgb}, ${alpha})`;
      this.netCtx.arc(x, y, 2, 0, Math.PI * 2);
      this.netCtx.fill();
    }

    // Nodes (glow as the wave reaches their layer).
    for (let i = 0; i < this.nodes.length; i += 1) {
      const n = this.nodes[i];
      const activation = this.bell(this.wave - n.layer);
      const r = 3.2 + activation * 2.6;
      const alpha = 0.5 + activation * 0.45;
      this.netCtx.beginPath();
      this.netCtx.fillStyle = `rgba(${rgb}, ${Math.min(0.98, alpha)})`;
      this.netCtx.arc(n.x, n.y, r, 0, Math.PI * 2);
      this.netCtx.fill();
    }
  },

  /* ----- Loop ----- */

  update(dt) {
    this.t += dt;
    for (let i = 0; i < this.particles.length; i += 1) {
      this.particles[i].angle += this.particles[i].speed * dt;
    }
    // Advance the forward-pass wave and loop it.
    this.wave = (this.wave + dt * 0.85) % this.wavePeriod;
  },

  animate() {
    if (this.rafId !== null) return;
    const tick = (ts) => {
      this.rafId = requestAnimationFrame(tick);
      const now = typeof ts === 'number' ? ts
        : ((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now());
      if (now - this.lastFrameTs < this.frameIntervalMs) return;
      const dt = this.lastFrameTs ? Math.min(0.05, (now - this.lastFrameTs) / 1000) : 0.016;
      this.lastFrameTs = now;
      this.update(dt);
      this.render();
      this.renderNet();
    };
    this.rafId = requestAnimationFrame(tick);
  },

  stop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.lastFrameTs = 0;
  },

  setupListeners() {
    this.onResize = () => {
      this.setupCanvas();
      this.setupNet();
      this.buildParticles();
      this.buildNetwork();
      if (this.reduceMotion) {
        this.render();
        this.renderNet();
      }
    };
    window.addEventListener('resize', this.onResize, { passive: true });

    this.onVisibility = () => {
      if (document.hidden) {
        this.stop();
      } else if (this.isVisible && !this.reduceMotion) {
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
    }, { threshold: 0.05 });
    this.visibilityObserver.observe(this.hero);
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
