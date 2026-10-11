import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const deck = (page) => page.locator('#portfolio');
async function settled(page, state) {
  await expect(deck(page)).toHaveAttribute('data-state', state);
  await expect(deck(page)).toHaveAttribute('data-busy', 'false');
}
async function shot(page, name) {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await mkdir('qa', { recursive: true });
  await page.screenshot({ path: `qa/${name}.png`, animations: 'disabled' });
}
async function wheel(page, delta) {
  await page.waitForTimeout(210); // a new physical gesture after momentum has stopped
  await page.mouse.wheel(0, delta);
}

test('wheel descends from above, preserves the left rails, and reverses without skipping', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await page.goto('/');
  await settled(page, 'home');
  await shot(page, 'desktop-home');
  await page.mouse.move(720, 450);
  await page.mouse.wheel(0, 110);
  await expect(deck(page)).toHaveAttribute('data-busy', 'true');
  const moving = await page.locator('[data-sheet="1"]').boundingBox();
  expect(moving.y).toBeLessThan(0);
  for (let i = 0; i < 9; i++) { await page.mouse.wheel(0, 80); await page.waitForTimeout(90); }
  await settled(page, 'work-stack');
  const work = await page.locator('[data-sheet="1"]').boundingBox();
  expect(work.width).toBe(1296);
  expect(work.x).toBe(144);
  expect((await page.getByRole('button', { name: 'Open Home full screen', exact: true }).boundingBox()).x).toBe(0);
  expect(work.height).toBe(900);
  await shot(page, 'desktop-work-stack');
  await wheel(page, 120);
  await settled(page, 'about-stack');
  expect((await page.locator('[data-sheet="2"]').boundingBox()).width).toBe(1152);
  await shot(page, 'desktop-about-stack');
  await wheel(page, 120);
  await settled(page, 'contact-stack');
  expect((await page.locator('[data-sheet="3"]').boundingBox()).width).toBeCloseTo(1008, 0);
  await expect(page.getByRole('button', { name: 'Open About full screen', exact: true })).toBeVisible();
  expect((await page.locator('[data-sheet="3"]').boundingBox()).x).toBeCloseTo(432, 0);
  expect((await page.getByRole('button', { name: 'Open Work full screen', exact: true }).boundingBox()).x).toBe(144);
  expect((await page.getByRole('button', { name: 'Open About full screen', exact: true }).boundingBox()).x).toBe(288);
  await expect(page.getByRole('button', { name: 'Open Home full screen', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Open Work full screen', exact: true })).toBeVisible();
  await shot(page, 'desktop-contact-stack');
  await wheel(page, -120);
  await settled(page, 'about-stack');
  await wheel(page, -120);
  await settled(page, 'work-stack');
  await wheel(page, -120);
  await settled(page, 'home');
  await wheel(page, -120);
  await settled(page, 'home');
  expect(errors).toEqual([]);
});

test('exposed labels expand each page, keep all navigation available, and keyboard focus follows', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Explore work' }).click();
  await settled(page, 'work-stack');
  await page.getByRole('button', { name: 'Meet the person' }).click();
  await settled(page, 'about-stack');
  await page.getByRole('button', { name: 'Next, say hello' }).click();
  await settled(page, 'contact-stack');
  await page.getByRole('button', { name: 'Open Work full screen', exact: true }).click();
  await settled(page, 'work-full');
  expect((await page.locator('.focus-layer').boundingBox()).width).toBe(1440);
  await shot(page, 'desktop-work-full');
  await page.getByRole('button', { name: 'Home', exact: true }).click();
  await settled(page, 'home-full');
  await shot(page, 'desktop-home-full');
  await page.getByRole('button', { name: 'Contact', exact: true }).focus();
  await page.keyboard.press('Enter');
  await settled(page, 'contact-full');
  await expect(page.locator('.focus-layer h1')).toBeFocused();
  await shot(page, 'desktop-contact-full');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await page.keyboard.press('ArrowUp');
  await settled(page, 'about-stack');
  await page.keyboard.press('ArrowUp');
  await settled(page, 'work-stack');
  await expect(page.locator('[data-sheet="1"] h1')).toBeFocused();
  await page.keyboard.press('Home');
  await settled(page, 'home-full');
  await page.keyboard.press('End');
  await settled(page, 'contact-full');
  // No fabricated email endpoint while contact data is unconfigured.
  await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
});

test('narrow screen: native work scrolling does not turn the page until its end', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await shot(page, 'mobile-home');
  await page.getByRole('button', { name: 'Explore work' }).click();
  await settled(page, 'work-stack');
  await shot(page, 'mobile-work-top');
  const surface = page.locator('[data-sheet="1"] .surface');
  await page.mouse.move(160, 450);
  await wheel(page, 380);
  await expect.poll(() => surface.evaluate((el) => el.scrollTop)).toBeGreaterThan(50);
  await settled(page, 'work-stack');
  await surface.evaluate((el) => { el.scrollTop = el.scrollHeight; });
  await shot(page, 'mobile-work-bottom');
  await wheel(page, 120);
  await settled(page, 'about-stack');
  await shot(page, 'mobile-about-stack');
  await page.getByRole('button', { name: 'Next, say hello' }).click();
  await settled(page, 'contact-stack');
  await shot(page, 'mobile-contact-stack');
  await page.getByRole('button', { name: 'Open Home full screen', exact: true }).click();
  await settled(page, 'home-full');
  await shot(page, 'mobile-home-full');
  await page.getByRole('button', { name: 'Contact', exact: true }).click();
  await settled(page, 'contact-full');
  await shot(page, 'mobile-contact-full');
  const overflow = await page.locator('.focus-layer .surface').evaluate((el) => el.scrollWidth > el.clientWidth);
  expect(overflow).toBe(false);
});

test('touch swipes advance and retreat; reduced motion switches without animation', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4198');
  const cdp = await context.newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 200, y: 650 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 200, y: 470 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await settled(page, 'work-stack');
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 200, y: 330 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 200, y: 540 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await settled(page, 'home');
  await context.close();
});

test('resize during navigation keeps a usable viewport and active controls', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Explore work' }).click();
  await page.setViewportSize({ width: 820, height: 720 });
  await settled(page, 'work-stack');
  await page.getByRole('button', { name: 'Expand Work to full screen', exact: true }).click();
  await settled(page, 'work-full');
  await shot(page, 'tablet-work-full');
  await page.setViewportSize({ width: 360, height: 640 });
  await page.getByRole('button', { name: 'Contact', exact: true }).click();
  await settled(page, 'contact-full');
  await shot(page, 'small-contact-full');
  await expect(page.getByRole('button', { name: 'Back to the beginning' })).toBeInViewport();
});
