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
const {createRecipeTable, insertRecipe, filterresultrecipes, closeDb } = require('../utils/dbClient');

const { cleanUrl, closeGoogleAds } = require('../pages/Adcleanup');
const { default: playwrightConfig } = require('../playwright.config');
const config = require('../config/testConfig');
const {Scrapper}= require('../pages/Scrapper');


test.beforeEach(async () => {
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

test.afterEach(async (page) => {
  await browser.close();
  
});

test.afterAll(async()=> {
await closeDb();
});
  test('should bypass Cloudflare and confirm site is accessible', async () => {
    const blocked = await isCloudflareBlocked(page);
    const title = await page.title();
    console.log('Scraping test - Page title:', title);
    expect(blocked).toBe(false);
  });
test.describe("Recipe Scrapping for LCH", () =>{
   test.describe.configure({
   mode: 'serial'
 });
    test('1. Extract recipe links for LCH diet with added ingredient:', async ({page}) => {
      const scrapper = new Scrapper(page);
      const ingredients = readIngredients(config.excelPath, 'LCH_ADD');
       await createRecipeTable("LCH_ADD");
       await page.goto('https://www.tarladalal.com/indian-recipe-using-list/', { waitUntil: 'domcontentloaded' });
       await closeGoogleAds(page);

    //   expect(page.url()).toBe('https://www.tarladalal.com/indian-recipe-using-list/');

console.log('Page loaded successfully. Extracting recipe links...');

//Filtering the recipes using test data input
  const recipeLinks = await page.locator('a:has-text("Recipes Using")')
    .evaluateAll(anchors =>
      anchors.map(a => ({
        text: a.innerText.trim(),
        url: a.href
      }))
    );
    console.log("Total recipes found: " + recipeLinks.length);
  
    const addlinks = [];
    for (const ingredient of ingredients) {
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
//extracting the links of recipes with added ingredients
        for (const recipe of addlinks) {
          const url = cleanUrl(recipe.recipeUrl);
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
          recipeUrl
        };
      }),
      recipe.recipeName
    );

    //scraping recipe details 
    const carddata = [];
    for (const card of recipeCards) {
    const recipeCards_Scrapped = await scrapper.scrapeRecipes(page, card.recipeUrl);
      console.log(`Scrapping Data of ${card.recipeName}`);
     // console.log(recipeCards_Scrapped);
    await insertRecipe(recipeCards_Scrapped, "LCH_ADD"); //Adding to DB
    }
}
});

test('2. Extract recipe links for LCH diet with eliminated ingredient:', async ({page}) => {
      const scrapper = new Scrapper(page);
      const ingredients = readIngredients(config.excelPath, 'LCH_ELIMINATE');
       await createRecipeTable("LCH_ELIMINATE");
       await page.goto('https://www.tarladalal.com/indian-recipe-using-list/', { waitUntil: 'domcontentloaded' });
      expect(page.url()).toBe('https://www.tarladalal.com/indian-recipe-using-list/');

       console.log('Page loaded successfully. Extracting recipe links...');

//Filtering the recipes using test data input
  const recipeLinks = await page.locator('a:has-text("Recipes Using")')
    .evaluateAll(anchors =>
      anchors.map(a => ({
        text: a.innerText.trim(),
        url: a.href
      }))
    );
    console.log("Total recipes found: " + recipeLinks.length);
  
    const addlinks = [];
    for (const ingredient of ingredients) {
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
//extracting the links of recipes with added ingredients
        for (const recipe of addlinks) {
          const url = cleanUrl(recipe.recipeUrl);
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
          recipeUrl
        };
      }),
      recipe.recipeName
    );

    //scraping recipe details 
    const carddata = [];
    for (const card of recipeCards) {
    const recipeCards_Scrapped = await scrapper.scrapeRecipes(page, card.recipeUrl);
      console.log(`Scrapping Data of ${card.recipeName}`);
    //  console.log(recipeCards_Scrapped);
    await insertRecipe(recipeCards_Scrapped, "LCH_ELIMINATE"); //Adding to DB
    }
}
});

