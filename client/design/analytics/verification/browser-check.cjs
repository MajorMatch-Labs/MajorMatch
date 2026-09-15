// User authorized local Edge headless on 2026-09-15. No external app requests.
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const dest=path.resolve(__dirname,'../screenshots');fs.mkdirSync(dest,{recursive:true});
const assert=(v,m)=>{if(!v)throw Error(m);};
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const checks=[],errors=[],requests=[];
 const context=await browser.newContext({viewport:{width:1280,height:1000},reducedMotion:'reduce'}),page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push({method:r.method(),url:r.url()}));
 const url='http://127.0.0.1:4173/design/analytics/prototype/';
 const shot=async name=>{await page.screenshot({path:path.join(dest,name+'.png'),fullPage:true});};
 const scenario=async value=>{await page.locator('#inspector').evaluate(e=>e.open=true);await page.selectOption('#scenario',value);await page.click('#apply');};
 for(const width of [375,768,1280,1487]){
  await page.setViewportSize({width,height:width===1487?1058:1000});await page.goto(url);await page.locator('canvas').waitFor();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'overflow '+width);
  await shot('success-'+width);checks.push('success reflow '+width);
 }
 await page.setViewportSize({width:1280,height:1000});await page.goto(url);
 await page.locator('#major-ai').focus();await page.keyboard.press('ArrowDown');assert(await page.locator('#major-title').innerText()==='Fullstack Web Engineer','arrow selection');assert(await page.locator('#major-web').evaluate(e=>document.activeElement===e),'selection focus');
 await page.locator('.axis-disclosure summary').click();await page.locator('[data-axis="0"]').click();assert(await page.locator('dialog').isVisible(),'dialog open');await page.keyboard.press('Escape');assert(await page.locator('[data-axis="0"]').evaluate(e=>document.activeElement===e),'dialog restore');checks.push('keyboard major selection, axis Escape and return focus');
 await page.locator('.numbers summary').click();assert(await page.locator('tbody tr').count()===6,'six rows');await shot('table-1280');
 await page.locator('#handoff').click();assert(await page.locator('#major-ai').isDisabled(),'lock selection');await page.locator('#cancel').click();await page.waitForTimeout(1400);assert(await page.locator('pre').count()===0,'cancel late response');checks.push('cancel ignores late completion');
 await page.locator('#handoff').click();await page.locator('pre').waitFor();assert((await page.locator('pre').innerText()).includes('"majorId": "web"'),'handoff correct major');await shot('handoff-1280');checks.push('selected-major handoff');
 await scenario('success');await page.locator('#handoff').click();await page.locator('#invalidate').click();await page.waitForTimeout(1400);assert(await page.locator('pre').count()===0,'stale late response');assert(await page.locator('#handoff').isDisabled(),'stale blocked');checks.push('stale snapshot rejects completion');
 for(const width of [375,1280]){await page.setViewportSize({width,height:1000});for(const value of ['partial','unavailable','missing-context','empty-skills','no-session','loading','empty','invalid','error','timeout','rate','stale','roadmap-error']){
  await scenario(value);await page.locator('#inspector').evaluate(e=>e.open=false);await page.evaluate(()=>scrollTo(0,0));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),value+' overflow '+width);
  await shot(value+'-'+width);
  if(['partial','unavailable','missing-context','stale'].includes(value))assert(await page.locator('#handoff').isDisabled(),'blocked '+value);
  if(value==='unavailable')assert(await page.locator('canvas').count()===0,'no wrong radar');
  if(value==='partial'){await page.locator('.numbers summary').click();assert((await page.locator('tbody').innerText()).includes('Chưa có dữ liệu'),'null not zero');}
 }checks.push('13 scenarios reflow '+width);}
 await page.setViewportSize({width:640,height:500});await page.goto(url);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'200% equivalent reflow');await shot('zoom-equivalent-640');
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.reload();assert(await page.locator('.numbers').evaluate(e=>e.open),'forced color table');await shot('forced-colors');checks.push('reduced motion, 200% equivalent CSS viewport and forced colors table');
 assert(errors.length===0,'console errors');assert(requests.every(r=>r.method==='GET'&&r.url.startsWith('http://127.0.0.1:4173/')),'external request');
 fs.writeFileSync(path.join(__dirname,'results.json'),JSON.stringify({date:new Date().toISOString(),sourceCommit:cp.execSync('git rev-parse HEAD').toString().trim(),browser:await browser.version(),checks,errors,requests:requests.length,limitations:['No live API','No screen-reader user test','640 CSS px is 200% reflow equivalent, not browser zoom setting','Full cross-module XUI journey not integrated']},null,2));
 console.log(JSON.stringify({checks,errors,screenshots:fs.readdirSync(dest).length}));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
