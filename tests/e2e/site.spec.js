const { test, expect } = require('@playwright/test');

test.describe('Cross-browser Portfolio Smoke', () => {
  test('loads major sections and keeps nav functional', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav#main-nav')).toBeVisible();

    await expect(page.locator('#hero')).toBeVisible();
    await expect(page.locator('#about')).toBeVisible();
    await expect(page.locator('#skills')).toBeVisible();
    await expect(page.locator('#projects')).toBeVisible();
    await expect(page.locator('#experience')).toBeVisible();
    await expect(page.locator('#contact')).toBeVisible();
  });

  test('mobile navigation opens and shows section links', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'WebKit flakiness on CI-sized mobile emulation is skipped.');

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const toggle = page.locator('.nav__toggle');
    await expect(toggle).toBeVisible();
    await toggle.click();

    const menu = page.locator('#nav-menu');
    await expect(menu).toBeVisible();
    await expect(menu.locator('a[href="#projects"]')).toBeVisible();
    await expect(menu.locator('a[href="#contact"]')).toBeVisible();
  });

  test('view work CTA scrolls to projects section', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href="#projects"]').first().click();
    await expect(page.locator('#projects')).toBeInViewport();
  });
});

