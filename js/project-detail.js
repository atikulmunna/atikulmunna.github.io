/**
 * Project detail page
 * Reads ?repo=<slug>, loads the pre-rendered README from
 * assets/readmes/<slug>.js (which registers the HTML on window.__READMES via a
 * <script> tag — works over file:// and https, unlike fetch), injects it, wires
 * the "View Code on GitHub" button, and derives the page title. The README HTML
 * is produced and sanitized by the GitHub API at build time, so it is safe to inject.
 */
(function () {
  const OWNER = 'atikulmunna';
  const RAW_BASE = 'https://raw.githubusercontent.com';
  const BLOB_BASE = 'https://github.com';
  const MERMAID_SRC = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js';

  // A URL that already points somewhere (absolute, protocol-relative, data:,
  // mailto:) or is an in-page anchor — anything we should NOT treat as a
  // repo-relative path.
  function isExternal(url) {
    return /^([a-z][a-z0-9+.-]*:)?\/\//i.test(url) ||
      url.startsWith('data:') ||
      url.startsWith('mailto:') ||
      url.startsWith('#');
  }

  function repoPath(url) {
    return url.replace(/^\.?\//, '');
  }

  function getRepo() {
    try {
      const repo = new URLSearchParams(window.location.search).get('repo') || '';
      // Only allow plain repo-name characters.
      return /^[A-Za-z0-9._-]+$/.test(repo) ? repo : '';
    } catch (error) {
      return '';
    }
  }

  function prettify(slug) {
    return slug
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();
  }

  function setText(selector, text) {
    const el = document.querySelector(selector);
    if (el) el.textContent = text;
  }

  // README HTML from the GitHub API uses repo-relative URLs for images and
  // links (e.g. src="assets/demo.png", href="docs/architecture.md"). Those
  // 404 on this site, so point images at raw.githubusercontent.com and links
  // at the repo's blob view. In-page anchors (#…) and already-absolute URLs
  // are left alone.
  function rewriteAssets(mount, repo) {
    mount.querySelectorAll('img[src]').forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (src && !isExternal(src)) {
        img.setAttribute('src', `${RAW_BASE}/${OWNER}/${repo}/HEAD/${repoPath(src)}`);
      }
      img.setAttribute('loading', 'lazy');
    });

    mount.querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute('href') || '';
      if (href.startsWith('#')) return; // in-page anchor stays local
      if (!isExternal(href)) {
        a.setAttribute('href', `${BLOB_BASE}/${OWNER}/${repo}/blob/HEAD/${repoPath(href)}`);
      }
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
    });
  }

  // GitHub prefixes every heading's anchor id with `user-content-` (e.g.
  // id="user-content-install") and hangs it on a hidden permalink <a>, while
  // table-of-contents links point at the bare `#install`. Nothing bridges that
  // gap off github.com, so the links go nowhere. Copy the de-prefixed id onto
  // the visible heading wrapper so native fragment navigation resolves.
  function fixHeadingAnchors(mount) {
    const used = new Set();
    mount.querySelectorAll('.markdown-heading').forEach((heading) => {
      const anchor = heading.querySelector('a.anchor[id^="user-content-"]');
      if (!anchor) return;
      const id = anchor.id.replace(/^user-content-/, '');
      if (!id || used.has(id)) return;
      used.add(id);
      heading.id = id;
    });
  }

  // GitHub ships mermaid diagrams as "needs enrichment" placeholders that only
  // its own frontend renders. Swap each for a real .mermaid node carrying the
  // diagram source (kept verbatim in the placeholder's data-plain attribute),
  // then let mermaid render them. The source stays visible as a code block
  // until (and unless) mermaid processes it, so a failed/blocked load degrades
  // to readable text instead of an endless spinner.
  function prepareMermaid(mount) {
    const sections = mount.querySelectorAll(
      'section.js-render-needs-enrichment[data-type="mermaid"]'
    );
    const nodes = [];
    sections.forEach((section) => {
      const target = section.querySelector('.js-render-enrichment-target');
      const pre = section.querySelector('pre');
      const code = (
        (target && target.getAttribute('data-plain')) ||
        (pre && pre.textContent) ||
        ''
      ).trim();
      if (!code) return;

      const holder = document.createElement('div');
      holder.className = 'readme-mermaid';
      const graph = document.createElement('div');
      graph.className = 'mermaid';
      graph.textContent = code;
      holder.appendChild(graph);
      section.replaceWith(holder);
      nodes.push(graph);
    });
    return nodes;
  }

  function loadMermaid() {
    return new Promise((resolve, reject) => {
      if (window.mermaid) {
        resolve(window.mermaid);
        return;
      }
      const script = document.createElement('script');
      script.src = MERMAID_SRC;
      script.onload = () =>
        window.mermaid ? resolve(window.mermaid) : reject(new Error('mermaid missing'));
      script.onerror = () => reject(new Error('mermaid failed to load'));
      document.head.appendChild(script);
    });
  }

  async function renderMermaid(nodes) {
    if (!nodes.length) return;
    try {
      const mermaid = await loadMermaid();
      const light = document.body.classList.contains('theme-light');
      // Per-diagram frontmatter (e.g. `theme: redux`) overrides this default.
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: light ? 'default' : 'dark'
      });
      await mermaid.run({ nodes });
    } catch (_err) {
      // Leave the raw source visible (it already renders as a code block via
      // the :not([data-processed]) styling) — better than a hidden diagram.
    }
  }

  // Render any not-yet-rendered mermaid diagrams inside a freshly shown view.
  function revealMermaidIn(view) {
    if (!view) return;
    const nodes = Array.from(
      view.querySelectorAll('.mermaid:not([data-processed="true"])')
    );
    if (nodes.length) renderMermaid(nodes);
  }

  // Turn a heading label into a fallback anchor id when GitHub did not leave
  // one behind (e.g. a heading with no permalink).
  function slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-') || 'section';
  }

  // Build the left-hand section navigation from the README's own headings.
  // The first heading is the project title (already shown in the page head), so
  // the content above the first real section is grouped under a "Home" entry.
  // Primary sections come from the shallowest heading level present; the next
  // level down is shown indented. Deeper headings are ignored to keep the rail
  // scannable. Returns true when a nav was built.
  function buildSideNav(mount, aside) {
    if (!aside) return false;
    const list = aside.querySelector('[data-project-nav-list]');
    if (!list) return false;

    const wraps = Array.from(mount.querySelectorAll('.markdown-heading')).filter(
      (wrap) => wrap.querySelector('h1, h2, h3, h4, h5, h6')
    );

    // Everything after the leading title heading is a candidate section.
    const rest = wraps.slice(1).map((wrap) => {
      const heading = wrap.querySelector('h1, h2, h3, h4, h5, h6');
      return {
        wrap,
        level: Number(heading.tagName.charAt(1)),
        text: heading.textContent.trim()
      };
    });
    if (!rest.length) return false;

    const baseLevel = Math.min(...rest.map((h) => h.level));
    const sections = rest.filter(
      (h) => h.level === baseLevel || h.level === baseLevel + 1
    );
    if (!sections.length) return false;

    const container = wraps[0].parentElement;
    const primaryWraps = new Set(
      sections.filter((s) => s.level === baseLevel).map((s) => s.wrap)
    );

    const usedIds = new Set();
    const items = [];

    // Home: the intro content that sits above the first section.
    const homeLink = document.createElement('a');
    homeLink.className = 'project-nav__link project-nav__link--home is-active';
    homeLink.href = '#main-content';
    homeLink.textContent = 'Home';
    list.appendChild(homeLink);
    items.push({ link: homeLink, sectionId: 'home', anchorId: null, isSub: false });

    let currentPrimaryId = 'home';
    sections.forEach((section) => {
      let id = section.wrap.id;
      if (!id || usedIds.has(id)) {
        let candidate = slugify(section.text);
        let n = 2;
        while (usedIds.has(candidate) || document.getElementById(candidate)) {
          candidate = `${slugify(section.text)}-${n++}`;
        }
        id = candidate;
        section.wrap.id = id;
      }
      usedIds.add(id);

      const isSub = section.level === baseLevel + 1;
      if (!isSub) currentPrimaryId = id;

      const link = document.createElement('a');
      link.className = 'project-nav__link';
      if (isSub) link.classList.add('project-nav__link--sub');
      link.href = `#${id}`;
      link.textContent = section.text;
      list.appendChild(link);
      items.push({
        link,
        sectionId: isSub ? currentPrimaryId : id,
        anchorId: id,
        isSub
      });
    });

    // Split the flat README into one view per primary section (plus the intro
    // "home" view) so a click can reveal just that section instead of scrolling
    // through the whole document.
    const sectionEls = {};
    const groups = [{ id: 'home', nodes: [] }];
    Array.from(container.children).forEach((child) => {
      if (primaryWraps.has(child)) {
        groups.push({ id: child.id, nodes: [] });
      }
      groups[groups.length - 1].nodes.push(child);
    });
    groups.forEach((group) => {
      const view = document.createElement('div');
      view.className = 'readme-section';
      view.dataset.sectionId = group.id;
      group.nodes.forEach((node) => view.appendChild(node));
      container.appendChild(view);
      sectionEls[group.id] = view;
    });

    wireSideNav(aside, items, sectionEls, mount);
    aside.hidden = false;
    return true;
  }

  function wireSideNav(aside, items, sectionEls, mount) {
    const toggle = aside.querySelector('[data-project-nav-toggle]');
    const toggleLabel = toggle && toggle.querySelector('.project-nav__toggle-label');
    const mq = window.matchMedia('(max-width: 1023px)');

    function showSection(sectionId) {
      Object.keys(sectionEls).forEach((id) => {
        sectionEls[id].hidden = id !== sectionId;
      });
      // Diagrams cannot be measured while their section is hidden, so render
      // them the first time the section becomes visible.
      revealMermaidIn(sectionEls[sectionId]);
    }

    function setActive(activeItem) {
      items.forEach((item) => {
        item.link.classList.toggle('is-active', item === activeItem);
      });
      if (toggleLabel) toggleLabel.textContent = activeItem.link.textContent;
    }

    items.forEach((item) => {
      item.link.addEventListener('click', (event) => {
        event.preventDefault();
        showSection(item.sectionId);
        setActive(item);
        // A sub-heading scrolls to its spot inside the now-visible section;
        // everything else just starts at the top of the page.
        if (item.isSub) {
          const anchor = document.getElementById(item.anchorId);
          if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'auto' });
        }
        if (mq.matches && aside.classList.contains('is-open')) {
          aside.classList.remove('is-open');
          if (toggle) toggle.setAttribute('aria-expanded', 'false');
        }
      });
    });

    // The README's own links (its table of contents, cross-references) target
    // heading ids that may sit inside a hidden section. Reveal the containing
    // section before honoring the jump.
    mount.addEventListener('click', (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link || !mount.contains(link)) return;
      const id = decodeURIComponent(link.getAttribute('href').slice(1));
      const target = id && document.getElementById(id);
      const view = target && target.closest('.readme-section');
      if (!view) return;
      event.preventDefault();
      showSection(view.dataset.sectionId);
      const match =
        items.find((item) => item.anchorId === id) ||
        items.find((item) => item.sectionId === view.dataset.sectionId && !item.isSub) ||
        items[0];
      setActive(match);
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    if (toggle) {
      toggle.addEventListener('click', () => {
        const open = aside.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    // Start on Home.
    showSection('home');
  }

  function loadReadme(repo) {
    return new Promise((resolve, reject) => {
      if (window.__READMES && typeof window.__READMES[repo] === 'string') {
        resolve(window.__READMES[repo]);
        return;
      }
      const script = document.createElement('script');
      script.src = `assets/readmes/${repo}.js`;
      script.onload = () => {
        if (window.__READMES && typeof window.__READMES[repo] === 'string') {
          resolve(window.__READMES[repo]);
        } else {
          reject(new Error('README data missing'));
        }
      };
      script.onerror = () => reject(new Error('README failed to load'));
      document.head.appendChild(script);
    });
  }

  async function init() {
    const repo = getRepo();
    const mount = document.querySelector('[data-readme-mount]');
    const githubBtn = document.querySelector('[data-github-link]');

    if (!repo) {
      if (mount) {
        mount.innerHTML =
          '<p class="readme__empty">No project selected. Head back to the ' +
          '<a href="index.html#projects">projects</a>.</p>';
      }
      return;
    }

    const repoUrl = `https://github.com/${OWNER}/${repo}`;
    if (githubBtn) githubBtn.href = repoUrl;

    const fallbackTitle = prettify(repo);
    setText('[data-project-title]', fallbackTitle);
    document.title = `${fallbackTitle} — Atikul Islam Munna`;

    try {
      mount.innerHTML = await loadReadme(repo);

      // Prefer the README's own top heading as the page title.
      const heading = mount.querySelector('h1, h2');
      if (heading && heading.textContent.trim()) {
        const title = heading.textContent.trim();
        setText('[data-project-title]', title);
        document.title = `${title} — Atikul Islam Munna`;
      }

      // Repoint repo-relative images/links and open external links in a new
      // tab (keeping in-page anchors local).
      rewriteAssets(mount, repo);

      // Make table-of-contents / in-page anchor links actually jump.
      fixHeadingAnchors(mount);

      // Turn GitHub's mermaid placeholders into real diagram nodes. They render
      // lazily when their section is first shown (a hidden node cannot be
      // measured), so only prepare them here.
      prepareMermaid(mount);

      // Build the left-hand section rail and split the README into per-section
      // views. This shows the Home view and renders its diagrams.
      buildSideNav(mount, document.querySelector('[data-project-nav]'));
    } catch (error) {
      mount.innerHTML =
        '<p class="readme__empty">This project’s README couldn’t be loaded. ' +
        `View it on <a href="${repoUrl}" target="_blank" rel="noopener">GitHub</a> instead.</p>`;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
