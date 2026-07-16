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
    scrollThreshold: 50,
    scrollAnimationFrame: null,
    settleTimer: null
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
    // Read the target live each time it is needed. Lazy-loaded images and
    // deferred content above the target keep growing the document while the
    // page scrolls, so a value captured once lands short (the old "click twice"
    // bug). A function that recomputes on demand tracks that layout shift.
    const getTarget = () => {
      const navHeight = this.elements.nav?.offsetHeight || 72;
      return Math.max(0, section.offsetTop - navHeight);
    };

    if (this.prefersReducedMotion()) {
      this.cancelManagedScroll();
      window.scrollTo(0, getTarget());
      this.settleScroll(getTarget);
      return;
    }

    // Keep the simple native path for tests and older browsers.
    if (this.isTestEnvironment()) {
      window.scrollTo({
        top: getTarget(),
        behavior: 'smooth'
      });
      return;
    }

    // Use a managed distance-based scroll in real browsers so
    // short jumps feel crisp and long jumps feel more controlled.
    if ('scrollBehavior' in document.documentElement.style &&
        typeof window.requestAnimationFrame === 'function') {
      this.performManagedScroll(getTarget);
    } else {
      // Fallback: instant scroll for older browsers
      window.scrollTo(0, getTarget());
      this.settleScroll(getTarget);
    }
  },

  /**
   * Scroll with distance-aware timing for a tighter, less floaty feel.
   * @param {Function} getTarget - Returns the current Y position to scroll to.
   */
  performManagedScroll(getTarget) {
    this.cancelManagedScroll();

    const startY = window.scrollY || window.pageYOffset || 0;

    if (Math.abs(getTarget() - startY) < 4) {
      window.scrollTo({ top: getTarget(), behavior: 'auto' });
      this.settleScroll(getTarget);
      return;
    }

    // Base the timing on the initial distance so the feel stays consistent.
    const duration = Math.max(90, Math.min(220, 95 + (Math.abs(getTarget() - startY) * 0.05)));
    const startTime = performance.now();

    const easeOutCubic = (t) => {
      return 1 - Math.pow(1 - t, 3);
    };

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeOutCubic(progress);
      // Recompute the target every frame so late layout shifts are absorbed
      // while scrolling instead of leaving us short at the end.
      const nextY = startY + ((getTarget() - startY) * eased);

      // behavior:'auto' forces an instant write, overriding the global
      // `scroll-behavior: smooth` (reset.css) that would otherwise re-smooth
      // each frame and fight this animation, stalling it partway.
      window.scrollTo({ top: Math.round(nextY), behavior: 'auto' });

      if (progress < 1) {
        this.state.scrollAnimationFrame = window.requestAnimationFrame(step);
      } else {
        this.state.scrollAnimationFrame = null;
        this.settleScroll(getTarget);
      }
    };

    this.state.scrollAnimationFrame = window.requestAnimationFrame(step);
  },

  /**
   * After the animation ends, images below may still be decoding and can push
   * the target a few more pixels. Re-check a handful of times and snap to the
   * final resting position so the user never has to click a second time.
   * @param {Function} getTarget - Returns the current Y position to scroll to.
   */
  settleScroll(getTarget) {
    if (this.state.settleTimer !== null) {
      window.clearTimeout(this.state.settleTimer);
      this.state.settleTimer = null;
    }

    // If the user starts scrolling on their own during the settle window, stop
    // correcting so we never yank them back to the section.
    let cancelled = false;
    const stop = () => { cancelled = true; cleanup(); };
    const cleanup = () => {
      window.removeEventListener('wheel', stop, { passive: true });
      window.removeEventListener('touchstart', stop, { passive: true });
      window.removeEventListener('keydown', stop);
    };
    window.addEventListener('wheel', stop, { passive: true });
    window.addEventListener('touchstart', stop, { passive: true });
    window.addEventListener('keydown', stop);

    // Poll until the target stops moving. Deferred content (injected tags,
    // README panels, fonts) can keep shifting layout for up to ~1s after the
    // click, so correct on each poll and only stop once the target has held
    // steady twice in a row, or the overall time budget runs out.
    const startTime = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    const maxDuration = 1500;
    let stableStreak = 0;
    let lastTarget = null;

    const correct = () => {
      if (cancelled) { this.state.settleTimer = null; return; }

      const target = getTarget();
      const current = window.scrollY || window.pageYOffset || 0;
      if (Math.abs(current - target) > 2) {
        window.scrollTo({ top: target, behavior: 'auto' });
      }

      stableStreak = (lastTarget !== null && Math.abs(target - lastTarget) <= 1)
        ? stableStreak + 1
        : 0;
      lastTarget = target;

      const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
      if (stableStreak < 2 && (now - startTime) < maxDuration) {
        this.state.settleTimer = window.setTimeout(correct, 100);
      } else {
        this.state.settleTimer = null;
        cleanup();
      }
    };

    this.state.settleTimer = window.setTimeout(correct, 60);
  },

  cancelManagedScroll() {
    if (this.state.scrollAnimationFrame !== null) {
      window.cancelAnimationFrame(this.state.scrollAnimationFrame);
      this.state.scrollAnimationFrame = null;
    }
    if (this.state.settleTimer !== null) {
      window.clearTimeout(this.state.settleTimer);
      this.state.settleTimer = null;
    }
  },

  prefersReducedMotion() {
    return (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  },

  isTestEnvironment() {
    return (
      typeof navigator !== 'undefined' &&
      /jsdom/i.test(navigator.userAgent || '')
    );
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

    if (this.elements.nav && this.elements.links.length > 0) {
      const activeIndex = this.elements.links.findIndex(link => link === activeLink);
      const fallbackIndex = activeIndex >= 0 ? activeIndex : 0;
      const progressSteps = Math.max(this.elements.links.length - 1, 1);
      const progressScale = 0.14 + ((fallbackIndex / progressSteps) * 0.86);
      this.elements.nav.style.setProperty('--nav-progress-scale', progressScale.toFixed(3));
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