test('3. Result table which has approved recipes for LCH:', async ({page}) => {
await createRecipeTable("Result_Recipes_LCH");
const result = await filterresultrecipes ("Result_Recipes_LCH", "LCH_ADD", "LCH_ELIMINATE");
console.log ("Result Recipes for LCH");
console.log (result.recipe_url);

});
});

test.describe("Recipe Scrapping for LFV", () =>{
   test.describe.configure({
   mode: 'serial'
 });
test('1. Extract recipe links for LFV diet with Added ingredient:', async ({page}) => {
      const scrapper = new Scrapper(page);
      const ingredients = readIngredients(config.excelPath, 'LFV_ADD');
       await createRecipeTable("LFV_ADD");
       await page.goto('https://www.tarladalal.com/indian-recipe-using-list/', { waitUntil: 'domcontentloaded' });
       //expect(page.url()).toBe('https://www.tarladalal.com/indian-recipe-using-list/');

console.log('Page loaded successfully. Extracting recipe links...');

//Filtering the recipes using test data input
  const recipeLinks = await page.locator('a:has-text("Recipes Using")')
    .evaluateAll(anchors =>
      anchors.map(a => ({
        text: a.innerText.trim(),
        url: a.href
      }))
    );
    console.log("Total recipes found: " + recipeLinks.length);
  
    const addlinks = [];
    for (const ingredient of ingredients) {
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
//extracting the links of recipes with added ingredients
        for (const recipe of addlinks) {
          const url = cleanUrl(recipe.recipeUrl);
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
          recipeUrl
        };
      }),
      recipe.recipeName
    );

    //scraping recipe details 
    const carddata = [];
    for (const card of recipeCards) {
    const recipeCards_Scrapped = await scrapper.scrapeRecipes(page, card.recipeUrl);
      console.log(`Scrapped Data of ${card.recipeName}`);
     // console.log(recipeCards_Scrapped);
    await insertRecipe(recipeCards_Scrapped, "LFV_ADD"); //Adding to DB
    }
}
});

test('2. Extract recipe links for LFV diet with Eliminated ingredient:', async ({page}) => {
      const scrapper = new Scrapper(page);
      const ingredients = readIngredients(config.excelPath, 'LFV_ELIMINATE');
       await createRecipeTable("LFV_ELIMINATE");
       await page.goto('https://www.tarladalal.com/indian-recipe-using-list/', { waitUntil: 'domcontentloaded' });
       //expect(page.url()).toBe('https://www.tarladalal.com/indian-recipe-using-list/');

console.log('Page loaded successfully. Extracting recipe links...');

//Filtering the recipes using test data input
  const recipeLinks = await page.locator('a:has-text("Recipes Using")')
    .evaluateAll(anchors =>
      anchors.map(a => ({
        text: a.innerText.trim(),
        url: a.href
      }))
    );
    console.log("Total recipes found: " + recipeLinks.length);
  
    const addlinks = [];
    for (const ingredient of ingredients) {
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
//extracting the links of recipes with added ingredients
        for (const recipe of addlinks) {
          const url = cleanUrl(recipe.recipeUrl);
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
          recipeUrl
        };
      }),
      recipe.recipeName
    );

    //scraping recipe details 
    const carddata = [];
    for (const card of recipeCards) {
    const recipeCards_Scrapped = await scrapper.scrapeRecipes(page, card.recipeUrl);
      console.log(`Scrapped Data of ${card.recipeName}`);
     // console.log(recipeCards_Scrapped);
    await insertRecipe(recipeCards_Scrapped, "LFV_ELIMINATE"); //Adding to DB
    }
}
});

test('3. Result table which has approved recipes for LFV:', async ({page}) => {
await createRecipeTable("Result_Recipes_LFV");
const result = await filterresultrecipes ("Result_Recipes_LFV", "LFV_ADD", "LFV_ELIMINATE");
console.log ("Result Recipes for LFV");
console.log (result);

});
});