/**
 * Project card tech-stack popover.
 *
 * On desktop/tablet the additional-project cards drop their inline tag list and
 * expose it behind a small info button pinned to the thumbnail's top-right; the
 * tags surface in a liquid-glass popover on hover (pointer), focus (keyboard) or
 * tap/click (touch). On mobile we leave the cards as they were: tags stay inline
 * (revealed by the per-card "+ details" toggle) and no info button is shown.
 * Featured cards always keep their tags inline. Progressive enhancement: with JS
 * disabled the tags stay inline everywhere, so nothing is lost.
 */
(function () {
  const MOBILE_QUERY = '(max-width: 767px)';
  const OPEN_CLASS = 'is-tags-open';
  let uid = 0;

  const ProjectCardTags = {
    entries: [],
    mq: null,
    globalBound: false,

    init() {
      const cards = Array.from(document.querySelectorAll('.project-card'));
      cards.forEach((card) => this.setupCard(card));
      if (!this.entries.length) return;

      this.mq = window.matchMedia(MOBILE_QUERY);
      this.applyViewportState();
      this.bindViewport();
      this.bindGlobal();
    },

    setupCard(card) {
      if (card.dataset.tagInfoInit === '1') return;

      // Featured cards keep their tags inline (no info button); the popover is
      // only for the denser additional-project cards.
      if (card.classList.contains('project-card--featured')) return;

      const tagsEl = card.querySelector('.project-card__tags');
      const image = card.querySelector('.project-card__image');
      if (!tagsEl || !image) return;

      const tags = Array.from(tagsEl.querySelectorAll('.tag'));
      if (!tags.length) return;

      const popId = `project-tags-${++uid}`;
      const title = (card.querySelector('.project-card__title')?.textContent || '').trim();

      const wrap = document.createElement('div');
      wrap.className = 'project-card__info';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'project-card__info-btn';
      btn.setAttribute('aria-label', title ? `Show tech stack for ${title}` : 'Show tech stack');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-controls', popId);
      btn.innerHTML =
        '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">' +
        '<circle cx="8" cy="3.4" r="1.45" fill="currentColor"></circle>' +
        '<rect x="6.65" y="5.8" width="2.7" height="7.2" rx="1.35" fill="currentColor"></rect>' +
        '</svg>';

      const pop = document.createElement('div');
      pop.className = 'project-card__info-pop';
      pop.id = popId;
      pop.setAttribute('role', 'group');
      pop.setAttribute('aria-label', title ? `${title} tech stack` : 'Tech stack');

      const list = document.createElement('div');
      list.className = 'project-card__info-tags';
      pop.appendChild(list);

      wrap.appendChild(btn);
      wrap.appendChild(pop);

      // The card is position:relative, so the absolutely positioned wrapper
      // anchors to the thumbnail's top-right without being clipped by the
      // thumbnail's own overflow:hidden.
      card.appendChild(wrap);

      const setOpen = (open) => {
        wrap.classList.toggle(OPEN_CLASS, open);
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      };

      btn.addEventListener('click', (event) => {
        event.stopPropagation();
        setOpen(!wrap.classList.contains(OPEN_CLASS));
      });

      // Keep interactions inside the popover from bubbling to the card, which
      // is itself a link to the detail page on desktop.
      wrap.addEventListener('click', (event) => event.stopPropagation());
      wrap.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          setOpen(false);
          btn.focus();
        }
        event.stopPropagation();
      });

      this.entries.push({ tagsEl, wrap, list, tags, setOpen });
      card.dataset.tagInfoInit = '1';
    },

    // Desktop/tablet: tags live in the popover, inline list hidden, button shown.
    enablePopover(entry) {
      entry.tags.forEach((tag) => entry.list.appendChild(tag));
      entry.tagsEl.hidden = true;
      entry.wrap.hidden = false;
    },

    // Mobile: tags back inline (behind "+ details"), button + popover removed.
    disablePopover(entry) {
      entry.setOpen(false);
      entry.tags.forEach((tag) => entry.tagsEl.appendChild(tag));
      entry.tagsEl.hidden = false;
      entry.wrap.hidden = true;
    },

    applyViewportState() {
      const mobile = Boolean(this.mq && this.mq.matches);
      this.entries.forEach((entry) => {
        if (mobile) {
          this.disablePopover(entry);
        } else {
          this.enablePopover(entry);
        }
      });
    },

    bindViewport() {
      const handler = () => this.applyViewportState();
      if (typeof this.mq.addEventListener === 'function') {
        this.mq.addEventListener('change', handler);
      } else if (typeof this.mq.addListener === 'function') {
        this.mq.addListener(handler);
      }
    },

    bindGlobal() {
      if (this.globalBound) return;
      this.globalBound = true;

      document.addEventListener('click', (event) => {
        this.entries.forEach(({ wrap, setOpen }) => {
          if (wrap.classList.contains(OPEN_CLASS) && !wrap.contains(event.target)) {
            setOpen(false);
          }
        });
      });

      document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        this.entries.forEach(({ wrap, setOpen }) => {
          if (wrap.classList.contains(OPEN_CLASS)) setOpen(false);
        });
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ProjectCardTags.init());
  } else {
    ProjectCardTags.init();
  }

  if (typeof window !== 'undefined') {
    window.ProjectCardTags = ProjectCardTags;
  }
})();
