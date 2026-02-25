/**
 * Skills marquee initializer
 * Duplicates each skills list to create a seamless infinite loop.
 */
const SkillsMarquee = {
  init() {
    const lists = document.querySelectorAll('#skills .skill-list');
    if (!lists.length) return;

    lists.forEach((list) => {
      if (list.dataset.marqueeReady === 'true') return;

      const items = Array.from(list.children);
      if (!items.length) return;

      const cloneFragment = document.createDocumentFragment();
      items.forEach((item) => {
        const clone = item.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        cloneFragment.appendChild(clone);
      });

      list.appendChild(cloneFragment);
      list.dataset.marqueeReady = 'true';

      // Scale duration with original item count for readable speed.
      const duration = Math.max(28, items.length * 4.1);
      list.style.setProperty('--skills-marquee-duration', `${duration}s`);
    });
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => SkillsMarquee.init());
} else {
  SkillsMarquee.init();
}
