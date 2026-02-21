/**
 * Automated Accessibility Audit
 * Task 18.2: Run automated accessibility audit
 */

const fs = require('fs');
const path = require('path');
const { axe, toHaveNoViolations } = require('jest-axe');

expect.extend(toHaveNoViolations);

describe('Automated Accessibility Audit', () => {
  test('homepage should have no serious or critical a11y violations', async () => {
    const indexHTML = fs.readFileSync(path.join(__dirname, '../../index.html'), 'utf-8');
    document.body.innerHTML = indexHTML;

    const results = await axe(document.body, {
      rules: {
        // Color contrast checks are covered by deterministic property tests
        'color-contrast': { enabled: false }
      }
    });

    const severeViolations = results.violations.filter(
      (violation) => violation.impact === 'serious' || violation.impact === 'critical'
    );

    expect(severeViolations).toHaveLength(0);
  });
});
