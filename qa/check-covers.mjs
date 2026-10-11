import {chromium} from 'playwright';
const browser=await chromium.launch({channel:'msedge'});
const page=await browser.newPage({viewport:{width:1440,height:900}});
await page.goto('http://127.0.0.1:4198/');await page.evaluate(()=>document.fonts.ready);
const hero=page.locator('.sheet-0 .feature img');await hero.evaluate(i=>i.decode());
await page.screenshot({path:'qa/covers-home-desktop.png'});
for(const id of ['planet','barriers','stories','second-life']){
 const card=page.locator(`.sheet-0 .activity-card[data-select="${id}"]`);await card.scrollIntoViewIfNeeded();await card.locator('img').evaluate(i=>i.decode());
 const box=await card.boundingBox();if(!box||box.width<1)throw Error('Missing '+id);
}
await page.locator('.sheet-0 .activity-collection').scrollIntoViewIfNeeded();await page.screenshot({path:'qa/covers-grid-desktop.png'});
await page.setViewportSize({width:390,height:844});await page.locator('.sheet-0 .surface').evaluate(e=>e.scrollTop=0);await page.screenshot({path:'qa/covers-home-mobile.png'});
await page.locator('.sheet-0 .activity-card[data-select="barriers"]').scrollIntoViewIfNeeded();await page.screenshot({path:'qa/covers-grid-mobile.png'});
console.log('All five previews decoded; desktop and mobile screenshots saved.');await browser.close();
