const { test, expect } = require('@playwright/test');
const config = require('../config/testConfig');
const { readIngredients } = require('../utils/excelReader');
const { insertRecipe, closeDb } = require('../utils/dbClient');
const { HomePage } = require('../pages/HomePage');
const { SearchResultsPage } = require('../pages/SearchResultsPage');
//const { RecipePage } = require('../pages/RecipePage');

const ingredients = readIngredients(config.excelPath);

test.describe('Tarla Dalal recipe search - Add to DB', () => {

  

  test.afterAll(async () => {
    await closeDb();
  });

  for (const ingredient of ingredients) {
    test(`Search recipes using ingredient: ${ingredient}`, async ({ page }) => {
      const homePage = new HomePage(page);
      const resultsPage = new SearchResultsPage(page);
    //  const recipePage = new RecipePage(page);

      await homePage.searchRecipeByIngredient(ingredient);
      const recipeLinks = await resultsPage.getRecipeLinks(config.maxRecipesPerIngredient);
      console.log ("ingredient: " + ingredient );
      if (recipeLinks.length === 0) {
  console.log(`No recipe links found for ingredient: ${ingredient}. Skipping DB insert.`);
  return;
}
   
    });
  }
});
