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

      // Open README links in a new tab; keep in-page anchors local.
      mount.querySelectorAll('a[href]').forEach((a) => {
        const href = a.getAttribute('href') || '';
        if (!href.startsWith('#')) {
          a.setAttribute('target', '_blank');
          a.setAttribute('rel', 'noopener');
        }
      });
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
