# Atikul Islam Munna Portfolio

Personal portfolio for [aimunna.me](https://aimunna.me), built as a static GitHub Pages site with a monochrome liquid-glass design language, responsive project browsing, research highlights and device-aware performance tuning.

## Highlights

- Split hero with left-aligned intro and a glass "status" terminal that types out current work and availability, over a GitHub-style contribution grid and typing sequence
- Dark and light themes with persistent theme selection
- Responsive liquid-glass navigation with active-section tracking and mobile menu support
- Featured projects plus categorized project browsing for AI Systems, Backend & Systems, Mobile & Edge, Developer Tools and Research
- Desktop project tabs and mobile checkable category filters
- CSS-animated geometric thumbnails for research projects
- Research publications and a consolidated Works in Progress panel
- Expandable experience disclosures and compact mobile project cards
- Tools-and-technologies marquee and animated contact background
- Semantic HTML, ARIA-aware controls and reduced-motion support

## Performance Profiles

The site has two visual profiles:

- **Full mode** keeps the atmospheric liquid-glass presentation, blur layers and ambient motion.
- **Optimized mode** uses sharper solid-glass surfaces, fewer live blur layers, simplified decorative effects and lighter canvas rendering.

The optimized profile is selected conservatively. Privacy-preserving browsers that hide or round hardware information default to the full experience unless a strong low-resource signal is available.

Automatic optimized-mode signals:

- Save-Data enabled
- reported device memory of `2GB` or less
- mobile coarse-pointer device with reported memory of `4GB` or less and `4` CPU threads or fewer

The mode is decided once during startup and shared by all animation modules. This keeps behavior consistent across Chrome, Brave, Firefox, Safari and other privacy-focused browsers.

### Preview Flags

Force either profile locally or in production:

```txt
?perf=lite
?perf=full
```

Examples:

```txt
https://aimunna.me/?perf=lite
https://aimunna.me/?perf=full
```

Optimized mode shows a one-time dismissible notice and automatically hides it after five seconds.

The hero defaults to the split layout. Opt back to the classic centered hero with:

```txt
?hero=classic
```

### Edge Scroll Relief

Microsoft Edge receives a separate scroll-relief path rather than the optimized visual profile. During active scrolling, expensive live blur layers temporarily flatten and restore shortly after scrolling stops. This preserves the full design while reducing compositor pressure.

## Frontend Architecture

### HTML Entrypoint

- `index.html`
  - Owns the portfolio content and section structure
  - Wires versioned CSS and JavaScript assets
  - Bootstraps the shared performance-profile decision before animation modules initialize

### CSS Layers

- `css/variables.css`: palette, spacing, radius, typography, shadow and transition tokens
- `css/reset.css`: normalization
- `css/base.css`: global typography and base element rules
- `css/layout.css`: containers and responsive primitives
- `css/components.css`: reusable cards, buttons and tags
- `css/glassmorphism.css`: glass utilities and graceful fallbacks
- `css/sections.css`: navigation, hero, projects, research, experience, contact and performance-profile styling
- `css/theme-light.css`: light-theme overrides

### JavaScript Modules

- `js/main.js`: feature detection, performance-profile sync, Edge scroll relief and app initialization
- `js/navigation.js`: sticky navigation, active-section tracking, smooth scrolling and mobile menu behavior
- `js/animations.js`: reveal effects, pointer-reactive glass and reduced-motion handling
- `js/hero-contribution-grid.js`: animated hero contribution grid
- `js/hero-typing.js`: hero text sequence
- `js/skills-marquee.js`: tools-and-technologies marquee
- `js/additional-project-tabs.js`: desktop tabs and mobile project-category filters
- `js/mobile-project-cards.js`: expandable compact project cards on mobile
- `js/project-archive-toggle.js`: additional-project reveal behavior
- `js/experience-toggle.js`: ARIA-synced experience disclosures
- `js/contact-rain.js`: theme-aware contact background animation
- `js/image-loader.js`: lazy-loading and image fallback handling
- `js/theme-toggle.js`: persistent light/dark mode switching

## Local Development

Install dependencies:

```bash
npm install
```

Run a local static server:

```bash
npx http-server . -p 4173 -c-1 -s
```

Open:

```txt
http://127.0.0.1:4173
```

## Useful Commands

Validate markup and styles:

```bash
npm run validate
```

Run the Jest suite:

```bash
npm test -- --runInBand
```

Run browser-level E2E coverage:

```bash
npm run test:e2e
```

Run the performance audit helper:

```bash
npm run audit:performance
```

Generate optimized production assets:

```bash
npm run build:prod
```

Refresh asset query-string versions:

```bash
npm run version:assets
```

## Quality Pipeline

- Jest unit and property tests for navigation, accessibility hooks, responsive rules, palette constraints and animation behavior
- HTML and CSS validation scripts
- Playwright cross-browser E2E configuration
- Minification and image-optimization checks
- Performance audit helper

## Production Output

`npm run build:prod` generates:

- `dist/index.html`
- `dist/css/*.min.css`
- `dist/js/*.min.js`
- optimized images under `dist/assets/images`
- WebP variants for PNG and JPG assets

## Deployment

- GitHub Pages repository: `atikulmunna/atikulmunna.github.io`
- Deployment branch: `main`
- Custom domain: [aimunna.me](https://aimunna.me)
- GitHub Pages fallback: [atikulmunna.github.io](https://atikulmunna.github.io)
- Domain configuration: `CNAME`

## Updating Content

- Portfolio copy and project entries live in `index.html`
- Screenshots and icons live under `assets/images` and `assets/icons`
- Visual refinements usually belong in `css/sections.css` or `css/components.css`
- Theme-specific refinements belong in `css/theme-light.css`
- Local editing notes live in `LOCAL_EDITING_GUIDE.md` and should remain uncommitted
