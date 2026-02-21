/**
 * Experience Toggle Module
 * Shows and hides detailed experience content on demand.
 */
const ExperienceToggle = {
  init() {
    const toggles = document.querySelectorAll('.experience-toggle');
    if (!toggles.length) return;

    toggles.forEach((toggle) => {
      toggle.addEventListener('click', () => {
        this.handleToggle(toggle);
      });
    });
  },

  handleToggle(toggle) {
    const panelId = toggle.getAttribute('aria-controls');
    if (!panelId) return;

    const panel = document.getElementById(panelId);
    if (!panel) return;

    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      this.closePanel(toggle, panel);
    } else {
      this.openPanel(toggle, panel);
    }
  },

  openPanel(toggle, panel) {
    const disclosure = toggle.closest('.experience-disclosure');
    toggle.setAttribute('aria-expanded', 'true');
    if (disclosure) {
      disclosure.classList.add('is-expanded');
    }
    panel.hidden = false;
    requestAnimationFrame(() => {
      panel.classList.add('is-open');
    });
  },

  closePanel(toggle, panel) {
    const disclosure = toggle.closest('.experience-disclosure');
    toggle.setAttribute('aria-expanded', 'false');
    panel.classList.remove('is-open');
    if (disclosure) {
      disclosure.classList.remove('is-expanded');
    }

    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      panel.hidden = true;
      return;
    }

    let settled = false;
    const settle = () => {
      if (settled) return;
      settled = true;
      panel.hidden = true;
      panel.removeEventListener('transitionend', handleTransitionEnd);
      clearTimeout(fallbackTimer);
    };

    const handleTransitionEnd = (event) => {
      if (event.target !== panel || event.propertyName !== 'max-height') return;
      settle();
    };

    panel.addEventListener('transitionend', handleTransitionEnd);
    const fallbackTimer = window.setTimeout(settle, 400);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ExperienceToggle.init());
} else {
  ExperienceToggle.init();
}
