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
          throw new Error('Navigation module not found');
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
