/**
 * Main Application Entry Point
 * Initializes all modules and handles application lifecycle
 * Requirement 9.3: Code organization and error handling
 */

const App = {
  // Configuration
  config: {
    debug: false,
    modules: {
      navigation: true,
      animations: true,
      imageLoader: true
    }
  },

  // Module references
  modules: {
    Navigation: null,
    Animations: null,
    ImageLoader: null
  },

  /**
   * Initialize the application
   */
  init() {
    this.log('Initializing portfolio website...');

    try {
      // Detect browser feature support
      this.detectFeatureSupport();
      this.detectPerformanceProfile();
      this.setupPerformanceNotice();
      
      // Initialize modules with error boundary
      this.initializeModules();
      
      // Setup global error handlers
      this.setupErrorHandlers();
      
      this.log('Application initialized successfully');
    } catch (error) {
      this.handleError('Application initialization failed', error);
      // Site still functions with basic HTML/CSS even if JS fails
      this.fallbackMode();
    }
  },

  /**
   * Detect browser feature support and apply fallback classes
   * Requirement 4.6: Ensure glassmorphism effects degrade gracefully
   */
  detectFeatureSupport() {
    // Detect backdrop-filter support
    const supportsBackdropFilter = this.supportsBackdropFilter();
    
    if (!supportsBackdropFilter) {
      this.log('backdrop-filter not supported, applying fallback');
      document.documentElement.classList.add('no-backdrop-filter');
    } else {
      this.log('backdrop-filter is supported');
    }

    // Add browser class hooks for targeted perf tuning.
    if (this.isEdgeBrowser()) {
      document.documentElement.classList.add('is-edge');
    }
  },

  /**
   * Detect constrained devices and expose a CSS/JS hook for cheaper effects.
   * This is intentionally conservative: visual identity stays intact, while
   * expensive blur/canvas work is reduced on low-memory phones and Save-Data.
   */
  detectPerformanceProfile() {
    const forcedProfile = this.getForcedPerformanceProfile();

    if (forcedProfile === 'lite') {
      document.documentElement.classList.add('perf-lite');
      this.log('Performance-lite mode forced by URL');
      return;
    }

    if (forcedProfile === 'full') {
      document.documentElement.classList.remove('perf-lite');
      this.log('Full performance mode forced by URL');
      return;
    }

    const nav = typeof navigator !== 'undefined' ? navigator : {};
    const deviceMemory = Number(nav.deviceMemory || 0);
    const hardwareConcurrency = Number(nav.hardwareConcurrency || 0);
    const saveData = Boolean(nav.connection && nav.connection.saveData);
    const coarsePointer = typeof window.matchMedia === 'function' &&
      window.matchMedia('(pointer: coarse)').matches;
    const smallViewport = typeof window.matchMedia === 'function' &&
      window.matchMedia('(max-width: 767px)').matches;

    const constrainedMemory = deviceMemory > 0 && deviceMemory <= 4;
    const constrainedCpu = hardwareConcurrency > 0 && hardwareConcurrency <= 4;
    const constrainedMobile = smallViewport && coarsePointer;

    if (saveData || constrainedMemory || (constrainedMobile && constrainedCpu)) {
      document.documentElement.classList.add('perf-lite');
      this.log('Performance-lite mode enabled');
    }
  },

  getForcedPerformanceProfile() {
    if (typeof window === 'undefined' || !window.location) {
      return '';
    }

    try {
      const params = new URLSearchParams(window.location.search);
      const value = (params.get('perf') || '').toLowerCase();
      return value === 'lite' || value === 'full' ? value : '';
    } catch (error) {
      return '';
    }
  },

  setupPerformanceNotice() {
    const root = document.documentElement;
    const notice = document.querySelector('[data-perf-lite-notice]');

    if (!root || !notice || !root.classList.contains('perf-lite')) {
      return;
    }

    const storageKey = 'portfolio.perfLiteNoticeDismissed';

    try {
      if (window.localStorage && window.localStorage.getItem(storageKey) === 'true') {
        return;
      }
    } catch (error) {
      // Storage may be unavailable in private browsing; the notice still works.
    }

    notice.hidden = false;
    requestAnimationFrame(() => {
      notice.classList.add('perf-lite-notice--visible');
    });

    const dismissButton = notice.querySelector('[data-perf-lite-notice-dismiss]');
    if (!dismissButton) {
      return;
    }

    dismissButton.addEventListener('click', () => {
      notice.classList.remove('perf-lite-notice--visible');

      try {
        if (window.localStorage) {
          window.localStorage.setItem(storageKey, 'true');
        }
      } catch (error) {
        // Ignore storage failures; visual dismissal still applies.
      }

      window.setTimeout(() => {
        notice.hidden = true;
      }, 220);
    });
  },

  /**
   * Check if browser supports backdrop-filter
   * @returns {boolean} True if backdrop-filter is supported
   */
  supportsBackdropFilter() {
    // Check for CSS.supports API
    if (typeof CSS === 'undefined' || typeof CSS.supports !== 'function') {
      return false;
    }
    
    try {
      // Check both standard and webkit-prefixed versions
      return CSS.supports('backdrop-filter', 'blur(10px)') || 
             CSS.supports('-webkit-backdrop-filter', 'blur(10px)');
    } catch (error) {
      // If CSS.supports throws an exception, assume not supported
      return false;
    }
  },

  /**
   * Detect Chromium Edge for targeted performance tuning.
   * @returns {boolean} True if current browser is Edge
   */
  isEdgeBrowser() {
    if (typeof navigator === 'undefined' || !navigator.userAgent) {
      return false;
    }

    return /Edg\//.test(navigator.userAgent);
  },

  /**
   * Initialize all enabled modules
   */
  initializeModules() {
    // Initialize Navigation module (already implemented)
    if (this.config.modules.navigation) {
      try {
        // Navigation module auto-initializes, just verify it exists
        if (typeof Navigation !== 'undefined') {
          this.modules.Navigation = Navigation;
          this.log('Navigation module loaded');
        } else {
          this.log('Navigation module not found; continuing without enhancement');
        }
      } catch (error) {
        this.handleError('Navigation initialization failed', error);
      }
    }

    // Initialize Animations module (when available)
    if (this.config.modules.animations) {
      try {
        if (typeof Animations !== 'undefined' && Animations.init) {
          Animations.init();
          this.modules.Animations = Animations;
          this.log('Animations module initialized');
        } else {
          this.log('Animations module not yet implemented');
        }
      } catch (error) {
        this.handleError('Animations initialization failed', error);
      }
    }

    // Initialize ImageLoader module (when available)
    if (this.config.modules.imageLoader) {
      try {
        if (typeof ImageLoader !== 'undefined' && ImageLoader.init) {
          ImageLoader.init();
          this.modules.ImageLoader = ImageLoader;
          this.log('ImageLoader module initialized');
        } else {
          this.log('ImageLoader module not yet implemented');
        }
      } catch (error) {
        this.handleError('ImageLoader initialization failed', error);
      }
    }
  },

  /**
   * Setup global error handlers for graceful degradation
   */
  setupErrorHandlers() {
    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      this.handleError('Uncaught error', event.error);
      // Prevent default error handling to avoid console spam
      event.preventDefault();
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError('Unhandled promise rejection', event.reason);
      event.preventDefault();
    });
  },

  /**
   * Handle errors gracefully
   * @param {string} message - Error message
   * @param {Error} error - Error object
   */
  handleError(message, error) {
    if (this.config.debug) {
      console.error(`[App Error] ${message}:`, error);
    } else {
      // In production, log minimal info
      console.warn(`[App] ${message}`);
    }
    
    // Could send to error tracking service here
    // e.g., Sentry, LogRocket, etc.
  },

  /**
   * Fallback mode when JavaScript fails
   * Ensures basic functionality still works
   */
  fallbackMode() {
    this.log('Running in fallback mode - basic functionality only');
    
    // Add fallback class to body for CSS hooks
    document.body.classList.add('js-fallback');
    
    // Ensure basic navigation still works (anchor links)
    // Browser's native anchor link behavior will handle this
  },

  /**
   * Log messages (only in debug mode)
   * @param {string} message - Message to log
   */
  log(message) {
    if (this.config.debug) {
      console.log(`[App] ${message}`);
    }
  },

  /**
   * Enable debug mode
   */
  enableDebug() {
    this.config.debug = true;
    this.log('Debug mode enabled');
  }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  // DOM already loaded
  App.init();
}

// Export for testing and external access
if (typeof module !== 'undefined' && module.exports) {
  module.exports = App;
}

// Make App available globally for debugging
if (typeof window !== 'undefined') {
  window.App = App;
}
