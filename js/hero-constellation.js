/**
 * Hero Constellation Background
 * Lightweight particle network animation for hero section.
 */
const HeroConstellation = {
  canvas: null,
  context: null,
  particles: [],
  animationId: null,
  viewportWidth: 0,
  viewportHeight: 0,
  reduceMotion: false,
  resizeFrameId: null,

  config: {
    density: 9500,
    speed: 0.34,
    radiusMin: 0.8,
    radiusMax: 1.9,
    connectDistance: 120,
    particleColor: 'rgba(245, 245, 245, 0.7)',
    lineColor: 'rgba(168, 168, 168, 0.2)'
  },

  init() {
    this.canvas = document.querySelector('.hero__constellation');
    if (!this.canvas) return;

    this.context = this.canvas.getContext('2d');
    if (!this.context) return;

    this.reduceMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.setupCanvas();
    this.createParticles();
    this.drawFrame();

    if (!this.reduceMotion) {
      this.animate();
    }

    window.addEventListener('resize', this.requestResize.bind(this), { passive: true });
    document.addEventListener('visibilitychange', this.handleVisibility.bind(this));
  },

  setupCanvas() {
    const hero = this.canvas.closest('.hero');
    if (!hero) return;

    const rect = hero.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);

    this.viewportWidth = rect.width;
    this.viewportHeight = rect.height;

    this.canvas.width = Math.floor(rect.width * ratio);
    this.canvas.height = Math.floor(rect.height * ratio);
    this.canvas.style.width = `${Math.floor(rect.width)}px`;
    this.canvas.style.height = `${Math.floor(rect.height)}px`;
    this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
  },

  createParticles() {
    const count = this.getTargetParticleCount();
    this.particles = [];

    for (let i = 0; i < count; i += 1) {
      this.particles.push(this.createParticle());
    }
  },

  getTargetParticleCount() {
    const area = this.viewportWidth * this.viewportHeight;
    const baseCount = Math.max(26, Math.floor(area / this.config.density));
    return this.reduceMotion ? Math.floor(baseCount * 0.5) : baseCount;
  },

  reconcileParticleCount() {
    const target = this.getTargetParticleCount();

    while (this.particles.length < target) {
      this.particles.push(this.createParticle());
    }

    while (this.particles.length > target) {
      this.particles.pop();
    }
  },

  createParticle() {
    const radius = this.random(this.config.radiusMin, this.config.radiusMax);
    const speed = this.config.speed;
    const angle = Math.random() * Math.PI * 2;

    return {
      x: Math.random() * this.viewportWidth,
      y: Math.random() * this.viewportHeight,
      vx: Math.cos(angle) * this.random(speed * 0.3, speed),
      vy: Math.sin(angle) * this.random(speed * 0.3, speed),
      radius
    };
  },

  drawFrame() {
    this.context.clearRect(0, 0, this.viewportWidth, this.viewportHeight);
    this.drawConnections();
    this.drawParticles();
  },

  drawParticles() {
    this.context.fillStyle = this.config.particleColor;
    for (let i = 0; i < this.particles.length; i += 1) {
      const particle = this.particles[i];
      this.context.beginPath();
      this.context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.context.fill();
    }
  },

  drawConnections() {
    const maxDistance = this.config.connectDistance;
    const maxDistanceSq = maxDistance * maxDistance;

    for (let i = 0; i < this.particles.length; i += 1) {
      const a = this.particles[i];
      for (let j = i + 1; j < this.particles.length; j += 1) {
        const b = this.particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distanceSq = dx * dx + dy * dy;

        if (distanceSq > maxDistanceSq) continue;

        const distance = Math.sqrt(distanceSq);
        const alpha = (1 - distance / maxDistance) * 0.42;

        this.context.strokeStyle = `rgba(168, 168, 168, ${alpha.toFixed(3)})`;
        this.context.lineWidth = 1;
        this.context.beginPath();
        this.context.moveTo(a.x, a.y);
        this.context.lineTo(b.x, b.y);
        this.context.stroke();
      }
    }
  },

  animate() {
    this.updateParticles();
    this.drawFrame();
    this.animationId = window.requestAnimationFrame(this.animate.bind(this));
  },

  updateParticles() {
    for (let i = 0; i < this.particles.length; i += 1) {
      const particle = this.particles[i];
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < -10 || particle.x > this.viewportWidth + 10) {
        particle.vx *= -1;
      }

      if (particle.y < -10 || particle.y > this.viewportHeight + 10) {
        particle.vy *= -1;
      }
    }
  },

  requestResize() {
    if (this.resizeFrameId) {
      window.cancelAnimationFrame(this.resizeFrameId);
    }

    this.resizeFrameId = window.requestAnimationFrame(() => {
      this.resizeFrameId = null;
      this.handleResize();
    });
  },

  handleResize() {
    const previousWidth = this.viewportWidth || 1;
    const previousHeight = this.viewportHeight || 1;

    this.setupCanvas();

    // Preserve particle flow across viewport changes instead of restarting.
    if (this.particles.length === 0) {
      this.createParticles();
      this.drawFrame();
      return;
    }

    const scaleX = this.viewportWidth / previousWidth;
    const scaleY = this.viewportHeight / previousHeight;

    for (let i = 0; i < this.particles.length; i += 1) {
      this.particles[i].x *= scaleX;
      this.particles[i].y *= scaleY;
    }

    this.reconcileParticleCount();
    this.drawFrame();
  },

  handleVisibility() {
    if (this.reduceMotion) return;

    if (document.hidden && this.animationId) {
      window.cancelAnimationFrame(this.animationId);
      this.animationId = null;
      return;
    }

    if (!document.hidden && !this.animationId) {
      this.animate();
    }
  },

  random(min, max) {
    return Math.random() * (max - min) + min;
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => HeroConstellation.init());
} else {
  HeroConstellation.init();
}

if (typeof window !== 'undefined') {
  window.HeroConstellation = HeroConstellation;
}
