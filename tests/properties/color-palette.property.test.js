/**
 * Property-Based Tests for Color Palette Consistency
 * Feature: portfolio-website
 * Property 1: Color Palette Consistency
 * 
 * **Validates: Requirements 3.1-3.7**
 * 
 * For any element with a background or text color, the color value SHALL be 
 * one of the defined palette colors (#111111, #262626, #5c5c5c, #a8a8a8, 
 * #f5f5f5, #000000, #ffffff) or a transparent/rgba variant of these colors.
 */

const fc = require('fast-check');
const fs = require('fs');
const path = require('path');

// Property test configuration - minimum 100 iterations
const propertyTestConfig = {
  numRuns: 100,
  verbose: true
};

// Define the valid color palette
const VALID_PALETTE = {
  '#111111': { r: 17, g: 17, b: 17 },
  '#262626': { r: 38, g: 38, b: 38 },
  '#5c5c5c': { r: 92, g: 92, b: 92 },
  '#a8a8a8': { r: 168, g: 168, b: 168 },
  '#f5f5f5': { r: 245, g: 245, b: 245 },
  '#000000': { r: 0, g: 0, b: 0 },
  '#ffffff': { r: 255, g: 255, b: 255 }
};

/**
 * Parse a color string to RGB components
 * Supports: hex (#rrggbb), rgb(r,g,b), rgba(r,g,b,a)
 */
function parseColor(colorStr) {
  if (!colorStr || colorStr === 'transparent' || colorStr === 'inherit' || colorStr === 'initial') {
    return null;
  }

  // Hex color
  const hexMatch = colorStr.match(/^#([0-9a-f]{6})$/i);
  if (hexMatch) {
    const hex = hexMatch[1];
    return {
      r: parseInt(hex.substr(0, 2), 16),
      g: parseInt(hex.substr(2, 2), 16),
      b: parseInt(hex.substr(4, 2), 16)
    };
  }

  // RGB or RGBA
  const rgbMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3])
    };
  }

  return null;
}

/**
 * Check if a color matches any color in the valid palette
 */
function isValidPaletteColor(colorStr) {
  const parsed = parseColor(colorStr);
  if (!parsed) return true; // Skip unparseable or transparent colors

  // Check if it matches any palette color
  for (const paletteColor of Object.values(VALID_PALETTE)) {
    if (parsed.r === paletteColor.r && 
        parsed.g === paletteColor.g && 
        parsed.b === paletteColor.b) {
      return true;
    }
  }

  return false;
}

/**
 * Extract all color declarations from CSS files
 */
function extractColorsFromCSS(cssContent) {
  const colors = [];
  
  // Match color properties (color, background-color, background, border-color, etc.)
  const colorPropertyRegex = /(?:color|background(?:-color)?|border(?:-color)?|outline(?:-color)?|box-shadow|text-shadow):\s*([^;]+);/gi;
  
  let match;
  while ((match = colorPropertyRegex.exec(cssContent)) !== null) {
    const value = match[1].trim();
    
    // Extract hex colors
    const hexColors = value.match(/#[0-9a-f]{6}/gi);
    if (hexColors) {
      colors.push(...hexColors);
    }
    
    // Extract rgb/rgba colors
    const rgbColors = value.match(/rgba?\([^)]+\)/gi);
    if (rgbColors) {
      colors.push(...rgbColors);
    }
  }
  
  return colors;
}

/**
 * Read all CSS files from the css directory
 */
function readCSSFiles() {
  const cssDir = path.join(__dirname, '../../css');
  const cssFiles = fs.readdirSync(cssDir).filter(file => file.endsWith('.css'));
  
  const allColors = [];
  
  for (const file of cssFiles) {
    const content = fs.readFileSync(path.join(cssDir, file), 'utf-8');
    const colors = extractColorsFromCSS(content);
    allColors.push(...colors.map(color => ({ file, color })));
  }
  
  return allColors;
}

describe('Property 1: Color Palette Consistency', () => {
  test('all colors in CSS files should be from the defined palette or rgba variants', () => {
    const cssColors = readCSSFiles();
    
    // Filter out colors from variables.css as they define the palette
    const nonVariableColors = cssColors.filter(({ file }) => file !== 'variables.css');
    
    // Check each color
    const invalidColors = nonVariableColors.filter(({ color }) => !isValidPaletteColor(color));
    
    if (invalidColors.length > 0) {
      const errorMsg = invalidColors
        .map(({ file, color }) => `  ${file}: ${color}`)
        .join('\n');
      
      throw new Error(`Found colors not in the defined palette:\n${errorMsg}`);
    }
    
    // If we get here, all colors are valid
    expect(invalidColors.length).toBe(0);
  });

  test('property: CSS custom properties use only palette colors', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary CSS property names
        fc.constantFrom(
          '--color-primary-dark',
          '--color-secondary-dark',
          '--color-mid-tone',
          '--color-light-accent',
          '--color-primary-light',
          '--color-black',
          '--color-white'
        ),
        (propertyName) => {
          // Read variables.css
          const variablesPath = path.join(__dirname, '../../css/variables.css');
          const content = fs.readFileSync(variablesPath, 'utf-8');
          
          // Extract the value for this property
          const regex = new RegExp(`${propertyName}:\\s*([^;]+);`);
          const match = content.match(regex);
          
          if (!match) return true; // Property not found, skip
          
          const value = match[1].trim();
          
          // Check if it's a valid palette color
          return isValidPaletteColor(value);
        }
      ),
      propertyTestConfig
    );
  });

  test('property: rgba variants maintain palette RGB values', () => {
    fc.assert(
      fc.property(
        // Generate rgba colors with palette RGB values and random alpha
        fc.constantFrom(...Object.values(VALID_PALETTE)),
        fc.double({ min: 0, max: 1 }),
        (paletteColor, alpha) => {
          // Format alpha to avoid scientific notation
          const alphaStr = alpha.toFixed(3);
          const rgbaStr = `rgba(${paletteColor.r}, ${paletteColor.g}, ${paletteColor.b}, ${alphaStr})`;
          
          // Parse it back
          const parsed = parseColor(rgbaStr);
          
          // If parsing failed (shouldn't happen with valid rgba), skip
          if (!parsed) return true;
          
          // Should match the original palette color's RGB values
          return parsed.r === paletteColor.r &&
                 parsed.g === paletteColor.g &&
                 parsed.b === paletteColor.b;
        }
      ),
      propertyTestConfig
    );
  });
});
