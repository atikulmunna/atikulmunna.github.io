/**
 * Hero Section Unit Tests
 * Tests for Hero section HTML structure and content
 * Requirements: 1.1, 11.1, 11.2
 * Tasks: 8.1, 8.3
 */

describe('Hero Section Structure', () => {
  let heroSection;

  beforeEach(() => {
    // Load the HTML structure
    document.body.innerHTML = `
      <main>
        <section class="hero section" id="hero">
          <div class="hero__container">
            <div class="hero__content">
              <h1 class="hero__title">
                <span class="hero__greeting">Hi, I'm</span>
                <span class="hero__name">Your Name</span>
              </h1>
              <p class="hero__subtitle">Professional Title / Role</p>
              <p class="hero__description">Brief introduction text about your professional background and expertise.</p>
              <div class="hero__cta">
                <a href="#contact" class="btn btn--primary btn--glass btn--large">Get In Touch</a>
                <a href="#projects" class="btn btn--secondary btn--glass btn--large">View Work</a>
              </div>
            </div>
          </div>
        </section>
        <section class="section section--light" id="about">
          <div class="section__container">
            <h2 class="section__title">About Me</h2>
          </div>
        </section>
      </main>
    `;
    heroSection = document.getElementById('hero');
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Hero Section Existence and Position', () => {
    test('Hero section exists', () => {
      expect(heroSection).toBeTruthy();
      expect(heroSection).toBeInstanceOf(HTMLElement);
    });

    test('Hero section has correct ID', () => {
      expect(heroSection.id).toBe('hero');
    });

    test('Hero section has semantic section element', () => {
      expect(heroSection.tagName.toLowerCase()).toBe('section');
    });

    test('Hero section is the first section in main', () => {
      const mainElement = document.querySelector('main');
      const firstSection = mainElement.querySelector('section');
      expect(firstSection).toBe(heroSection);
      expect(firstSection.id).toBe('hero');
    });

    test('Hero section has required CSS classes', () => {
      expect(heroSection.classList.contains('hero')).toBe(true);
      expect(heroSection.classList.contains('section')).toBe(true);
    });
  });

  describe('Hero Section Structure', () => {
    test('Hero section contains hero__container', () => {
      const container = heroSection.querySelector('.hero__container');
      expect(container).toBeTruthy();
    });

    test('Hero section contains hero__content', () => {
      const content = heroSection.querySelector('.hero__content');
      expect(content).toBeTruthy();
    });

    test('Hero section has proper nesting structure', () => {
      const container = heroSection.querySelector('.hero__container');
      const content = container.querySelector('.hero__content');
      expect(content).toBeTruthy();
      expect(content.parentElement).toBe(container);
    });
  });

  describe('Hero Title and Name', () => {
    test('Hero section contains h1 title element', () => {
      const title = heroSection.querySelector('h1.hero__title');
      expect(title).toBeTruthy();
      expect(title.tagName.toLowerCase()).toBe('h1');
    });

    test('Hero title contains greeting span', () => {
      const greeting = heroSection.querySelector('.hero__greeting');
      expect(greeting).toBeTruthy();
      expect(greeting.tagName.toLowerCase()).toBe('span');
    });

    test('Hero title contains name span', () => {
      const name = heroSection.querySelector('.hero__name');
      expect(name).toBeTruthy();
      expect(name.tagName.toLowerCase()).toBe('span');
    });

    test('Hero greeting has text content', () => {
      const greeting = heroSection.querySelector('.hero__greeting');
      expect(greeting.textContent.trim()).toBeTruthy();
      expect(greeting.textContent.trim().length).toBeGreaterThan(0);
    });

    test('Hero name has text content', () => {
      const name = heroSection.querySelector('.hero__name');
      expect(name.textContent.trim()).toBeTruthy();
      expect(name.textContent.trim().length).toBeGreaterThan(0);
    });

    test('Hero greeting and name are children of title', () => {
      const title = heroSection.querySelector('.hero__title');
      const greeting = heroSection.querySelector('.hero__greeting');
      const name = heroSection.querySelector('.hero__name');
      expect(greeting.parentElement).toBe(title);
      expect(name.parentElement).toBe(title);
    });
  });

  describe('Hero Subtitle (Professional Title)', () => {
    test('Hero section contains subtitle element', () => {
      const subtitle = heroSection.querySelector('.hero__subtitle');
      expect(subtitle).toBeTruthy();
    });

    test('Hero subtitle is a paragraph element', () => {
      const subtitle = heroSection.querySelector('.hero__subtitle');
      expect(subtitle.tagName.toLowerCase()).toBe('p');
    });

    test('Hero subtitle has text content', () => {
      const subtitle = heroSection.querySelector('.hero__subtitle');
      expect(subtitle.textContent.trim()).toBeTruthy();
      expect(subtitle.textContent.trim().length).toBeGreaterThan(0);
    });
  });

  describe('Hero Description', () => {
    test('Hero section contains description element', () => {
      const description = heroSection.querySelector('.hero__description');
      expect(description).toBeTruthy();
    });

    test('Hero description is a paragraph element', () => {
      const description = heroSection.querySelector('.hero__description');
      expect(description.tagName.toLowerCase()).toBe('p');
    });

    test('Hero description has text content', () => {
      const description = heroSection.querySelector('.hero__description');
      expect(description.textContent.trim()).toBeTruthy();
      expect(description.textContent.trim().length).toBeGreaterThan(0);
    });
  });

  describe('Hero CTA Buttons - Requirement 11.2', () => {
    test('Hero section contains CTA container', () => {
      const cta = heroSection.querySelector('.hero__cta');
      expect(cta).toBeTruthy();
    });

    test('Hero CTA container has buttons/links', () => {
      const cta = heroSection.querySelector('.hero__cta');
      const buttons = cta.querySelectorAll('.btn');
      expect(buttons.length).toBeGreaterThan(0);
    });

    test('Hero CTA contains primary button', () => {
      const primaryBtn = heroSection.querySelector('.hero__cta .btn--primary');
      expect(primaryBtn).toBeTruthy();
    });

    test('Hero CTA contains secondary button', () => {
      const secondaryBtn = heroSection.querySelector('.hero__cta .btn--secondary');
      expect(secondaryBtn).toBeTruthy();
    });

    test('Hero CTA buttons have glassmorphism class', () => {
      const buttons = heroSection.querySelectorAll('.hero__cta .btn');
      buttons.forEach(btn => {
        expect(btn.classList.contains('btn--glass')).toBe(true);
      });
    });

    test('Hero CTA buttons have large size class', () => {
      const buttons = heroSection.querySelectorAll('.hero__cta .btn');
      buttons.forEach(btn => {
        expect(btn.classList.contains('btn--large')).toBe(true);
      });
    });

    test('Hero CTA buttons have text content', () => {
      const buttons = heroSection.querySelectorAll('.hero__cta .btn');
      buttons.forEach(btn => {
        expect(btn.textContent.trim()).toBeTruthy();
        expect(btn.textContent.trim().length).toBeGreaterThan(0);
      });
    });

    test('Hero CTA buttons have valid href attributes', () => {
      const buttons = heroSection.querySelectorAll('.hero__cta .btn');
      buttons.forEach(btn => {
        if (btn.tagName.toLowerCase() === 'a') {
          expect(btn.hasAttribute('href')).toBe(true);
          expect(btn.getAttribute('href')).toBeTruthy();
        }
      });
    });

    test('Hero CTA primary button links to contact section', () => {
      const primaryBtn = heroSection.querySelector('.hero__cta .btn--primary');
      if (primaryBtn.tagName.toLowerCase() === 'a') {
        expect(primaryBtn.getAttribute('href')).toBe('#contact');
      }
    });

    test('Hero CTA secondary button links to projects section', () => {
      const secondaryBtn = heroSection.querySelector('.hero__cta .btn--secondary');
      if (secondaryBtn.tagName.toLowerCase() === 'a') {
        expect(secondaryBtn.getAttribute('href')).toBe('#projects');
      }
    });
  });

  describe('Hero Section Content Completeness', () => {
    test('Hero section contains all required elements', () => {
      const title = heroSection.querySelector('.hero__title');
      const subtitle = heroSection.querySelector('.hero__subtitle');
      const description = heroSection.querySelector('.hero__description');
      const cta = heroSection.querySelector('.hero__cta');

      expect(title).toBeTruthy();
      expect(subtitle).toBeTruthy();
      expect(description).toBeTruthy();
      expect(cta).toBeTruthy();
    });

    test('Hero section has proper content hierarchy', () => {
      const content = heroSection.querySelector('.hero__content');
      const children = Array.from(content.children);
      
      // Check that elements exist in content
      const hasTitle = children.some(child => child.classList.contains('hero__title'));
      const hasSubtitle = children.some(child => child.classList.contains('hero__subtitle'));
      const hasDescription = children.some(child => child.classList.contains('hero__description'));
      const hasCta = children.some(child => child.classList.contains('hero__cta'));

      expect(hasTitle).toBe(true);
      expect(hasSubtitle).toBe(true);
      expect(hasDescription).toBe(true);
      expect(hasCta).toBe(true);
    });
  });

  describe('Hero Section Accessibility', () => {
    test('Hero section has only one h1 element', () => {
      const h1Elements = heroSection.querySelectorAll('h1');
      expect(h1Elements.length).toBe(1);
    });

    test('Hero CTA links are keyboard accessible', () => {
      const buttons = heroSection.querySelectorAll('.hero__cta .btn');
      buttons.forEach(btn => {
        if (btn.tagName.toLowerCase() === 'a') {
          // Links should be naturally focusable (no negative tabindex)
          const tabindex = btn.getAttribute('tabindex');
          expect(tabindex === null || parseInt(tabindex) >= 0).toBe(true);
        }
      });
    });
  });
});
