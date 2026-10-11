import { test, expect } from '@playwright/test';
const settled=async page=>expect(page.locator('#portfolio')).toHaveAttribute('data-busy','false');
async function register(page){
 await page.getByRole('button',{name:'Explore the exhibition'}).click();await settled(page);
 await page.getByRole('button',{name:'Book a free visit'}).click();await settled(page);
 await page.locator('.surface:not([inert])').getByLabel('Name or nickname').fill('Alex');await page.locator('.surface:not([inert])').getByLabel('Email address').fill('alex@example.com');
 await page.locator('.surface:not([inert])').getByLabel('Afternoon', {exact:false}).check();await expect(page.getByLabel('Number of visitors')).toHaveCount(0);
 await page.getByRole('checkbox',{name:/visitor information/}).check();
 await page.getByRole('button',{name:'Confirm free visit'}).click();await settled(page);await page.locator('.sheet-3 .page-label').click();await settled(page);
}
test('registration persists, calendar downloads and cancellation clears the pass',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await page.screenshot({path:'qa/events-desktop-discover.png'});
 await register(page);await expect(page.locator('.surface:not([inert])')).toContainText('Alex');await expect(page.locator('.surface:not([inert])')).toContainText('Afternoon');
 await page.screenshot({path:'qa/events-desktop-pass.png'});
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Add to calendar'}).click();expect((await download).suggestedFilename()).toBe('orin-exhibition.ics');
 await page.reload();await page.keyboard.press('End');await settled(page);await expect(page.locator('.surface:not([inert])')).toContainText('Alex');
 page.on('dialog',d=>d.accept());await page.getByRole('button',{name:'Cancel reservation'}).click();await expect(page.locator('.surface:not([inert])')).toContainText('Your next');expect(errors).toEqual([]);
});
test('empty states do not register by scrolling and full-screen rails animate',async({page})=>{
 await page.goto('/');await page.keyboard.press('End');await settled(page);await expect(page.locator('.surface:not([inert])')).toContainText('Scrolling does not book a ticket');
 await page.getByRole('button',{name:'Discover',exact:true}).click();await settled(page);
 const ys=await page.evaluate(()=>{const surface=document.querySelector('.surface:not([inert])');surface.scrollTop=surface.scrollHeight;document.querySelector('#portfolio').dispatchEvent(new WheelEvent('wheel',{deltaY:120,bubbles:true,cancelable:true}));document.getAnimations().forEach(a=>{a.pause();a.currentTime=150;});return [...document.querySelectorAll('#portfolio > .rail')].map(r=>r.getBoundingClientRect().y);});expect(ys).toHaveLength(1);expect(ys[0]).toBeGreaterThan(0);await page.evaluate(()=>document.getAnimations().forEach(a=>a.finish()));await settled(page);
 await expect(page.locator('.sheet-1')).toContainText('Choose an exhibition');expect(await page.evaluate(()=>localStorage.getItem('orin-exhibitions-v1'))).toBeNull();
});
test('mobile registration and all four expanded pages fit the viewport',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');await page.screenshot({path:'qa/events-mobile-discover.png'});await register(page);
 await page.screenshot({path:'qa/events-mobile-pass.png'});
 for(const name of ['Discover','Exhibition','Book a Visit','My Tickets']){await page.getByRole('button',{name,exact:true}).click();await settled(page);expect(await page.locator('.surface:not([inert])').evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);}
});


