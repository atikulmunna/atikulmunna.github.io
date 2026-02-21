/**
 * Property-Based Tests for Experience Chronological Order
 * Feature: portfolio-website
 * Task 12.3: Write property test for chronological order
 *
 * Validates:
 * - Property 34: Experience Chronological Order
 */

const fc = require('fast-check');
const fs = require('fs');
const path = require('path');

const propertyTestConfig = {
  numRuns: 100,
  verbose: true
};

function yearFromDateText(text) {
  const years = text.match(/\b(19|20)\d{2}\b/g) || [];
  if (years.length === 0) return null;
  return Math.max(...years.map(Number));
}

describe('Property 34: Experience Chronological Order', () => {
  test('property: adjacent experience items are reverse chronological', () => {
    const indexHTML = fs.readFileSync(path.join(__dirname, '../../index.html'), 'utf-8');
    document.body.innerHTML = indexHTML;

    const dateNodes = Array.from(document.querySelectorAll('.timeline-date'));
    expect(dateNodes.length).toBeGreaterThan(0);

    const years = dateNodes
      .map((node) => yearFromDateText(node.textContent || ''))
      .filter((value) => value !== null);

    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: Math.max(0, years.length - 2) }),
        (index) => {
          if (years.length < 2) return true;
          return years[index] >= years[index + 1];
        }
      ),
      propertyTestConfig
    );
  });
});
