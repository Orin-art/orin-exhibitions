import { chromium } from 'playwright';
const browser=await chromium.launch({channel:'msedge'});
for(const expanded of [false,true]){
 const page=await browser.newPage();await page.goto('http://127.0.0.1:4198/');
 const settle=()=>page.waitForFunction(()=>document.querySelector('#portfolio').dataset.busy==='false');
 await page.getByRole('button',{name:'Explore the exhibition'}).click();await settle();
 if(expanded){await page.locator('.sheet-1 .page-label').click();await settle();}
 async function check(index,trigger){const motion=await page.evaluate(({index,trigger})=>{
 document.querySelector(trigger).click();document.getAnimations().forEach(a=>{a.pause();a.currentTime=150;});
 const sheet=document.querySelector(`.sheet-${index}`);const rail=document.querySelector(`#portfolio > .rail.sheet-${index-1}`)||document.querySelector(`.sheet-${index-1} .rail`);
 return {sheet:sheet.getBoundingClientRect().y,rail:rail.getBoundingClientRect().y};},{index,trigger});if(!(motion.sheet<0&&motion.rail>0))throw Error(JSON.stringify(motion));await page.evaluate(()=>document.getAnimations().forEach(a=>a.finish()));await settle();}
 await check(2, '.surface:not([inert]) [data-next]');
 if(expanded){await page.locator('.sheet-2 .page-label').click();await settle();}
 const active=page.locator('.surface:not([inert])');await active.getByLabel('Name or nickname').fill('Animation check');await active.getByLabel('Email address').fill('check@example.com');await active.getByRole('checkbox',{name:/visitor information/}).check();
 await check(3, '.surface:not([inert]) button[type="submit"]');
 console.log(expanded?'Expanded CTA pair passed':'Stack CTA pair passed');await page.close();
}
await browser.close();
