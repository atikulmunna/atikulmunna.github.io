# Atikul Munna Portfolio

Production-ready personal portfolio built with semantic HTML, modular CSS, and vanilla JavaScript.

## Stack

- HTML5 + ARIA-first semantics
- CSS custom properties + mobile-first layout system
- Vanilla JS modules for navigation, animation, image handling, and progressive enhancement
- Jest for unit/property tests
- Playwright for cross-browser E2E

## Architecture

### Frontend modules

- `js/navigation.js`
  - sticky nav behavior
  - active-section highlighting (IntersectionObserver)
  - mobile menu toggle
  - smooth scrolling
- `js/animations.js`
  - viewport-based reveal animations
  - reduced-motion handling
  - liquid-reactive pointer effects
- `js/image-loader.js`
  - lazy-load fallback handling
  - broken-image placeholder behavior
- `js/experience-toggle.js`
  - disclosure toggles for experience details
  - ARIA-expanded synchronization
- `js/main.js`
  - app bootstrap
  - feature detection (`backdrop-filter`)
  - fault-tolerant module initialization

### Styling layers

- `css/variables.css`: design tokens (palette, spacing, typography, transitions)
- `css/reset.css`: baseline normalization
- `css/base.css`: typography and base element rules
- `css/layout.css`: container and grid systems
- `css/components.css`: reusable components (cards, buttons, tags)
- `css/glassmorphism.css`: blur/transparency utilities and fallbacks
- `css/sections.css`: section-level composition and responsive tuning

## Project layout

```text
.
├── index.html
├── css/
├── js/
├── assets/
│   ├── images/
│   └── icons/
├── scripts/
│   ├── build-assets.js
│   ├── optimize-images.js
│   ├── performance-audit.js
│   ├── validate-html.js
│   └── validate-css.js
├── tests/
│   ├── unit/
│   ├── properties/
│   └── e2e/
└── playwright.config.js
```

## Local development

```bash
npm install
npx http-server . -p 4173 -c-1 -s
```

Open `http://127.0.0.1:4173`.

## Validation and quality gates

### Unit + property tests

```bash
npm test -- --runInBand
```

### Cross-browser E2E

```bash
npm run test:e2e
```

### HTML/CSS validation

```bash
npm run validate
```

### Performance audit

```bash
npm run audit:performance
```

## Production build

```bash
npm run build:prod
```

Outputs:

- `dist/css/*.min.css`
- `dist/js/*.min.js`
- `dist/index.html` (rewired to minified assets)
- `dist/assets/images` (optimized originals + `.webp` variants)

## Deployment

Primary deployment target is GitHub Pages user site:

- Repository: `atikulmunna/atikulmunna.github.io`
- URL: `https://atikulmunna.github.io/`
- Source: `main` branch, root directory
