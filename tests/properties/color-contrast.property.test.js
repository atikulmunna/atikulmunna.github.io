/**
 * Property-Based Tests for Color Contrast
 * Feature: portfolio-website
 * Task 18.1: Write property tests for color contrast
 *
 * Validates:
 * - Property 2: WCAG AA Color Contrast
 * - Property 9: Text Readability Over Glass
 */

const fc = require('fast-check');
const fs = require('fs');
const path = require('path');

const propertyTestConfig = {
  numRuns: 100,
  verbose: true
};

function parseColorVariables() {
  const variablesCSS = fs.readFileSync(path.join(__dirname, '../../css/variables.css'), 'utf-8');

  const vars = {};
  const regex = /--([a-z0-9-]+):\s*([^;]+);/gi;
  let match = regex.exec(variablesCSS);
  while (match) {
    vars[`--${match[1]}`] = match[2].trim();
    match = regex.exec(variablesCSS);
  }

  return vars;
}

function resolveVarValue(value, vars) {
  if (!value) return value;

  let resolved = value.trim();
  const varMatch = resolved.match(/^var\((--[a-z0-9-]+)\)$/i);
  if (!varMatch) return resolved;

  const referenced = vars[varMatch[1]];
  if (!referenced) return resolved;

  if (referenced.trim().startsWith('var(')) {
    return resolveVarValue(referenced, vars);
  }

  return referenced.trim();
}

function hexToRgb(hex) {
  const normalized = hex.replace('#', '').trim();
  const value = normalized.length === 3
    ? normalized.split('').map((char) => char + char).join('')
    : normalized;

  const intValue = parseInt(value, 16);
  return {
    r: (intValue >> 16) & 255,
    g: (intValue >> 8) & 255,
    b: intValue & 255
  };
}

function parseRgba(rgbaValue) {
  const match = rgbaValue.match(/rgba?\(([^)]+)\)/i);
  if (!match) return null;
  const parts = match[1].split(',').map((part) => part.trim());
  return {
    r: Number(parts[0]),
    g: Number(parts[1]),
    b: Number(parts[2]),
    a: parts[3] !== undefined ? Number(parts[3]) : 1
  };
}

function srgbToLinear(channel) {
  const value = channel / 255;
  if (value <= 0.03928) return value / 12.92;
  return ((value + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(rgb) {
  const r = srgbToLinear(rgb.r);
  const g = srgbToLinear(rgb.g);
  const b = srgbToLinear(rgb.b);
  return (0.2126 * r) + (0.7152 * g) + (0.0722 * b);
}

function contrastRatio(foreground, background) {
  const fgLum = relativeLuminance(foreground);
  const bgLum = relativeLuminance(background);
  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);
  return (lighter + 0.05) / (darker + 0.05);
}

function compositeRgbaOverBackground(fgRgba, bgRgb) {
  const alpha = fgRgba.a;
  return {
    r: Math.round((fgRgba.r * alpha) + (bgRgb.r * (1 - alpha))),
    g: Math.round((fgRgba.g * alpha) + (bgRgb.g * (1 - alpha))),
    b: Math.round((fgRgba.b * alpha) + (bgRgb.b * (1 - alpha)))
  };
}

describe('Property 2: WCAG AA Color Contrast', () => {
  test('property: core text/background pairs meet minimum 4.5:1 contrast', () => {
    const vars = parseColorVariables();

    const colorPairs = [
      [vars['--color-text-primary'], vars['--color-bg-light']],
      [vars['--color-text-secondary'], vars['--color-bg-light']],
      [vars['--color-text-light'], vars['--color-bg-dark']],
      [vars['--color-primary-dark'], vars['--color-primary-light']],
      [vars['--color-primary-light'], vars['--color-secondary-dark']]
    ];

    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: colorPairs.length - 1 }),
        (index) => {
          const [fgHexOrVar, bgHexOrVar] = colorPairs[index];
          const fg = hexToRgb(resolveVarValue(fgHexOrVar, vars));
          const bg = hexToRgb(resolveVarValue(bgHexOrVar, vars));
          return contrastRatio(fg, bg) >= 4.5;
        }
      ),
      propertyTestConfig
    );
  });
});

describe('Property 9: Text Readability Over Glass', () => {
  test('property: text over common glass backgrounds remains readable at 4.5:1', () => {
    const vars = parseColorVariables();

    const bgLight = hexToRgb(resolveVarValue(vars['--color-bg-light'], vars));
    const bgDark = hexToRgb(resolveVarValue(vars['--color-bg-dark'], vars));

    const cases = [
      {
        text: hexToRgb(resolveVarValue(vars['--color-primary-light'], vars)),
        glassBackground: compositeRgbaOverBackground(parseRgba('rgba(38, 38, 38, 0.9)'), bgLight)
      },
      {
        text: hexToRgb(resolveVarValue(vars['--color-primary-dark'], vars)),
        glassBackground: compositeRgbaOverBackground(parseRgba('rgba(168, 168, 168, 0.9)'), bgLight)
      },
      {
        text: hexToRgb(resolveVarValue(vars['--color-text-primary'], vars)),
        glassBackground: compositeRgbaOverBackground(parseRgba('rgba(245, 245, 245, 0.95)'), bgLight)
      },
      {
        text: hexToRgb(resolveVarValue(vars['--color-text-light'], vars)),
        glassBackground: compositeRgbaOverBackground(parseRgba('rgba(17, 17, 17, 0.95)'), bgDark)
      }
    ];

    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: cases.length - 1 }),
        (index) => {
          const sample = cases[index];
          return contrastRatio(sample.text, sample.glassBackground) >= 4.5;
        }
      ),
      propertyTestConfig
    );
  });
});
