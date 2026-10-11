import { test, expect } from '@playwright/test';

test('full-screen wheel reveals all destination rails above the old page', async ({ page }) => {
  await page.goto('/');
  const root = page.locator('#portfolio');
  // Preserve a later stack underneath an earlier expanded page.
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('ArrowRight');
    await expect(root).toHaveAttribute('data-busy', 'false');
  }
  for (const [index, name] of ['Home', 'Work', 'About'].entries()) {
    await page.getByRole('button', { name: `Open ${name} full screen`, exact: true }).click();
    await expect(root).toHaveAttribute('data-busy', 'false');
    const positions = await page.evaluate(() => {
      const root = document.querySelector('#portfolio');
      const surface = root.querySelector('.focus-layer .surface');
      surface.scrollTop = surface.scrollHeight;
      root.dispatchEvent(new WheelEvent('wheel', { deltaY: 120, bubbles: true, cancelable: true }));
      document.getAnimations().forEach(a => { a.pause(); a.currentTime = 150; });
      return [...root.querySelectorAll(':scope > .rail')].map(rail => {
        const rect = rail.getBoundingClientRect();
        return { y: rect.y, aboveFullPage: Number(getComputedStyle(rail).zIndex) > Number(getComputedStyle(root.querySelector('.focus-layer')).zIndex) };
      });
    });
    expect(positions).toHaveLength(index + 1);
    for (const p of positions) { expect(p.y).toBeGreaterThan(0); expect(p.aboveFullPage).toBe(true); }
    await page.screenshot({ path: `qa/fullscreen-${name.toLowerCase()}-motion.png` });
    await page.evaluate(() => document.getAnimations().forEach(a => a.finish()));
    await expect(root).toHaveAttribute('data-busy', 'false');
    await expect(page.locator('#portfolio > .rail')).toHaveCount(0);
    // Return to the complete stack before selecting the next expanded page.
    for (let i = index + 1; i < 3; i++) {
      await page.keyboard.press('ArrowRight');
      await expect(root).toHaveAttribute('data-busy', 'false');
    }
  }
});
