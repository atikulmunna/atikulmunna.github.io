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
      disclosure.style.width = '';
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

    // Keep collapse animation smooth by locking width to the button on larger screens.
    if (disclosure && window.innerWidth >= 768) {
      disclosure.style.width = `${Math.ceil(toggle.getBoundingClientRect().width)}px`;
    }

    if (disclosure) {
      disclosure.classList.remove('is-expanded');
    }
    
    // Hide immediately to avoid delayed second-step shrink after collapse.
    panel.hidden = true;
    if (disclosure) {
      disclosure.style.width = '';
    }
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ExperienceToggle.init());
} else {
  ExperienceToggle.init();
}
