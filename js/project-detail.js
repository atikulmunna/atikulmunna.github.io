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

      // Turn GitHub's mermaid placeholders into real, rendered diagrams.
      renderMermaid(prepareMermaid(mount));
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