test('each card opens matching details with opposing vertical motion',async({page})=>{
 await page.goto('/');
 await page.locator('.activity-collection').scrollIntoViewIfNeeded();
 await page.screenshot({path:'qa/activity-collection.png'});
 for(const [id,title] of [['planet','One Planet, Shared Future'],['barriers','Beyond the Barriers'],['stories','Stories Next Door'],['second-life','A Second Life']]){
  const motion=await page.evaluate(id=>{
   document.querySelector(`[data-select="${id}"]`).click();
   document.getAnimations().forEach(a=>{a.pause();a.currentTime=150;});
   const rail=document.querySelector('#portfolio > .rail') || document.querySelector('.sheet-0 .rail');
   return {rail:rail.getBoundingClientRect().y,sheet:document.querySelector('.sheet-1').getBoundingClientRect().y};
  },id);
  expect(motion.rail).toBeGreaterThan(0);expect(motion.sheet).toBeLessThan(0);
  await page.evaluate(()=>document.getAnimations().forEach(a=>a.finish()));await settled(page);
  await expect(page.locator('.sheet-1 h1')).toContainText(title.split(' ')[0],{ignoreCase:true});
  await page.getByRole('button',{name:'Book a free visit'}).click();await settled(page);
  await expect(page.locator('.surface:not([inert]) .order-line')).toContainText(title);await page.locator('.sheet-2 .page-label').click();await settled(page);
  await page.getByRole('button',{name:'Discover',exact:true}).click();await settled(page);
 }
});

test('separate event passes retain the correct title and calendar date',async({page})=>{
 await page.goto('/');await register(page);
 await page.getByRole('button',{name:'Discover',exact:true}).click();await settled(page);
 await page.getByRole('button',{name:'View Beyond the Barriers exhibition',exact:true}).click();await settled(page);
 await page.getByRole('button',{name:'Book a free visit'}).click();await settled(page);
 const form=page.locator('.surface:not([inert])');await form.getByLabel('Name or nickname').fill('Sam');await form.getByLabel('Email address').fill('sam@example.com');await form.getByRole('checkbox',{name:/visitor information/}).check();await form.getByRole('button',{name:'Confirm free visit'}).click();await settled(page);await page.locator('.sheet-3 .page-label').click();await settled(page);
 await expect(page.locator('.surface:not([inert]) .entry-pass')).toContainText('Beyond the Barriers');await expect(page.locator('.surface:not([inert]) .entry-pass')).toContainText('October 25, 2026');
 await page.getByRole('button',{name:'One Planet, Shared Future',exact:true}).click();await expect(page.locator('.surface:not([inert]) .entry-pass')).toContainText('Alex');await expect(page.locator('.surface:not([inert]) .entry-pass')).toContainText('October 24, 2026');
 await page.reload();await page.keyboard.press('End');await settled(page);await expect(page.getByRole('button',{name:'Beyond the Barriers',exact:true})).toBeVisible();
 await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Discover',exact:true}).click();await settled(page);await page.locator('.surface:not([inert]) .activity-collection').scrollIntoViewIfNeeded();await page.screenshot({path:'qa/activities-mobile.png'});expect(await page.locator('.surface:not([inert])').evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
});

test('chosen visit date survives reload and is exported to the calendar',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Explore the exhibition'}).click();await settled(page);
 await page.screenshot({path:'qa/exhibition-details.png'});
 await page.getByRole('button',{name:'Book a free visit'}).click();await settled(page);
 const form=page.locator('.surface:not([inert])');await form.getByLabel('Visit date').selectOption('2026-11-01');await form.getByLabel('Name or nickname').fill('Riley');await form.getByLabel('Email address').fill('riley@example.com');await form.getByRole('checkbox',{name:/visitor information/}).check();
 await page.screenshot({path:'qa/exhibition-booking.png'});
 await form.getByRole('button',{name:'Confirm free visit'}).click();await settled(page);await page.locator('.sheet-3 .page-label').click();await settled(page);
 await expect(page.locator('.surface:not([inert]) .entry-pass')).toContainText('November 1, 2026');
 const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Add to calendar'}).click();const file=await (await pending).path();const {readFile}=await import('node:fs/promises');const calendar=await readFile(file,'utf8');expect(calendar).toContain('DTSTART:20261101T020000Z');expect(calendar).toContain('SUMMARY:One Planet, Shared Future');
 await page.reload();await page.keyboard.press('End');await settled(page);await expect(page.locator('.surface:not([inert]) .entry-pass')).toContainText('November 1, 2026');
});
