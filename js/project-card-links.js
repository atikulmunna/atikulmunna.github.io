/**
 * Desktop project card links
 * Makes project cards open their GitHub repository on non-mobile layouts.
 */
(function () {
  const DESKTOP_QUERY = '(min-width: 768px) and (pointer: fine)';

  const ProjectCardLinks = {
    cards: [],
    mq: null,

    init() {
      this.cards = Array.from(document.querySelectorAll('.project-card'));
      if (!this.cards.length) return;

      this.mq = window.matchMedia(DESKTOP_QUERY);
      this.cards.forEach((card) => this.setupCard(card));
      this.applyViewportState();
      this.bindViewportListener();
    },

    setupCard(card) {
      if (card.dataset.cardLinkInit === '1') return;

      const githubLink = card.querySelector('.project-card__links a[href*="github.com"]');
      if (!githubLink) return;

      card.dataset.githubHref = githubLink.href;
      card.dataset.githubLabel = githubLink.getAttribute('aria-label') || `Open ${githubLink.textContent.trim()}`;
      card.classList.add('project-card--github-card');

      card.addEventListener('click', (event) => {
        if (!this.isDesktopActive()) return;
        if (event.target.closest('a, button, input, textarea, select, label')) return;
        window.open(card.dataset.githubHref, '_blank', 'noopener');
      });

      card.addEventListener('keydown', (event) => {
        if (!this.isDesktopActive()) return;
        if (event.key !== 'Enter' && event.key !== ' ') return;
        if (event.target.closest('a, button, input, textarea, select, label')) return;
        event.preventDefault();
        window.open(card.dataset.githubHref, '_blank', 'noopener');
      });

      card.dataset.cardLinkInit = '1';
    },

    isDesktopActive() {
      return Boolean(this.mq && this.mq.matches);
    },

    applyViewportState() {
      const active = this.isDesktopActive();
      this.cards.forEach((card) => {
        if (!card.dataset.githubHref) return;

        card.classList.toggle('project-card--desktop-link', active);
        if (active) {
          card.setAttribute('role', 'link');
          card.setAttribute('tabindex', '0');
          card.setAttribute('aria-label', card.dataset.githubLabel);
        } else {
          card.removeAttribute('role');
          card.removeAttribute('tabindex');
          card.removeAttribute('aria-label');
        }
      });
    },

    bindViewportListener() {
      if (!this.mq) return;
      const handler = () => this.applyViewportState();

      if (typeof this.mq.addEventListener === 'function') {
        this.mq.addEventListener('change', handler);
      } else if (typeof this.mq.addListener === 'function') {
        this.mq.addListener(handler);
      }
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ProjectCardLinks.init());
  } else {
    ProjectCardLinks.init();
  }

  if (typeof window !== 'undefined') {
    window.ProjectCardLinks = ProjectCardLinks;
  }
})();
