/**
 * Navigation Module
 * Handles navigation functionality, smooth scrolling, mobile menu, and active section detection
 * Requirements: 5.3, 5.4, 5.5, 7.2
 */

const Navigation = {
  // State
  state: {
    isMenuOpen: false,
    activeSection: 'hero',
    isScrolled: false,
    scrollThreshold: 50
  },

  // DOM elements
  elements: {
    nav: null,
    toggle: null,
    menu: null,
    links: [],
    sections: []
  },

  /**
   * Initialize navigation module
   */
  init() {
    // Cache DOM elements
    this.cacheElements();
    
    // Setup functionality
    this.setupSmoothScroll();
    this.setupMobileToggle();
    this.setupScrollEffect();
    this.setupActiveLink();
    
    // Set initial active link
    this.updateActiveLink('hero');
    
    console.log('Navigation initialized');
  },

  /**
   * Cache DOM elements for better performance
   */
  cacheElements() {
    this.elements.nav = document.getElementById('main-nav');
    this.elements.toggle = this.elements.nav?.querySelector('.nav__toggle');
    this.elements.menu = this.elements.nav?.querySelector('.nav__menu');
    this.elements.links = Array.from(this.elements.nav?.querySelectorAll('.nav__link') || []);
    
    // Get all sections that have IDs matching nav links
    const sectionIds = this.elements.links
      .map(link => link.getAttribute('href')?.replace('#', ''))
      .filter(id => id);
    
    this.elements.sections = sectionIds
      .map(id => document.getElementById(id))
      .filter(section => section);
  },

  /**
   * Setup smooth scroll functionality for anchor links
   * Requirement 5.3, 7.2: Smooth scroll to sections
   */
  setupSmoothScroll() {
    this.elements.links.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        
        // Only handle internal anchor links
        if (href && href.startsWith('#')) {
          e.preventDefault();
          
          const targetId = href.replace('#', '');
          const targetSection = document.getElementById(targetId);
          
          if (targetSection) {
            // Close mobile menu if open
            if (this.state.isMenuOpen) {
              this.closeMobileMenu();
            }
            
            // Smooth scroll to section
            this.scrollToSection(targetSection);
            
            // Update active link
            this.updateActiveLink(targetId);
            
            // Update URL hash without jumping
            if (history.pushState) {
              history.pushState(null, null, href);
            }
          }
        }
      });
    });
  },

  /**
   * Scroll to a section smoothly
   * @param {HTMLElement} section - The section to scroll to
   */
  scrollToSection(section) {
    // Calculate offset for fixed navigation
    const navHeight = this.elements.nav?.offsetHeight || 72;
    const targetPosition = section.offsetTop - navHeight;
    
    // Try native smooth scroll first
    if ('scrollBehavior' in document.documentElement.style) {
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    } else {
      // Fallback: instant scroll for older browsers
      window.scrollTo(0, targetPosition);
    }
  },

  /**
   * Setup mobile menu toggle functionality
   * Requirement 5.4: Mobile menu toggle
   */
  setupMobileToggle() {
    if (!this.elements.toggle || !this.elements.menu) return;
    
    // Toggle button click handler
    this.elements.toggle.addEventListener('click', () => {
      if (this.state.isMenuOpen) {
        this.closeMobileMenu();
      } else {
        this.openMobileMenu();
      }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (this.state.isMenuOpen && 
          !this.elements.menu.contains(e.target) && 
          !this.elements.toggle.contains(e.target)) {
        this.closeMobileMenu();
      }
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.state.isMenuOpen) {
        this.closeMobileMenu();
        this.elements.toggle.focus();
      }
    });
    
    // Handle window resize - close menu if resizing to desktop
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth >= 768 && this.state.isMenuOpen) {
          this.closeMobileMenu();
        }
      }, 250);
    });
  },

  /**
   * Open mobile menu
   */
  openMobileMenu() {
    this.state.isMenuOpen = true;
    this.elements.menu.classList.add('nav__menu--open');
    this.elements.toggle.setAttribute('aria-expanded', 'true');
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = 'hidden';
    
    // Focus first menu link for accessibility
    const firstLink = this.elements.menu.querySelector('.nav__link');
    if (firstLink) {
      setTimeout(() => firstLink.focus(), 100);
    }
  },

  /**
   * Close mobile menu
   */
  closeMobileMenu() {
    this.state.isMenuOpen = false;
    this.elements.menu.classList.remove('nav__menu--open');
    this.elements.toggle.setAttribute('aria-expanded', 'false');
    
    // Restore body scroll
    document.body.style.overflow = '';
  },

  /**
   * Setup scroll effect for navigation bar
   * Adds .nav--scrolled class when page is scrolled
   */
  setupScrollEffect() {
    let ticking = false;
    
    const updateScrollState = () => {
      const scrolled = window.scrollY > this.state.scrollThreshold;
      
      if (scrolled !== this.state.isScrolled) {
        this.state.isScrolled = scrolled;
        
        if (scrolled) {
          this.elements.nav.classList.add('nav--scrolled');
        } else {
          this.elements.nav.classList.remove('nav--scrolled');
        }
      }
      
      ticking = false;
    };
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollState);
        ticking = true;
      }
    }, { passive: true });
    
    // Check initial state
    updateScrollState();
  },

  /**
   * Setup active section detection using Intersection Observer
   * Requirement 5.5: Active section highlighting
   */
  setupActiveLink() {
    // Intersection Observer configuration
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -20% 0px', // Trigger when section is 20% from top/bottom
      threshold: [0, 0.25, 0.5, 0.75, 1]
    };
    
    // Track which sections are currently intersecting
    const intersectingSections = new Map();
    
    const observerCallback = (entries) => {
      entries.forEach(entry => {
        const sectionId = entry.target.id;
        
        if (entry.isIntersecting) {
          // Section is visible
          intersectingSections.set(sectionId, entry.intersectionRatio);
        } else {
          // Section is not visible
          intersectingSections.delete(sectionId);
        }
      });
      
      // Find the section with highest intersection ratio
      if (intersectingSections.size > 0) {
        let maxRatio = 0;
        let activeSectionId = '';
        
        intersectingSections.forEach((ratio, id) => {
          if (ratio > maxRatio) {
            maxRatio = ratio;
            activeSectionId = id;
          }
        });
        
        // Update active link if section changed
        if (activeSectionId && activeSectionId !== this.state.activeSection) {
          this.updateActiveLink(activeSectionId);
        }
      }
    };
    
    // Create observer
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    // Observe all sections
    this.elements.sections.forEach(section => {
      observer.observe(section);
    });
  },

  /**
   * Update active navigation link
   * @param {string} sectionId - ID of the active section
   */
  updateActiveLink(sectionId) {
    this.state.activeSection = sectionId;
    
    // Remove active class from all links
    this.elements.links.forEach(link => {
      link.classList.remove('nav__link--active');
    });
    
    // Add active class to current section's link
    const activeLink = this.elements.links.find(link => {
      const href = link.getAttribute('href');
      return href === `#${sectionId}`;
    });
    
    if (activeLink) {
      activeLink.classList.add('nav__link--active');
    }
  }
};

// Initialize navigation when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Navigation.init());
} else {
  Navigation.init();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Navigation;
}
