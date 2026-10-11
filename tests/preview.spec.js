import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

async function openWork(page, expanded = false) {
  await page.goto('/');
  await page.getByRole('button', { name:'Explore work' }).click();
  await expect(page.locator('#portfolio')).toHaveAttribute('data-busy','false');
  if (expanded) {
    await page.getByRole('button', { name:'Expand Work to full screen' }).click();
    await expect(page.locator('#portfolio')).toHaveAttribute('data-busy','false');
  }
}

test('all work cards open real images; modal navigation never flips the underlying page', async ({ page }) => {
  const errors=[];
  page.on('pageerror', e => errors.push(e.message));
  await openWork(page,true);
  const dialog=page.getByRole('dialog');
  for (const name of ['FORM','SIGNAL','PLAYGROUND']) {
    const card=page.getByRole('button',{name:`Preview ${name}`,exact:true});
    await card.focus();
    await page.keyboard.press('Enter');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading')).toHaveText(name);
    await expect.poll(() => dialog.locator('img').evaluate(img => img.complete && img.naturalWidth>0)).toBe(true);
    await expect(dialog.getByRole('button',{name:'Close preview'})).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(card).toBeFocused();
  }
  await page.getByRole('button',{name:'Preview FORM',exact:true}).click();
  await page.keyboard.press('ArrowRight');
  await expect(dialog.getByRole('heading')).toHaveText('SIGNAL');
  await dialog.getByRole('button',{name:'Next work'}).click();
  await expect(dialog.getByRole('heading')).toHaveText('PLAYGROUND');
  await page.keyboard.press('ArrowRight');
  await expect(dialog.getByRole('heading')).toHaveText('FORM');
  await page.keyboard.press('ArrowLeft');
  await expect(dialog.getByRole('heading')).toHaveText('PLAYGROUND');
  await page.keyboard.press('End');
  await page.mouse.move(700,400);
  await page.mouse.wheel(0,500);
  await expect(page.locator('#portfolio')).toHaveAttribute('data-state','work-full');
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => document.activeElement.closest('dialog') !== null)).toBe(true);
  await mkdir('qa',{recursive:true});
  await page.screenshot({path:'qa/desktop-project-preview.png'});
  await page.mouse.click(8,450);
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('button',{name:'Preview FORM',exact:true})).toBeFocused();
  await page.getByRole('button',{name:'Contact',exact:true}).click();
  await expect(page.locator('#portfolio')).toHaveAttribute('data-state','contact-full');
  expect(errors).toEqual([]);
});

test('mobile preview fits the viewport and returns to the same work scroll position', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await openWork(page);
  const card=page.getByRole('button',{name:'Preview SIGNAL',exact:true});
  await card.scrollIntoViewIfNeeded();
  const surface=page.locator('[data-sheet="1"] .surface');
  const scrollBefore=await surface.evaluate(el=>el.scrollTop);
  await card.click();
  const dialog=page.getByRole('dialog');
  await expect(dialog.getByRole('heading')).toHaveText('SIGNAL');
  await expect.poll(() => dialog.locator('img').evaluate(img => img.complete && img.naturalWidth>0)).toBe(true);
  await expect(dialog.getByRole('button',{name:'Close preview'})).toBeInViewport();
  await expect(dialog.getByRole('button',{name:'Next work'})).toBeInViewport();
  expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  await mkdir('qa',{recursive:true});
  await page.screenshot({path:'qa/mobile-project-preview.png'});
  await dialog.getByRole('button',{name:'Close preview'}).click();
  await expect(dialog).not.toBeVisible();
  await expect(card).toBeFocused();
  expect(await surface.evaluate(el=>el.scrollTop)).toBe(scrollBefore);
  await expect(page.locator('#portfolio')).toHaveAttribute('data-state','work-stack');
});
