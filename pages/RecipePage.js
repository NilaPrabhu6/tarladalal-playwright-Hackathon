const { cleanText, matchAfter, extractRecipeId } = require('../utils/textUtils');

class RecipePage {
  constructor(page) {
    this.page = page;
  }

  async open(url) {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async textFromSelectors(selectors) {
    for (const selector of selectors) {
      const locator = this.page.locator(selector).first();
      if (await locator.count()) {
        const text = cleanText(await locator.innerText().catch(() => ''));
        if (text) return text;
      }
    }
    return '';
  }

  async extractRecipeDetails(searchedIngredient) {
    const url = this.page.url();
    const bodyText = cleanText(await this.page.locator('body').innerText());

    const recipeName = await this.textFromSelectors(['h1', '.recipename', '#recipehead', '[itemprop="name"]']);
    const ingredients = await this.textFromSelectors(['#rcpinglist', '.ingredients', '[itemprop="recipeIngredient"]', 'section:has-text("Ingredients")']);
    const preparationMethod = await this.textFromSelectors(['#recipe_small_steps', '.recipeMethod', '[itemprop="recipeInstructions"]', 'section:has-text("Method")']);
    const nutrientValues = await this.textFromSelectors(['#rcpnutrients', '.nutrient', 'table:has-text("Energy")', 'section:has-text("Nutrient")']);
    const description = await this.textFromSelectors(['[itemprop="description"]', '.recipe_description', 'meta[name="description"]']);

    return {
      recipeId: extractRecipeId(url),
      recipeName,
      recipeCategory: matchAfter('Recipe Category', bodyText),
      foodCategory: matchAfter('Food Category', bodyText),
      ingredients,
      preparationTime: matchAfter('Preparation Time|Prep Time', bodyText),
      cookingTime: matchAfter('Cooking Time|Cook Time', bodyText),
      tag: matchAfter('Tags?', bodyText),
      noOfServings: matchAfter('Makes|Serves|No of servings|Servings', bodyText),
      cuisineCategory: matchAfter('Cuisine', bodyText),
      recipeDescription: description || bodyText.slice(0, 500),
      preparationMethod,
      nutrientValues,
      recipeUrl: url,
      searchedIngredient
    };
  }
}

module.exports = { RecipePage };
