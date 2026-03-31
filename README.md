# Atikul Islam Munna Portfolio

Personal portfolio site for [atikulmunna.github.io](https://atikulmunna.github.io/), built as a static frontend with modular CSS, vanilla JavaScript and an automated validation pipeline. The project is intentionally lightweight: no framework runtime, no client-side hydration cost and no build step required for local iteration unless you want optimized production assets.

## Technical Overview

- Semantic HTML5 structure with ARIA-aware navigation, disclosures and interactive controls
- Mobile-first CSS architecture split into tokens, base, layout, components, glass effects and section-specific composition
- Vanilla JavaScript modules for navigation, hero behavior, image loading, experience disclosures, theme toggling and mobile project-card interactions
- Progressive enhancement for `backdrop-filter`, reduced-motion handling and browser-specific fallback hooks
- Static deployment to GitHub Pages from the `main` branch

## Frontend Architecture

### HTML entrypoint

- `index.html`
  - Owns all portfolio content sections: hero, about, education, experience, tools, projects, research and contact
  - Wires versioned CSS and JS assets
  - Keeps the content model simple so updates remain low-friction

### CSS layers

- `css/variables.css`
  - Design tokens for palette, spacing, radius, typography, shadows and transitions
- `css/reset.css`
  - Baseline reset and normalization
- `css/base.css`
  - Global typography, body defaults and base element styling
- `css/layout.css`
  - Containers, section spacing and responsive layout primitives
- `css/components.css`
  - Shared UI primitives such as buttons, cards and tags
- `css/glassmorphism.css`
  - Frosted-glass utilities and fallback behavior
- `css/sections.css`
  - Section-specific implementation for navigation, hero, experience, projects, research, contact and mobile adaptations
- `css/theme-light.css`
  - Light-mode overrides layered on top of the default dark presentation

### JavaScript modules

- `js/main.js`
  - Bootstraps the app, performs feature detection and initializes modules with graceful failure handling
- `js/navigation.js`
  - Sticky navigation, active-section tracking, smooth scrolling and mobile menu behavior
- `js/animations.js`
  - Scroll-triggered reveal logic, reduced-motion fallback and liquid pointer-reactive effects
- `js/hero-contribution-grid.js`
  - Hero background animation logic
- `js/hero-typing.js`
  - Hero text sequencing and typing effects
- `js/image-loader.js`
  - Lazy-loading support and image fallback handling
- `js/experience-toggle.js`
  - Expand/collapse logic for experience details with ARIA sync
- `js/skills-marquee.js`
  - Infinite motion behavior for the tools-and-technologies section
- `js/theme-toggle.js`
  - Light/dark theme switching
- `js/mobile-project-cards.js`
  - Compact mobile project cards with expandable details

## Quality Pipeline

This repo treats a static portfolio like a software project rather than a single page mockup.

- Jest unit tests cover navigation, hero behavior, card/button systems, accessibility hooks and module behavior
- Property tests validate palette constraints, responsive rules, contrast, animation limits, semantic structure and glassmorphism consistency
- Playwright is configured for browser-level E2E coverage
- HTML and CSS validators run as standalone checks
- Production asset generation includes JS/CSS minification and image optimization with WebP variants

## Local Development

Install dependencies:

```bash
npm install
```

Run a local static server:

```bash
npx http-server . -p 4173 -c-1 -s
```

Open `http://127.0.0.1:4173`.

## Useful Commands

Validate markup and styles:

```bash
npm run validate
```

Run the full Jest suite:

```bash
npm test -- --runInBand
```

Run cross-browser E2E:

```bash
npm run test:e2e
```

Generate optimized production assets:

```bash
npm run build:prod
```

Refresh asset version query strings after frontend changes:

```bash
npm run version:assets
```

Run the performance audit helper:

```bash
npm run audit:performance
```

## Production Output

`npm run build:prod` produces:

- `dist/index.html`
- `dist/css/*.min.css`
- `dist/js/*.min.js`
- optimized images in `dist/assets/images`
- generated `.webp` variants for PNG/JPG assets

## Deployment

- GitHub Pages user-site repository: `atikulmunna/atikulmunna.github.io`
- Deployment target: `main` branch, repository root
- Live URL: `https://atikulmunna.github.io/`

## Updating Content

- Portfolio content changes usually happen in `index.html`
- Project screenshots and icons live under `assets/images` and `assets/icons`
- Visual refinements are usually in `css/sections.css` and `css/components.css`
- Local editing notes are kept in `LOCAL_EDITING_GUIDE.md` and should remain uncommitted
