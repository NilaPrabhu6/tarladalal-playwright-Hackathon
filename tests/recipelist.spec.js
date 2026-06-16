const { test, expect, chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const {
  REALISTIC_HEADERS,
  getRandomUserAgent,
  randomDelay,
  applyStealthScripts,
  waitForCloudflareChallenge,
  isCloudflareBlocked,
} = require('../utils/browserHelper');

 let browser;  let context;  let page;

const { readIngredients } = require('../utils/excelReader');
const { insertRecipe, closeDb } = require('../utils/dbClient');
//const { HomePage } = require('../pages/HomePage');

const { cleanUrl, closeGoogleAds } = require('../pages/Adcleanup');
const { default: playwrightConfig } = require('../playwright.config');
const config = require('../config/testConfig');
const {Scrapper}= require('../pages/Scrapper');

const ingredients_LCHEliminate = readIngredients(config.excelPath, 'LCH ELIMINATE');
const ingredients_LCHAdd = readIngredients(config.excelPath, 'LCH ADD');
const ingredients_LFVAdd = readIngredients(config.excelPath, 'LFV ADD');
const ingredients_LFVEliminate = readIngredients(config.excelPath, 'LFV ELIMINATE');


test.beforeAll(async () => {
browser = await chromium.launch({
      headless: false,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--window-size=1280,800',
      ],
    });

    context = await browser.newContext({
      userAgent: getRandomUserAgent(),
      viewport: { width: 1280, height: 800 },
      locale: 'en-US',
      extraHTTPHeaders: REALISTIC_HEADERS,
    });

    page = await context.newPage();
    await applyStealthScripts(page);

    await page.goto('https://www.tarladalal.com/indian-recipe-using-list/', {
      waitUntil: 'networkidle',
      timeout: 60000,
    });

    await waitForCloudflareChallenge(page, 30000);
    await randomDelay(2000, 4000);
    
}); 

