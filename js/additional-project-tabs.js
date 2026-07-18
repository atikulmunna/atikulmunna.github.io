/**
 * Additional Projects desktop tabs.
 * Desktop: group additional projects into category tabs.
 * Tablet/mobile: keep the original flat grid and mobile reveal behavior.
 */
(function () {
  const DESKTOP_QUERY = '(min-width: 1024px)';

  const CATEGORY_ORDER = [
    { key: 'ai-systems', label: 'AI Systems' },
    { key: 'developer-tools', label: 'Developer Tools' },
    { key: 'systems-infra', label: 'Systems & Infra' },
    { key: 'full-stack', label: 'Full-Stack' },
    { key: 'mobile-edge', label: 'Mobile & Edge' },
    { key: 'research', label: 'Research' }
  ];

  const TITLE_TO_CATEGORY = {
    'Ledgerly Invoice Processor': 'ai-systems',
    'DevLens: GitHub Repository Intelligence': 'ai-systems',
    'Multi-Step Research Assistant Platform': 'ai-systems',
    'SourceCast: Evidence-Grounded Media Research Workspace': 'ai-systems',
    'Predictive Maintenance MLOps Platform': 'ai-systems',
    'Realtime Fraud Detection Pipeline': 'ai-systems',

    'Dataset Quality Analyzer (DQA)': 'developer-tools',
    'Loom: Log-Observer & Monitor': 'developer-tools',
    'dgvis: Dependency Graph Visualizer': 'developer-tools',
    'Complexity Lens': 'developer-tools',

    'VaultCLI': 'systems-infra',
    'WebTorrent P2P Stream App': 'systems-infra',
    'COWFS: Copy-on-Write Filesystem': 'systems-infra',
    'TraceBack: Explainable Backup & Restore Tool': 'systems-infra',
    'High-Throughput Distributed File Service': 'systems-infra',

    'CivicFix: Community Issue Reporting Platform': 'full-stack',
    'Decision Archaeology': 'full-stack',

    'NativeNote: Offline AI Notepad': 'mobile-edge',
    'Resolve: Habit Streak Timer': 'mobile-edge',

    'Federated Learning with Differential Privacy': 'research',
    'Anomaly-Aware Probabilistic Forecasting for Multivariate Time Series': 'research',
    'Cross-Chain AI Provenance Verification': 'research'
  };

  const AdditionalProjectTabs = {
    section: null,
    tabsMount: null,
    mobileFiltersMount: null,
    sourceGrid: null,
    mq: null,
    mobileMq: null,
    cards: [],
    panels: {},
    tabButtons: {},
    mobileFilterButtons: {},
    activeKey: CATEGORY_ORDER[0].key,
    activeMobileKey: CATEGORY_ORDER[0].key,
    initialized: false,
    mobileFiltersInitialized: false,

    init() {
      this.section = document.getElementById('projects');
      if (!this.section) return;

      this.tabsMount = this.section.querySelector('[data-project-tabs]');
      this.mobileFiltersMount = this.section.querySelector('[data-project-mobile-filters]');
      this.sourceGrid = this.section.querySelector('[data-project-additional-grid]');
      if (!this.tabsMount || !this.sourceGrid) return;

      this.cards = Array.from(this.sourceGrid.querySelectorAll('.project-card'));
      this.mq = window.matchMedia(DESKTOP_QUERY);
      this.mobileMq = window.matchMedia('(max-width: 767px)');

      this.applyViewportState();
      this.bindViewportListener();
    },

    buildTabs() {
      if (this.initialized) return;

      this.tabsMount.innerHTML = '';
      this.tabsMount.hidden = false;

      const rail = document.createElement('div');
      rail.className = 'projects-tabs__rail';
      rail.setAttribute('role', 'tablist');
      rail.setAttribute('aria-label', 'Additional project categories');

      const panels = document.createElement('div');
      panels.className = 'projects-tabs__panels';

      CATEGORY_ORDER.forEach((category, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'projects-tabs__tab';
        button.id = `projects-tab-${category.key}`;
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-controls', `projects-panel-${category.key}`);
        button.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
        button.setAttribute('tabindex', index === 0 ? '0' : '-1');
        button.textContent = category.label;
        button.addEventListener('click', () => this.setActiveTab(category.key));
        rail.appendChild(button);
        this.tabButtons[category.key] = button;

        const panel = document.createElement('section');
        panel.className = 'projects-tabs__panel';
        panel.id = `projects-panel-${category.key}`;
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', button.id);
        panel.hidden = index !== 0;

        const grid = document.createElement('div');
        grid.className = 'projects-grid';
        panel.appendChild(grid);
        panels.appendChild(panel);
        this.panels[category.key] = grid;
      });

      this.tabsMount.appendChild(rail);
      this.tabsMount.appendChild(panels);
      this.initialized = true;
    },

    buildMobileFilters() {
      if (this.mobileFiltersInitialized || !this.mobileFiltersMount) return;

      this.mobileFiltersMount.innerHTML = '';

      const list = document.createElement('div');
      list.className = 'projects-mobile-filters__list';
      list.setAttribute('role', 'group');
      list.setAttribute('aria-label', 'Project categories');

      CATEGORY_ORDER.forEach((category, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'projects-mobile-filter';
        button.dataset.projectMobileFilter = category.key;
        button.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');

        const check = document.createElement('span');
        check.className = 'projects-mobile-filter__check';
        check.setAttribute('aria-hidden', 'true');

        const label = document.createElement('span');
        label.className = 'projects-mobile-filter__label';
        label.textContent = category.label;

        button.appendChild(check);
        button.appendChild(label);
        button.addEventListener('click', () => this.setMobileCategory(category.key));

        list.appendChild(button);
        this.mobileFilterButtons[category.key] = button;
      });

      this.mobileFiltersMount.appendChild(list);
      this.mobileFiltersInitialized = true;
    },

    getCategoryForCard(card) {
      const title = card.querySelector('.project-card__title')?.textContent?.trim() || '';
      return TITLE_TO_CATEGORY[title] || 'developer-tools';
    },

    moveCardsToPanels() {
      this.cards.forEach((card) => {
        const category = this.getCategoryForCard(card);
        const targetGrid = this.panels[category];
        if (targetGrid) {
          targetGrid.appendChild(card);
        }
      });
    },

    restoreCardsToGrid() {
      this.cards.forEach((card) => {
        this.sourceGrid.appendChild(card);
      });
    },

    setActiveTab(categoryKey) {
      this.activeKey = categoryKey;

      Object.keys(this.tabButtons).forEach((key) => {
        const isActive = key === categoryKey;
        const button = this.tabButtons[key];
        button.setAttribute('aria-selected', isActive ? 'true' : 'false');
        button.setAttribute('tabindex', isActive ? '0' : '-1');
      });

      Object.keys(this.panels).forEach((key) => {
        const panelGrid = this.panels[key];
        const panel = panelGrid?.parentElement;
        if (panel) {
          panel.hidden = key !== categoryKey;
        }
      });
    },

    setMobileCategory(categoryKey) {
      this.activeMobileKey = categoryKey;

      Object.keys(this.mobileFilterButtons).forEach((key) => {
        this.mobileFilterButtons[key].setAttribute(
          'aria-pressed',
          key === categoryKey ? 'true' : 'false'
        );
      });

      this.cards.forEach((card) => {
        card.hidden = this.getCategoryForCard(card) !== categoryKey;
      });
    },

    enableDesktopTabs() {
      this.buildTabs();
      this.moveCardsToPanels();
      this.tabsMount.classList.add('is-enhanced');
      this.tabsMount.hidden = false;
      this.sourceGrid.hidden = true;
      if (this.mobileFiltersMount) {
        this.mobileFiltersMount.hidden = true;
      }
      this.cards.forEach((card) => {
        card.hidden = false;
      });
      this.setActiveTab(this.activeKey);
    },

    disableDesktopTabs() {
      this.restoreCardsToGrid();
      this.tabsMount.classList.remove('is-enhanced');
      this.tabsMount.hidden = true;
      this.sourceGrid.hidden = false;

      if (this.mobileMq?.matches) {
        this.buildMobileFilters();
        if (this.mobileFiltersMount) {
          this.mobileFiltersMount.hidden = !this.section.classList.contains('projects--mobile-expanded');
        }
        this.setMobileCategory(this.activeMobileKey);
      } else {
        if (this.mobileFiltersMount) {
          this.mobileFiltersMount.hidden = true;
        }
        this.cards.forEach((card) => {
          card.hidden = false;
        });
      }
    },

    applyViewportState() {
      if (this.mq?.matches) {
        this.enableDesktopTabs();
      } else {
        this.disableDesktopTabs();
      }
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
    document.addEventListener('DOMContentLoaded', () => AdditionalProjectTabs.init());
  } else {
    AdditionalProjectTabs.init();
  }

  if (typeof window !== 'undefined') {
    window.AdditionalProjectTabs = AdditionalProjectTabs;
  }
})();
