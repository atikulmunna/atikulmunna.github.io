/**
 * Unit Tests for Backdrop-Filter Support Detection
 * Task 3.3: Write unit test for backdrop-filter support detection
 * 
 * **Validates: Requirements 4.6**
 * 
 * Tests CSS.supports() detection for backdrop-filter and fallback class application
 */

describe('Backdrop-Filter Support Detection', () => {
  let App;
  let originalCSS;

  beforeEach(() => {
    // Reset modules
    jest.resetModules();
    
    // Save original CSS object
    originalCSS = global.CSS;
    
    // Mock document.documentElement.classList
    document.documentElement.classList = {
      add: jest.fn(),
      remove: jest.fn(),
      contains: jest.fn()
    };
    
    // Mock document.body.classList
    document.body.classList = {
      add: jest.fn(),
      remove: jest.fn()
    };
    
    // Load the module
    App = require('../../js/main.js');
  });

  afterEach(() => {
    // Restore original CSS object
    global.CSS = originalCSS;
  });

  describe('CSS.supports() Detection', () => {
    test('should detect backdrop-filter support when CSS.supports returns true', () => {
      // Mock CSS.supports to return true for backdrop-filter
      global.CSS = {
        supports: jest.fn((property, value) => {
          if (property === 'backdrop-filter' && value === 'blur(10px)') {
            return true;
          }
          return false;
        })
      };

      const result = App.supportsBackdropFilter();

      expect(result).toBe(true);
      expect(global.CSS.supports).toHaveBeenCalledWith('backdrop-filter', 'blur(10px)');
    });

    test('should detect webkit-backdrop-filter support when standard is not supported', () => {
      // Mock CSS.supports to return true only for webkit prefix
      global.CSS = {
        supports: jest.fn((property, value) => {
          if (property === '-webkit-backdrop-filter' && value === 'blur(10px)') {
            return true;
          }
          return false;
        })
      };

      const result = App.supportsBackdropFilter();

      expect(result).toBe(true);
      expect(global.CSS.supports).toHaveBeenCalledWith('backdrop-filter', 'blur(10px)');
      expect(global.CSS.supports).toHaveBeenCalledWith('-webkit-backdrop-filter', 'blur(10px)');
    });

    test('should return false when neither backdrop-filter nor webkit version is supported', () => {
      // Mock CSS.supports to return false for both
      global.CSS = {
        supports: jest.fn(() => false)
      };

      const result = App.supportsBackdropFilter();

      expect(result).toBe(false);
      expect(global.CSS.supports).toHaveBeenCalledWith('backdrop-filter', 'blur(10px)');
      expect(global.CSS.supports).toHaveBeenCalledWith('-webkit-backdrop-filter', 'blur(10px)');
    });

    test('should return false when CSS.supports is not available', () => {
      // Mock CSS as undefined
      global.CSS = undefined;

      const result = App.supportsBackdropFilter();

      expect(result).toBe(false);
    });

    test('should return false when CSS.supports function is not available', () => {
      // Mock CSS without supports function
      global.CSS = {};

      const result = App.supportsBackdropFilter();

      expect(result).toBe(false);
    });
  });

  describe('Fallback Class Application', () => {
    test('should add no-backdrop-filter class when not supported', () => {
      // Mock CSS.supports to return false
      global.CSS = {
        supports: jest.fn(() => false)
      };

      const mockClassListAdd = jest.fn();
      document.documentElement.classList.add = mockClassListAdd;

      App.detectFeatureSupport();

      expect(mockClassListAdd).toHaveBeenCalledWith('no-backdrop-filter');
    });

    test('should not add no-backdrop-filter class when supported', () => {
      // Mock CSS.supports to return true
      global.CSS = {
        supports: jest.fn((property) => {
          return property === 'backdrop-filter';
        })
      };

      const mockClassListAdd = jest.fn();
      document.documentElement.classList.add = mockClassListAdd;

      App.detectFeatureSupport();

      expect(mockClassListAdd).not.toHaveBeenCalledWith('no-backdrop-filter');
    });

    test('should add class to documentElement, not body', () => {
      // Mock CSS.supports to return false
      global.CSS = {
        supports: jest.fn(() => false)
      };

      const mockDocumentElementAdd = jest.fn();
      const mockBodyAdd = jest.fn();
      
      document.documentElement.classList.add = mockDocumentElementAdd;
      document.body.classList.add = mockBodyAdd;

      App.detectFeatureSupport();

      expect(mockDocumentElementAdd).toHaveBeenCalledWith('no-backdrop-filter');
      expect(mockBodyAdd).not.toHaveBeenCalledWith('no-backdrop-filter');
    });
  });

  describe('Integration with App Initialization', () => {
    test('should call detectFeatureSupport during initialization', () => {
      // Mock CSS.supports
      global.CSS = {
        supports: jest.fn(() => true)
      };

      // Spy on detectFeatureSupport
      const detectSpy = jest.spyOn(App, 'detectFeatureSupport');

      App.init();

      expect(detectSpy).toHaveBeenCalled();
    });

    test('should detect features before initializing modules', () => {
      // Mock CSS.supports
      global.CSS = {
        supports: jest.fn(() => true)
      };

      const callOrder = [];

      // Spy on methods
      jest.spyOn(App, 'detectFeatureSupport').mockImplementation(() => {
        callOrder.push('detectFeatureSupport');
      });
      
      jest.spyOn(App, 'initializeModules').mockImplementation(() => {
        callOrder.push('initializeModules');
      });

      App.init();

      expect(callOrder).toEqual(['detectFeatureSupport', 'initializeModules']);
    });

    test('should handle errors in feature detection gracefully', () => {
      // Mock CSS.supports to throw error
      global.CSS = {
        supports: jest.fn(() => {
          throw new Error('CSS.supports failed');
        })
      };

      // Should not throw
      expect(() => App.init()).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    test('should handle CSS.supports returning non-boolean values', () => {
      // Mock CSS.supports to return truthy/falsy values
      global.CSS = {
        supports: jest.fn(() => 'yes') // Truthy but not boolean
      };

      const result = App.supportsBackdropFilter();

      // Should still work with truthy values
      expect(result).toBeTruthy();
    });

    test('should handle CSS.supports throwing an exception', () => {
      // Mock CSS.supports to throw
      global.CSS = {
        supports: jest.fn(() => {
          throw new Error('Not implemented');
        })
      };

      // Should not throw, should return false
      expect(() => {
        const result = App.supportsBackdropFilter();
        expect(result).toBe(false);
      }).not.toThrow();
    });

    test('should check both standard and webkit prefixed properties', () => {
      // Mock CSS.supports
      global.CSS = {
        supports: jest.fn(() => false)
      };

      App.supportsBackdropFilter();

      // Should check both properties
      expect(global.CSS.supports).toHaveBeenCalledWith('backdrop-filter', 'blur(10px)');
      expect(global.CSS.supports).toHaveBeenCalledWith('-webkit-backdrop-filter', 'blur(10px)');
      expect(global.CSS.supports).toHaveBeenCalledTimes(2);
    });

    test('should use blur(10px) as test value', () => {
      // Mock CSS.supports
      global.CSS = {
        supports: jest.fn(() => true)
      };

      App.supportsBackdropFilter();

      // Should use blur(10px) as the test value
      expect(global.CSS.supports).toHaveBeenCalledWith(
        expect.any(String),
        'blur(10px)'
      );
    });
  });

  describe('Logging', () => {
    test('should log when backdrop-filter is supported in debug mode', () => {
      // Enable debug mode
      App.config.debug = true;
      
      // Mock console.log
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Mock CSS.supports to return true
      global.CSS = {
        supports: jest.fn(() => true)
      };

      App.detectFeatureSupport();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('backdrop-filter is supported')
      );

      consoleLogSpy.mockRestore();
    });

    test('should log when backdrop-filter is not supported in debug mode', () => {
      // Enable debug mode
      App.config.debug = true;
      
      // Mock console.log
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Mock CSS.supports to return false
      global.CSS = {
        supports: jest.fn(() => false)
      };

      App.detectFeatureSupport();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('backdrop-filter not supported')
      );

      consoleLogSpy.mockRestore();
    });

    test('should not log in production mode', () => {
      // Disable debug mode
      App.config.debug = false;
      
      // Mock console.log
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Mock CSS.supports
      global.CSS = {
        supports: jest.fn(() => false)
      };

      App.detectFeatureSupport();

      // Should not log in production mode
      expect(consoleLogSpy).not.toHaveBeenCalled();

      consoleLogSpy.mockRestore();
    });
  });
});
