/**
 * Skills marquee initializer
 * Duplicates each skills list to create a seamless infinite loop.
 */
const SkillsMarquee = {
  lists: [],
  resizeHandler: null,

  init() {
    const lists = document.querySelectorAll('#skills .skill-list');
    if (!lists.length) return;

    this.lists = Array.from(lists);

    lists.forEach((list) => {
      if (list.dataset.marqueeReady === 'true') return;

      const items = Array.from(list.children);
      if (!items.length) return;

      // Keep references to the original run for precise shift calculation.
      const firstOriginal = items[0];

      // Add an intentional empty spacer between original and clone runs.
      const spacer = document.createElement('li');
      spacer.className = 'skill-item skill-item--spacer';
      spacer.setAttribute('aria-hidden', 'true');
      list.appendChild(spacer);

      const cloneFragment = document.createDocumentFragment();
      items.forEach((item) => {
        const clone = item.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.dataset.cloneItem = 'true';
        cloneFragment.appendChild(clone);
      });

      list.appendChild(cloneFragment);
      const cloneStart = list.querySelector('[data-clone-item="true"]');
      if (cloneStart) {
        cloneStart.dataset.cloneStart = 'true';
      }

      firstOriginal.dataset.originalStart = 'true';
      list.dataset.marqueeReady = 'true';

      // Scale duration with original item count for readable speed.
      const duration = Math.max(28, items.length * 4.1);
      list.style.setProperty('--skills-marquee-duration', `${duration}s`);
    });

    this.updateShifts();
    this.bindResize();
  },

  updateShifts() {
    this.lists.forEach((list) => {
      if (list.dataset.marqueeReady !== 'true') return;
      const originalStart = list.querySelector('[data-original-start="true"]');
      const cloneStart = list.querySelector('[data-clone-start="true"]');
      if (!originalStart || !cloneStart) return;

      const cycleShift = cloneStart.offsetLeft - originalStart.offsetLeft;
      if (cycleShift > 0) {
        list.style.setProperty('--skills-marquee-shift', `${cycleShift.toFixed(2)}px`);
      }
    });
  },

  bindResize() {
    if (this.resizeHandler) return;
    let resizeRaf = null;
    this.resizeHandler = () => {
      if (resizeRaf !== null) return;
      resizeRaf = window.requestAnimationFrame(() => {
        resizeRaf = null;
        this.updateShifts();
      });
    };
    window.addEventListener('resize', this.resizeHandler, { passive: true });
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => SkillsMarquee.init());
} else {
  SkillsMarquee.init();
}
