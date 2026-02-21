/**
 * Unit Tests for Main Application Module
 * Tests initialization, error handling, and module loading
 */

// Mock the Navigation module
global.Navigation = {
  init: jest.fn(),
  state: { isMenuOpen: false }
};

// Mock DOM - will be set up in beforeEach

describe('Main Application Module', () => {
  let App;
  let consoleErrorSpy;
  let consoleWarnSpy;
  let consoleLogSpy;

  beforeEach(() => {
    // Reset module
    jest.resetModules();
    
    // Mock DOM classList
    document.body.classList = {
      add: jest.fn(),
      remove: jest.fn()
    };
    
    // Mock console methods
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    
    // Load the module
    App = require('../../js/main.js');
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  describe('Initialization', () => {
    test('should have correct initial configuration', () => {
      expect(App.config.debug).toBe(false);
      expect(App.config.modules.navigation).toBe(true);
      expect(App.config.modules.animations).toBe(true);
      expect(App.config.modules.imageLoader).toBe(true);
    });

    test('should initialize without errors', () => {
      expect(() => App.init()).not.toThrow();
    });

    test('should load Navigation module when available', () => {
      App.init();
      expect(App.modules.Navigation).toBe(Navigation);
    });
  });

  describe('Error Handling', () => {
    test('should handle errors gracefully in production mode', () => {
      App.config.debug = false;
      App.handleError('Test error', new Error('Test'));
      
      expect(consoleWarnSpy).toHaveBeenCalledWith('[App] Test error');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    test('should log detailed errors in debug mode', () => {
      App.config.debug = true;
      const testError = new Error('Test error');
      App.handleError('Test error', testError);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[App Error] Test error:',
        testError
      );
    });

    test('should enter fallback mode on initialization failure', () => {
      // Create a fresh mock for this test
      const mockClassListAdd = jest.fn();
      document.body.classList.add = mockClassListAdd;
      
      // Force an error during initialization
      const originalInit = App.initializeModules;
      App.initializeModules = jest.fn(() => {
        throw new Error('Init failed');
      });
      
      App.init();
      
      expect(mockClassListAdd).toHaveBeenCalledWith('js-fallback');
      
      // Restore
      App.initializeModules = originalInit;
    });
  });

  describe('Module Loading', () => {
    test('should initialize Animations when available and enabled', () => {
      global.Animations = { init: jest.fn() };
      App.config.modules.animations = true;

      App.initializeModules();

      expect(global.Animations.init).toHaveBeenCalledTimes(1);
      expect(App.modules.Animations).toBe(global.Animations);
    });

    test('should initialize ImageLoader when available and enabled', () => {
      global.ImageLoader = { init: jest.fn() };
      App.config.modules.imageLoader = true;

      App.initializeModules();

      expect(global.ImageLoader.init).toHaveBeenCalledTimes(1);
      expect(App.modules.ImageLoader).toBe(global.ImageLoader);
    });

    test('should not initialize Animations when disabled', () => {
      global.Animations = { init: jest.fn() };
      App.config.modules.animations = false;
      App.modules.Animations = null;
      
      App.initializeModules();
      
      expect(global.Animations.init).not.toHaveBeenCalled();
      expect(App.modules.Animations).toBeNull();
    });

    test('should not initialize ImageLoader when disabled', () => {
      global.ImageLoader = { init: jest.fn() };
      App.config.modules.imageLoader = false;
      App.modules.ImageLoader = null;
      
      App.initializeModules();
      
      expect(global.ImageLoader.init).not.toHaveBeenCalled();
      expect(App.modules.ImageLoader).toBeNull();
    });

    test('should handle missing Navigation module gracefully', () => {
      const originalNav = global.Navigation;
      global.Navigation = undefined;
      
      // Reset modules to null before test
      App.modules.Navigation = null;
      
      expect(() => App.initializeModules()).not.toThrow();
      expect(App.modules.Navigation).toBeNull();
      
      // Restore
      global.Navigation = originalNav;
    });

    test('should continue initializing remaining modules when one module fails', () => {
      global.Animations = {
        init: jest.fn(() => {
          throw new Error('Animations failed');
        })
      };
      global.ImageLoader = { init: jest.fn() };
      App.config.modules.animations = true;
      App.config.modules.imageLoader = true;

      expect(() => App.initializeModules()).not.toThrow();
      expect(global.ImageLoader.init).toHaveBeenCalledTimes(1);
    });
  });

  describe('Debug Mode', () => {
    test('should enable debug mode', () => {
      App.config.debug = false;
      App.enableDebug();
      
      expect(App.config.debug).toBe(true);
    });

    test('should log messages only in debug mode', () => {
      App.config.debug = false;
      App.log('Test message');
      expect(consoleLogSpy).not.toHaveBeenCalled();
      
      App.config.debug = true;
      App.log('Test message');
      expect(consoleLogSpy).toHaveBeenCalledWith('[App] Test message');
    });
  });

  describe('Fallback Mode', () => {
    test('should add fallback class to body', () => {
      // Create a fresh mock for this test
      const mockClassListAdd = jest.fn();
      document.body.classList.add = mockClassListAdd;
      
      App.fallbackMode();
      
      expect(mockClassListAdd).toHaveBeenCalledWith('js-fallback');
    });
  });

  describe('Error Handlers Setup', () => {
    test('should setup global error handlers', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      
      App.setupErrorHandlers();
      
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'error',
        expect.any(Function)
      );
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'unhandledrejection',
        expect.any(Function)
      );
      
      addEventListenerSpy.mockRestore();
    });
  });
});
