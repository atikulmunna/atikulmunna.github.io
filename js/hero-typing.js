/**
 * Hero Typing Animation
 * Types the hero description on every page load unless reduced motion is preferred.
 */
const HeroTyping = {
  speedMs: 95,
  pauseAfterMs: 250,
  startDelayMs: 3950,

  init() {
    const target = document.querySelector('[data-hero-typing]');
    if (!target) return;

    const fullText = (target.textContent || '').trim();
    if (!fullText) return;

    if (this.prefersReducedMotion()) {
      target.textContent = fullText;
      return;
    }

    target.classList.add('hero__description--queued');
    window.setTimeout(() => {
      this.runTyping(target, fullText);
    }, this.startDelayMs);
  },

  prefersReducedMotion() {
    return window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  runTyping(target, fullText) {
    target.classList.remove('hero__description--queued');
    target.classList.add('hero__description--ready');
    target.textContent = '';
    target.classList.add('hero__description--typing');

    let index = 0;

    const typeNext = () => {
      if (index < fullText.length) {
        target.textContent += fullText.charAt(index);
        index += 1;
        window.setTimeout(typeNext, this.speedMs);
        return;
      }

      window.setTimeout(() => {
        target.classList.add('hero__description--typing-complete');
      }, this.pauseAfterMs);
    };

    typeNext();
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => HeroTyping.init());
} else {
  HeroTyping.init();
}

if (typeof window !== 'undefined') {
  window.HeroTyping = HeroTyping;
}
