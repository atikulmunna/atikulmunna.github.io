/**
 * Contact Section Unit Tests
 * Feature: portfolio-website
 * Task 13.3: Write unit test for Contact section structure
 *
 * Validates: Requirements 1.6, 11.7
 */

const fs = require('fs');
const path = require('path');

describe('Contact Section Structure', () => {
  beforeEach(() => {
    const indexHTML = fs.readFileSync(path.join(__dirname, '../../index.html'), 'utf-8');
    document.body.innerHTML = indexHTML;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('Contact section exists', () => {
    const section = document.getElementById('contact');
    expect(section).toBeTruthy();
    expect(section.tagName.toLowerCase()).toBe('section');
  });

  test('Contact section provides multiple contact methods', () => {
    const methods = document.querySelectorAll('#contact .contact-card');
    expect(methods.length).toBeGreaterThanOrEqual(2);
  });

  test('Contact methods include actionable links', () => {
    const mail = document.querySelector('#contact a[href^="mailto:"]');
    const linkedin = document.querySelector('#contact a[href*="linkedin.com"]');
    const github = document.querySelector('#contact a[href*="github.com"]');
    expect(mail).toBeTruthy();
    expect(linkedin).toBeTruthy();
    expect(github).toBeTruthy();
  });
});
