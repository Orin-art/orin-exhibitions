import { chromium } from 'playwright';
import { readFile, writeFile, stat } from 'node:fs/promises';
const browser=await chromium.launch({channel:'msedge'});
const page=await browser.newPage();
for(const id of ['planet','barriers','stories','second-life']){
 const png=await readFile(`public/assets/exhibitions/${id}.png`);
 for(const width of [1536,768]){
  const data=await page.evaluate(async({base64,width})=>{
   const image=new Image();image.src='data:image/png;base64,'+base64;await image.decode();
   const canvas=document.createElement('canvas');canvas.width=width;canvas.height=Math.round(width*image.height/image.width);
   canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
   return canvas.toDataURL('image/webp',.86).split(',')[1];
  },{base64:png.toString('base64'),width});
  const file=`public/assets/exhibitions/${id}${width===768?'-768':''}.webp`;
  await writeFile(file,Buffer.from(data,'base64'));console.log(file,(await stat(file)).size);
 }
}
await browser.close();
