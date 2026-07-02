/**
 * Project card links
 * Points project cards at their in-site README detail page (project.html).
 * Desktop: the whole card is a link to the detail page. Touch: the in-card
 * action button becomes an "Overview" link to the same page. The original
 * GitHub anchor in the markup is the no-JS fallback (kept until JS repoints it),
 * and the detail page itself carries the "View Code on GitHub" button.
 */
(function () {
  const DESKTOP_QUERY = '(min-width: 768px) and (pointer: fine)';
  const OWNER = 'atikulmunna';

  function repoSlug(href) {
    try {
      const parts = new URL(href).pathname.replace(/\/+$/, '').split('/').filter(Boolean);
      return parts.length >= 2 ? parts[1] : '';
    } catch (error) {
      return '';
    }
  }

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

      const slug = repoSlug(githubLink.href);
      if (!slug) return;

      const detailHref = `project.html?repo=${encodeURIComponent(slug)}`;
      const title = (card.querySelector('.project-card__title')?.textContent || slug).trim();

      card.dataset.detailHref = detailHref;
      card.dataset.detailLabel = `View ${title} overview`;
      card.classList.add('project-card--github-card');

      // Repoint the visible action button (the touch surface) to the detail page.
      githubLink.setAttribute('href', detailHref);
      githubLink.removeAttribute('target');
      githubLink.removeAttribute('rel');
      githubLink.textContent = 'Overview';
      githubLink.setAttribute('aria-label', card.dataset.detailLabel);

      const goToDetail = () => {
        window.location.assign(card.dataset.detailHref);
      };

      card.addEventListener('click', (event) => {
        if (!this.isDesktopActive()) return;
        if (event.target.closest('a, button, input, textarea, select, label')) return;
        goToDetail();
      });

      card.addEventListener('keydown', (event) => {
        if (!this.isDesktopActive()) return;
        if (event.key !== 'Enter' && event.key !== ' ') return;
        if (event.target.closest('a, button, input, textarea, select, label')) return;
        event.preventDefault();
        goToDetail();
      });

      card.dataset.cardLinkInit = '1';
    },

    isDesktopActive() {
      return Boolean(this.mq && this.mq.matches);
    },

    applyViewportState() {
      const active = this.isDesktopActive();
      this.cards.forEach((card) => {
        if (!card.dataset.detailHref) return;

        card.classList.toggle('project-card--desktop-link', active);
        if (active) {
          card.setAttribute('role', 'link');
          card.setAttribute('tabindex', '0');
          card.setAttribute('aria-label', card.dataset.detailLabel);
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
