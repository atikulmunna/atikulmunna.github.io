/**
 * Theme Toggle
 * Persists light/dark preference and toggles body.theme-light.
 */
const ThemeToggle = {
  storageKey: 'portfolio-theme',
  buttons: [],

  init() {
    this.buttons = Array.from(document.querySelectorAll('[data-theme-toggle]'));
    if (!this.buttons.length) return;

    this.applyStoredTheme();
    this.syncUi();

    this.buttons.forEach((button) => {
      button.addEventListener('click', () => {
        document.body.classList.toggle('theme-light');
        this.persistTheme();
        this.syncUi();
        window.dispatchEvent(new CustomEvent('themechange'));
      });
    });
  },

  applyStoredTheme() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved === 'light') {
        document.body.classList.add('theme-light');
      } else {
        document.body.classList.remove('theme-light');
      }
    } catch (_err) {
      document.body.classList.remove('theme-light');
    }
  },

  persistTheme() {
    try {
      const mode = document.body.classList.contains('theme-light') ? 'light' : 'dark';
      localStorage.setItem(this.storageKey, mode);
    } catch (_err) {
      // Ignore storage failures (private mode, blocked storage)
    }
  },

  syncUi() {
    const isLight = document.body.classList.contains('theme-light');
    this.buttons.forEach((button) => {
      button.setAttribute('aria-pressed', isLight ? 'true' : 'false');
      button.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
      button.setAttribute('title', isLight ? 'Switch to dark mode' : 'Switch to light mode');
      const iconEl = button.querySelector('[data-theme-icon]');
      if (iconEl) {
        iconEl.textContent = isLight ? '☾' : '☀';
      }
    });
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ThemeToggle.init());
} else {
  ThemeToggle.init();
}
