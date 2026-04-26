/**
 * Projects Archive Toggle
 * Collapses lower-priority projects behind a single toggle while preserving
 * a no-JS fallback where every project remains visible.
 */
(function () {
  const ProjectsArchiveToggle = {
    MOBILE_QUERY: '(max-width: 767px)',
    section: null,
    cards: [],
    toggle: null,
    mobileReveal: null,
    mobileRevealToggle: null,
    additionalTier: null,
    mq: null,
    expanded: false,
    mobileExpanded: false,

    init() {
      this.section = document.getElementById('projects');
      if (!this.section) return;

      this.cards = Array.from(
        this.section.querySelectorAll('[data-project-archive-item]')
      );
      this.toggle = this.section.querySelector('[data-project-archive-toggle]');
      this.mobileReveal = this.section.querySelector('[data-project-mobile-reveal]');
      this.mobileRevealToggle = this.section.querySelector('[data-project-mobile-reveal-toggle]');
      this.additionalTier = this.section.querySelector('[data-project-additional-tier]');
      this.mq = window.matchMedia(this.MOBILE_QUERY);

      if (!this.additionalTier) return;

      if (this.toggle && this.cards.length) {
        this.toggle.hidden = false;
        this.setExpanded(false);

        this.toggle.addEventListener('click', () => {
          this.setExpanded(!this.expanded);
        });
      }

      if (this.mobileReveal && this.mobileRevealToggle) {
        this.mobileReveal.hidden = false;
        this.mobileRevealToggle.addEventListener('click', () => {
          this.setMobileExpanded(!this.mobileExpanded);
        });
      }

      this.applyViewportState();
      this.bindViewportListener();
    },

    setExpanded(expanded) {
      this.expanded = expanded;

      this.cards.forEach((card) => {
        card.hidden = !expanded;
      });

      this.toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      this.toggle.textContent = expanded
        ? 'Show less'
        : 'Show more';

      this.section.classList.toggle('projects--archive-open', expanded);
    },

    setMobileExpanded(expanded) {
      this.mobileExpanded = expanded;

      if (this.additionalTier) {
        this.additionalTier.hidden = !expanded;
      }

      if (this.mobileRevealToggle) {
        this.mobileRevealToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        this.mobileRevealToggle.classList.toggle('is-open', expanded);

        const label = this.mobileRevealToggle.querySelector('.projects-mobile-reveal__label');
        if (label) {
          label.textContent = expanded ? 'Hide projects' : 'More projects';
        }
      }

      if (this.cards.length) {
        this.cards.forEach((card) => {
          card.hidden = !expanded;
        });
      }

      this.section.classList.toggle('projects--mobile-expanded', expanded);
    },

    applyViewportState() {
      const isMobile = this.mq?.matches;

      if (this.mobileReveal) {
        this.mobileReveal.hidden = !isMobile;
      }

      if (isMobile) {
        this.setMobileExpanded(false);
        if (this.toggle) {
          this.toggle.hidden = true;
        }
        return;
      }

      if (this.additionalTier) {
        this.additionalTier.hidden = false;
      }

      if (this.toggle && this.cards.length) {
        this.toggle.hidden = false;
        this.setExpanded(false);
      }

      this.section.classList.remove('projects--mobile-expanded');
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
    document.addEventListener('DOMContentLoaded', () => ProjectsArchiveToggle.init());
  } else {
    ProjectsArchiveToggle.init();
  }

  if (typeof window !== 'undefined') {
    window.ProjectsArchiveToggle = ProjectsArchiveToggle;
  }
})();
