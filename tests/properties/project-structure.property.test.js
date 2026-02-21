/**
 * Property-Based Tests for Project Card Structure
 * Feature: portfolio-website
 * Task 11.3: Write property test for project card structure
 *
 * Validates:
 * - Property 33: Project Card Structure
 */

const fc = require('fast-check');
const fs = require('fs');
const path = require('path');

const propertyTestConfig = {
  numRuns: 100,
  verbose: true
};

describe('Property 33: Project Card Structure', () => {
  test('property: each project card includes description and visual element', () => {
    const indexHTML = fs.readFileSync(path.join(__dirname, '../../index.html'), 'utf-8');
    document.body.innerHTML = indexHTML;

    const projectCards = Array.from(document.querySelectorAll('.project-card'));
    expect(projectCards.length).toBeGreaterThan(0);

    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: projectCards.length - 1 }),
        (index) => {
          const card = projectCards[index];
          const hasDescription = !!card.querySelector('.project-card__description');
          const hasImage = !!card.querySelector('.project-card__image img');
          const hasPlaceholder = !!card.querySelector('.project-card__placeholder');
          return hasDescription && (hasImage || hasPlaceholder);
        }
      ),
      propertyTestConfig
    );
  });
});
