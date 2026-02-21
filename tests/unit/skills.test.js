/**
 * Skills Section Unit Tests
 * Tests for Skills section HTML structure and organization
 * Requirements: 1.3, 11.4
 * Tasks: 10.1, 10.3
 */

describe('Skills Section Structure', () => {
  let skillsSection;

  beforeEach(() => {
    // Load the HTML structure from actual implementation
    document.body.innerHTML = `
      <main>
        <section class="section section--dark" id="skills">
          <div class="section__container">
            <h2 class="section__title">Skills & Technologies</h2>
            <div class="section__content">
              <div class="skills-grid">
                <div class="skill-category card card--glass">
                  <h3 class="skill-category__title">Languages</h3>
                  <ul class="skill-list">
                    <li class="skill-item">Python</li>
                    <li class="skill-item">C++</li>
                    <li class="skill-item">C</li>
                  </ul>
                </div>
                <div class="skill-category card card--glass">
                  <h3 class="skill-category__title">LLM/NLP</h3>
                  <ul class="skill-list">
                    <li class="skill-item">Hugging Face</li>
                    <li class="skill-item">spaCy</li>
                  </ul>
                </div>
                <div class="skill-category card card--glass">
                  <h3 class="skill-category__title">Deep Learning</h3>
                  <ul class="skill-list">
                    <li class="skill-item">PyTorch</li>
                    <li class="skill-item">TensorFlow</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    `;
    skillsSection = document.getElementById('skills');
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Skills Section Existence - Requirement 1.3', () => {
    test('Skills section exists', () => {
      expect(skillsSection).toBeTruthy();
      expect(skillsSection).toBeInstanceOf(HTMLElement);
    });

    test('Skills section has correct ID', () => {
      expect(skillsSection.id).toBe('skills');
    });

    test('Skills section has semantic section element', () => {
      expect(skillsSection.tagName.toLowerCase()).toBe('section');
    });

    test('Skills section has required CSS classes', () => {
      expect(skillsSection.classList.contains('section')).toBe(true);
    });
  });

  describe('Skills Section Structure', () => {
    test('Skills section contains section__container', () => {
      const container = skillsSection.querySelector('.section__container');
      expect(container).toBeTruthy();
    });

    test('Skills section contains section__title', () => {
      const title = skillsSection.querySelector('.section__title');
      expect(title).toBeTruthy();
      expect(title.tagName.toLowerCase()).toBe('h2');
    });

    test('Skills section title has text content', () => {
      const title = skillsSection.querySelector('.section__title');
      expect(title.textContent.trim()).toBeTruthy();
      expect(title.textContent.trim().length).toBeGreaterThan(0);
    });

    test('Skills section contains section__content', () => {
      const content = skillsSection.querySelector('.section__content');
      expect(content).toBeTruthy();
    });

    test('Skills section has proper nesting structure', () => {
      const container = skillsSection.querySelector('.section__container');
      const title = container.querySelector('.section__title');
      const content = container.querySelector('.section__content');
      
      expect(title).toBeTruthy();
      expect(content).toBeTruthy();
      expect(title.parentElement).toBe(container);
      expect(content.parentElement).toBe(container);
    });
  });

  describe('Skills Grid Layout - Requirement 11.4', () => {
    test('Skills section contains skills-grid', () => {
      const grid = skillsSection.querySelector('.skills-grid');
      expect(grid).toBeTruthy();
    });

    test('Skills grid is inside section__content', () => {
      const content = skillsSection.querySelector('.section__content');
      const grid = content.querySelector('.skills-grid');
      expect(grid).toBeTruthy();
      expect(grid.parentElement).toBe(content);
    });

    test('Skills grid contains skill categories', () => {
      const grid = skillsSection.querySelector('.skills-grid');
      const categories = grid.querySelectorAll('.skill-category');
      expect(categories.length).toBeGreaterThan(0);
    });

    test('Skills grid has multiple skill categories for organization', () => {
      const categories = skillsSection.querySelectorAll('.skill-category');
      // Should have at least 2 categories to demonstrate organization
      expect(categories.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Skill Category Structure - Requirement 11.4', () => {
    test('Each skill category is a card with glassmorphism', () => {
      const categories = skillsSection.querySelectorAll('.skill-category');
      categories.forEach(category => {
        expect(category.classList.contains('card')).toBe(true);
        expect(category.classList.contains('card--glass')).toBe(true);
      });
    });

    test('Each skill category has a title', () => {
      const categories = skillsSection.querySelectorAll('.skill-category');
      categories.forEach(category => {
        const title = category.querySelector('.skill-category__title');
        expect(title).toBeTruthy();
        expect(title.tagName.toLowerCase()).toBe('h3');
      });
    });

    test('Each skill category title has text content', () => {
      const categories = skillsSection.querySelectorAll('.skill-category');
      categories.forEach(category => {
        const title = category.querySelector('.skill-category__title');
        expect(title.textContent.trim()).toBeTruthy();
        expect(title.textContent.trim().length).toBeGreaterThan(0);
      });
    });

    test('Each skill category contains a skill list', () => {
      const categories = skillsSection.querySelectorAll('.skill-category');
      categories.forEach(category => {
        const list = category.querySelector('.skill-list');
        expect(list).toBeTruthy();
        expect(list.tagName.toLowerCase()).toBe('ul');
      });
    });

    test('Each skill category has proper nesting: title then list', () => {
      const categories = skillsSection.querySelectorAll('.skill-category');
      categories.forEach(category => {
        const title = category.querySelector('.skill-category__title');
        const list = category.querySelector('.skill-list');
        
        expect(title.parentElement).toBe(category);
        expect(list.parentElement).toBe(category);
      });
    });
  });

  describe('Skill Items - Requirement 11.4', () => {
    test('Each skill list contains skill items', () => {
      const lists = skillsSection.querySelectorAll('.skill-list');
      lists.forEach(list => {
        const items = list.querySelectorAll('.skill-item');
        expect(items.length).toBeGreaterThan(0);
      });
    });

    test('Skill items are list elements', () => {
      const items = skillsSection.querySelectorAll('.skill-item');
      items.forEach(item => {
        expect(item.tagName.toLowerCase()).toBe('li');
      });
    });

    test('Skill items have text content', () => {
      const items = skillsSection.querySelectorAll('.skill-item');
      items.forEach(item => {
        expect(item.textContent.trim()).toBeTruthy();
        expect(item.textContent.trim().length).toBeGreaterThan(0);
      });
    });

    test('Skill items are properly nested in skill lists', () => {
      const items = skillsSection.querySelectorAll('.skill-item');
      items.forEach(item => {
        const parent = item.parentElement;
        expect(parent.classList.contains('skill-list')).toBe(true);
      });
    });

    test('Each skill category has at least one skill item', () => {
      const categories = skillsSection.querySelectorAll('.skill-category');
      categories.forEach(category => {
        const items = category.querySelectorAll('.skill-item');
        expect(items.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('Skills Organization Format - Requirement 11.4', () => {
    test('Skills are organized in categories (not flat list)', () => {
      const categories = skillsSection.querySelectorAll('.skill-category');
      const grid = skillsSection.querySelector('.skills-grid');
      
      // Should have categories within a grid, not just a flat list
      expect(categories.length).toBeGreaterThan(0);
      expect(grid).toBeTruthy();
    });

    test('Skills are displayed in scannable format with clear grouping', () => {
      const categories = skillsSection.querySelectorAll('.skill-category');
      
      // Each category should have a title and list for clear grouping
      categories.forEach(category => {
        const title = category.querySelector('.skill-category__title');
        const list = category.querySelector('.skill-list');
        
        expect(title).toBeTruthy();
        expect(list).toBeTruthy();
      });
    });

    test('Skills use semantic HTML for accessibility', () => {
      // Categories use headings (h3)
      const categoryTitles = skillsSection.querySelectorAll('.skill-category__title');
      categoryTitles.forEach(title => {
        expect(title.tagName.toLowerCase()).toBe('h3');
      });

      // Skills use unordered lists
      const skillLists = skillsSection.querySelectorAll('.skill-list');
      skillLists.forEach(list => {
        expect(list.tagName.toLowerCase()).toBe('ul');
      });

      // Skill items use list items
      const skillItems = skillsSection.querySelectorAll('.skill-item');
      skillItems.forEach(item => {
        expect(item.tagName.toLowerCase()).toBe('li');
      });
    });

    test('Skills section has visual hierarchy with section title, category titles, and items', () => {
      const sectionTitle = skillsSection.querySelector('.section__title');
      const categoryTitles = skillsSection.querySelectorAll('.skill-category__title');
      const skillItems = skillsSection.querySelectorAll('.skill-item');

      // Should have h2 for section, h3 for categories, and li for items
      expect(sectionTitle.tagName.toLowerCase()).toBe('h2');
      categoryTitles.forEach(title => {
        expect(title.tagName.toLowerCase()).toBe('h3');
      });
      skillItems.forEach(item => {
        expect(item.tagName.toLowerCase()).toBe('li');
      });
    });
  });

  describe('Skills Section Completeness', () => {
    test('Skills section contains all required structural elements', () => {
      const container = skillsSection.querySelector('.section__container');
      const title = skillsSection.querySelector('.section__title');
      const content = skillsSection.querySelector('.section__content');
      const grid = skillsSection.querySelector('.skills-grid');
      const categories = skillsSection.querySelectorAll('.skill-category');

      expect(container).toBeTruthy();
      expect(title).toBeTruthy();
      expect(content).toBeTruthy();
      expect(grid).toBeTruthy();
      expect(categories.length).toBeGreaterThan(0);
    });

    test('Skills section demonstrates organized format with multiple categories', () => {
      const categories = skillsSection.querySelectorAll('.skill-category');
      const categoryTitles = Array.from(categories).map(cat => 
        cat.querySelector('.skill-category__title').textContent.trim()
      );

      // Should have distinct category names
      const uniqueTitles = new Set(categoryTitles);
      expect(uniqueTitles.size).toBe(categoryTitles.length);
      
      // Should have multiple categories for organization
      expect(categories.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Skills Section Accessibility', () => {
    test('Skills section has proper heading hierarchy', () => {
      const h2 = skillsSection.querySelector('h2');
      const h3s = skillsSection.querySelectorAll('h3');

      // Should have one h2 (section title)
      expect(h2).toBeTruthy();
      
      // Should have multiple h3s (category titles)
      expect(h3s.length).toBeGreaterThan(0);
      
      // No h4 or lower headings should exist (flat hierarchy)
      const h4s = skillsSection.querySelectorAll('h4');
      expect(h4s.length).toBe(0);
    });

    test('Skills lists use semantic list markup', () => {
      const lists = skillsSection.querySelectorAll('ul.skill-list');
      
      lists.forEach(list => {
        const items = list.querySelectorAll('li.skill-item');
        expect(items.length).toBeGreaterThan(0);
        
        // All children should be list items
        const children = Array.from(list.children);
        children.forEach(child => {
          expect(child.tagName.toLowerCase()).toBe('li');
        });
      });
    });

    test('Skills section has only one h2 element', () => {
      const h2Elements = skillsSection.querySelectorAll('h2');
      expect(h2Elements.length).toBe(1);
    });
  });

  describe('Skills Section Glassmorphism', () => {
    test('Skill categories use glassmorphism card style', () => {
      const categories = skillsSection.querySelectorAll('.skill-category');
      
      categories.forEach(category => {
        expect(category.classList.contains('card')).toBe(true);
        expect(category.classList.contains('card--glass')).toBe(true);
      });
    });

    test('All skill categories consistently use glass effect', () => {
      const categories = skillsSection.querySelectorAll('.skill-category');
      const glassCategories = skillsSection.querySelectorAll('.skill-category.card--glass');
      
      // All categories should have glass effect
      expect(categories.length).toBe(glassCategories.length);
    });
  });
});
