const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;

test('client and experience paths are usable and the profile remains accessible',async({page,request})=>{
 await page.goto('/');
 await page.getByRole('link',{name:'Services',exact:true}).click();
 await expect(page).toHaveURL(/#services$/);
 await expect(page.getByRole('heading',{name:'Keep the work connected.',exact:true})).toBeVisible();
 await page.getByRole('link',{name:'Read my experience profile',exact:false}).click();
 await expect(page).toHaveURL(/profile\.html$/);
 await expect(page.getByRole('heading',{level:1,name:'Devin',exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'Print or save this profile',exact:true})).toBeVisible();
 expect((await request.get('/profile.js')).status()).toBe(200);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
 expect(await page.locator('a[href*="127.0.0.1"],a[href*="mini-job-board/pull"],a[href^="file:"]').count()).toBe(0);
 const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
 expect(result.violations).toEqual([]);
 await page.emulateMedia({media:'print'});
 await expect(page.getByRole('button',{name:'Print or save this profile'})).toBeHidden();
 await expect(page.locator('.site-header')).toBeHidden();
 await expect(page.getByRole('heading',{name:'Selected application work',exact:true})).toBeVisible();
});

test('experience profile has usable content without JavaScript',async({browser,baseURL})=>{
 const context=await browser.newContext({javaScriptEnabled:false});
 try{
  const page=await context.newPage();await page.goto(baseURL+'/profile.html');
  await expect(page.getByRole('heading',{level:1,name:'Devin',exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Print or save this profile'})).toBeHidden();
  await expect(page.getByRole('link',{name:'Back to the portfolio',exact:false})).toHaveAttribute('href','index.html');
 }finally{await context.close();}
});
