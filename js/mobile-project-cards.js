/**
 * Mobile Project Cards
 * Collapses project details on mobile and allows per-card expansion.
 */
(function () {
  const MOBILE_QUERY = '(max-width: 767px)';

  const MobileProjectCards = {
    cards: [],
    mq: null,

    init() {
      this.cards = Array.from(document.querySelectorAll('.project-card'));
      if (!this.cards.length) return;

      this.mq = window.matchMedia(MOBILE_QUERY);
      this.cards.forEach((card) => this.setupCard(card));

      this.applyViewportState();
      this.bindViewportListener();
    },

    setupCard(card) {
      if (card.dataset.mobileCardInit === '1') return;

      const links = card.querySelector('.project-card__links');
      if (!links) return;

      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'btn btn--small btn--glass project-card__toggle';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = '+ details';

      toggle.addEventListener('click', () => {
        const expanded = card.classList.toggle('is-expanded');
        toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        toggle.textContent = expanded ? '- details' : '+ details';
      });

      links.prepend(toggle);
      card.dataset.mobileCardInit = '1';
    },

    applyViewportState() {
      const isMobile = this.mq.matches;

      this.cards.forEach((card) => {
        const toggle = card.querySelector('.project-card__toggle');
        if (isMobile) {
          card.classList.add('project-card--compact');
          card.classList.remove('is-expanded');
          if (toggle) {
            toggle.hidden = false;
            toggle.setAttribute('aria-expanded', 'false');
            toggle.textContent = '+ details';
          }
        } else {
          card.classList.remove('project-card--compact', 'is-expanded');
          if (toggle) {
            toggle.hidden = true;
            toggle.setAttribute('aria-expanded', 'false');
            toggle.textContent = '+ details';
          }
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
    document.addEventListener('DOMContentLoaded', () => MobileProjectCards.init());
  } else {
    MobileProjectCards.init();
  }

  if (typeof window !== 'undefined') {
    window.MobileProjectCards = MobileProjectCards;
  }
})();
