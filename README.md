# Portfolio Website

A modern, responsive portfolio website featuring glassmorphism effects and professional design.

## Project Structure

```
portfolio-website/
├── index.html              # Main HTML file
├── css/
│   ├── variables.css       # CSS custom properties (colors, spacing, etc.)
│   ├── reset.css          # CSS reset/normalize
│   ├── base.css           # Base styles and typography
│   ├── layout.css         # Grid and layout systems
│   ├── components.css     # Reusable components (buttons, cards, etc.)
│   ├── glassmorphism.css  # Glassmorphism effect utilities
│   └── sections.css       # Section-specific styles
├── js/
│   ├── navigation.js      # Navigation and smooth scrolling
│   ├── animations.js      # Scroll animations and interactions
│   └── main.js           # Main application logic
├── assets/
│   ├── images/           # Optimized images
│   └── icons/            # SVG icons
└── README.md
```

## Features

- **Responsive Design**: Mobile-first approach with breakpoints at 768px and 1024px
- **Glassmorphism Effects**: Modern frosted glass effects using backdrop-filter
- **Accessibility**: WCAG AA compliant with keyboard navigation support
- **Performance**: Optimized assets, lazy loading, and efficient rendering
- **Modern CSS**: Custom properties, Grid, Flexbox, and modern features
- **Vanilla JavaScript**: No frameworks for optimal performance

## Color Palette

- Primary Dark: `#22223b`
- Secondary Dark: `#4a4e69`
- Mid-tone: `#9a8c98`
- Light Accent: `#c9ada7`
- Primary Light: `#f2e9e4`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

Glassmorphism effects gracefully degrade in browsers without backdrop-filter support.

## Development

Simply open `index.html` in a web browser to view the website. For development with live reload, use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve
```

## Implementation Status

- [x] Task 1: Project setup and foundation
- [ ] Task 2: Base styles and typography system
- [ ] Task 3: Glassmorphism effect utilities
- [ ] Task 4: Responsive layout system
- [ ] Task 5: Reusable component styles
- [ ] Task 6: Navigation component
- [ ] Task 8: Hero section
- [ ] Task 9: About section
- [ ] Task 10: Skills section
- [ ] Task 11: Projects section
- [ ] Task 12: Experience section
- [ ] Task 13: Contact section
- [ ] Task 14: Scroll animations
- [ ] Task 16: Image optimization and lazy loading
- [ ] Task 17: Accessibility features
- [ ] Task 18: Color contrast validation
- [ ] Task 19: Cross-browser compatibility
- [ ] Task 20: Main application entry point
- [ ] Task 21: Optimize and minify assets
- [ ] Task 22: Final validation and testing

## License

All rights reserved.