test.afterAll(async (page) => {
  await browser.close();
});

  test('should bypass Cloudflare and confirm site is accessible', async () => {
    const blocked = await isCloudflareBlocked(page);
    const title = await page.title();
    console.log('Scraping test - Page title:', title);
    expect(blocked).toBe(false);
  });

    test('Extract recipe links for LCH diet with added ingredient:', async ({page}) => {
      const scrapper = new Scrapper(page);
      const ingredients = readIngredients(config.excelPath, 'LCH ADD');
    await page.goto('https://www.tarladalal.com/indian-recipe-using-list/', { waitUntil: 'domcontentloaded' });
    expect(page.url()).toBe('https://www.tarladalal.com/indian-recipe-using-list/');

console.log('Page loaded successfully. Extracting recipe links...');
  const recipeLinks = await page.locator('a:has-text("Recipes Using")')
    .evaluateAll(anchors =>
      anchors.map(a => ({
        text: a.innerText.trim(),
        url: a.href
      }))
    );

      console.log("Total recipes found: " + recipeLinks.length);
     // console.log("Recipe Links:");
    //  recipeLinks.forEach(recipe => console.log(`- ${recipe.text}: ${recipe.url}`));
    const addlinks = [];
    for (const ingredient of ingredients_LCHAdd) {
         for (const recipe of recipeLinks) {
      if (recipe.text.toLowerCase().includes(ingredient.toLowerCase())) {
        console.log(`Ingredient: ${ingredient} - Recipe Link: ${recipe.text}`);

        addlinks.push({

          ingredient,
          recipeName: recipe.text,
          recipeUrl: recipe.url
        });


    }
    
}

}
  console.log('Recipe URLs found:');
  console.log(addlinks);

        for (const recipe of addlinks) {
          //const url = cleanUrl(recipe.recipeUrl);
          console.log(`Navigating to recipe: ${recipe.recipeName} - URL: ${recipe.recipeUrl}`);

      await page.goto(recipe.recipeUrl, {
       waitUntil: 'domcontentloaded', timeout: 30000
     });
  // await closeGoogleAds(page);
   var recipeCards = await page
    .locator("//div[@class='recipe-title']/a")
    .evaluateAll((anchors, mainRecipeName) =>
      anchors.map(a => {
        const panel = a.closest('div');
        const panelText = panel?.innerText || '';
        const recipeUrl = a.href;

        return {
          mainIngredient: mainRecipeName,
          recipeName: a.textContent.trim(),
          recipeId: recipeUrl.match(/-(\d+)r$/)?.[1] || '',
         //alories: panelText.match(/(\d+)\s*calories/i)?.[1] || '',
        //description: panelText,
          recipeUrl
        };
      }),
      recipe.recipeName
    );
    console.log('Recipes:', recipeCards);
    const carddata = [];
    for (const card of recipeCards) {
const recipeCards_part2 = scrapper.scrapeRecipes(page, card.recipeUrl);
console.log(`Scrapped Data of ${card.recipeName}`);
console.log(recipeCards_part2);

if(recipeCards_part2){
carddata.push(recipeCards_part2);
}
recipeCards.concat(carddata);
//console.log('Total recipes found:', recipeCards.length);
console.log('Recipes:', recipeCards);
    }
}
});


 /*
test('scrap recipes for LFV diet', async ({page}) => {

  for(const ingredient of ingredients_LCHEliminate) {
    test(`Extract recipe links for LCH diet with eliminated ingredient: ${ingredient}`, async ({page}) => {
    await page.goto('https://www.tarladalal.com/indian-recipe-using-list/', { waitUntil: 'domcontentloaded' });
   
    expect(page.url()).toBe('https://www.tarladalal.com/indian-recipe-using-list/');
      console.log("Total recipes found: " + recipeLinks.length);
      console.log("Recipe Links:");
  
      const recipelinks = scrapper.getlinksforingredient(ingredient);
      recipelinks.forEach(recipe => console.log(`- ${recipe.text}: ${recipe.url}`));
      const recipecards = await scrapper.navigateToRecipe(recipelinks);
console.log('Eliminated Recipes:', recipecards);});
  }
}
);*/

    test('Extract recipe links for LCH diet with Eliminated ingredient:', async ({page}) => {
      const scrapper = new Scrapper(page);
      const ingredients = readIngredients(config.excelPath, 'LCH ELIMINATE');
    await page.goto('https://www.tarladalal.com/indian-recipe-using-list/', { waitUntil: 'domcontentloaded' });
    expect(page.url()).toBe('https://www.tarladalal.com/indian-recipe-using-list/');

console.log('Page loaded successfully. Extracting recipe links...');
  const recipeLinks = await page.locator('a:has-text("Recipes Using")')
    .evaluateAll(anchors =>
      anchors.map(a => ({
        text: a.innerText.trim(),
        url: a.href
      }))
    );

      console.log("Total recipes found: " + recipeLinks.length);
     // console.log("Recipe Links:");
    //  recipeLinks.forEach(recipe => console.log(`- ${recipe.text}: ${recipe.url}`));
    const addlinks = [];
    for (const ingredient of ingredients_LCHAdd) {
         for (const recipe of recipeLinks) {
      if (recipe.text.toLowerCase().includes(ingredient.toLowerCase())) {
        console.log(`Ingredient: ${ingredient} - Recipe Link: ${recipe.text}`);

        addlinks.push({

          ingredient,
          recipeName: recipe.text,
          recipeUrl: recipe.url
        });


    }
    
}

}
  console.log('Recipe URLs found:');
  console.log(addlinks);

        for (const recipe of addlinks) {
          //const url = cleanUrl(recipe.recipeUrl);
          console.log(`Navigating to recipe: ${recipe.recipeName} - URL: ${recipe.recipeUrl}`);

      await page.goto(recipe.recipeUrl, {
       waitUntil: 'domcontentloaded', timeout: 30000
     });
  // await closeGoogleAds(page);
   var recipeCards = await page
    .locator("//div[@class='recipe-title']/a")
    .evaluateAll((anchors, mainRecipeName) =>
      anchors.map(a => {
        const panel = a.closest('div');
        const panelText = panel?.innerText || '';
        const recipeUrl = a.href;

        return {
          mainIngredient: mainRecipeName,
          recipeName: a.textContent.trim(),
          recipeId: recipeUrl.match(/-(\d+)r$/)?.[1] || '',
         //alories: panelText.match(/(\d+)\s*calories/i)?.[1] || '',
        //description: panelText,
          recipeUrl
        };
      }),
      recipe.recipeName
    );
    console.log('Recipes:', recipeCards);
    const carddata = [];
    for (const card of recipeCards) {
const recipeCards_part2 = scrapper.scrapeRecipes(page, card.recipeUrl);
console.log(`Scrapped Data of ${card.recipeName}`);
console.log(recipeCards_part2);

if(recipeCards_part2){
carddata.push(recipeCards_part2);
}
recipeCards.concat(carddata);
//console.log('Total recipes found:', recipeCards.length);
console.log('Recipes:', recipeCards);
    }
}
});