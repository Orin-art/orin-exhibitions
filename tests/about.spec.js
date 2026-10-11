import {test, expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';

async function about(page) {
  await page.goto('/');
  await page.getByRole('button',{name:'Explore work'}).click();
  await expect(page.locator('#portfolio')).toHaveAttribute('data-busy','false');
  await page.getByRole('button',{name:'Meet the person'}).click();
  await expect(page.locator('#portfolio')).toHaveAttribute('data-state','about-stack');
  await expect(page.locator('#portfolio')).toHaveAttribute('data-busy','false');
}

test('About sits after Work, has movable stickers, and expands from its exposed label',async({page})=>{
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await about(page);
  await expect(page.getByRole('heading',{level:1})).toHaveText('The mindbehind orin.');
  const sticker=page.getByRole('button',{name:'Play sticker. Drag or use arrow keys to move.'});
  const before=await sticker.boundingBox();
  await page.mouse.move(before.x+before.width/2,before.y+before.height/2);
  await page.mouse.down();
  await page.mouse.move(before.x+before.width/2-42,before.y+before.height/2+30,{steps:8});
  await page.mouse.up();
  const after=await sticker.boundingBox();
  expect(after.x).toBeLessThan(before.x-20);
  await sticker.focus();
  await page.keyboard.press('ArrowDown');
  expect((await sticker.boundingBox()).y).toBeGreaterThan(after.y);
  await expect(page.locator('#portfolio')).toHaveAttribute('data-state','about-stack');
  await page.getByRole('button',{name:'Next, say hello'}).click();
  await expect(page.locator('#portfolio')).toHaveAttribute('data-busy','false');
  await page.getByRole('button',{name:'Open About full screen',exact:true}).click();
  await expect(page.locator('#portfolio')).toHaveAttribute('data-state','about-full');
  await expect(page.locator('#portfolio')).toHaveAttribute('data-busy','false');
  await expect(page.getByRole('navigation',{name:'Pages'}).getByRole('button')).toHaveCount(4);
  await mkdir('qa',{recursive:true});
  await page.screenshot({path:'qa/desktop-about-full.png',animations:'disabled'});
  expect(errors).toEqual([]);
});

test('About remains scrollable on mobile and four page labels fit the header',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await about(page);
  await page.getByRole('button',{name:'Expand About to full screen'}).click();
  await expect(page.locator('#portfolio')).toHaveAttribute('data-busy','false');
  const surface=page.locator('.focus-layer .surface');
  await page.screenshot({path:'qa/mobile-about-full.png',animations:'disabled'});
  await page.getByRole('heading',{name:'CURRENTLY'}).scrollIntoViewIfNeeded();
  await page.screenshot({path:'qa/mobile-about-currently.png',animations:'disabled'});
  expect(await surface.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  await page.getByRole('button',{name:'Next, say hello'}).click();
  await expect(page.locator('#portfolio')).toHaveAttribute('data-state','contact-stack');
  await expect(page.locator('#portfolio')).toHaveAttribute('data-busy','false');
  await page.getByRole('button',{name:'Open About full screen',exact:true}).click();
  await expect(page.locator('#portfolio')).toHaveAttribute('data-busy','false');
  await page.setViewportSize({width:360,height:640});
  const brand=await page.locator('.focus-layer .wordmark').boundingBox();
  const nav=await page.getByRole('navigation',{name:'Pages'}).boundingBox();
  expect(nav.x+nav.width).toBeLessThanOrEqual(brand.x);
  expect(nav.x+nav.width).toBeLessThanOrEqual(360);
});
