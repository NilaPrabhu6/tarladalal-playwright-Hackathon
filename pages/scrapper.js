class Scrapper {
  constructor(page) {
    this.page = page;
  }

async  getlinksforingredient( ingredient) {
   console.log(`Getting links for ingredient: ${ingredient}`);
          //wait this.page.goto('https://www.tarladalal.com/indian-recipe-using-list/', { waitUntil: 'domcontentloaded' });
const recipeLinks = await this.page.locator(':text("Recipes Using")')
    .evaluateAll(anchors =>
      anchors.map(a => ({
        text: a.innerText.trim(),
        url: a.href
      }))
    );  
      console.log("Total recipes found: " + recipeLinks.length);
    const addlinks = [];
  //for (const ingredient of ingredients) {
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
  
return addlinks;
}


async navigateToRecipe(recrecipeLinks) {
  for (const recipe of recipeLinks) {
          const url = cleanUrl(recipe.recipeUrl);
          console.log(`Navigating to recipe: ${recipe.recipeName} - URL: ${recipe.recipeUrl}`);

      await page.goto(url, {
       waitUntil: 'domcontentloaded', timeout: 30000
     });
   await closeGoogleAds(page);
   const recipeCards = await page
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


console.log('Total recipes found:', recipeCards.length);
console.log('Recipes:', recipeCards);
return recipeCards;
  }

}


async scrapeRecipes (page, recipeurl) {
 const cleanUrl = recipeurl.split('#')[0];

  try {
    await page.goto(cleanUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 120000
    });
  } catch (error) {
    console.log(`Skipping URL due to navigation error: ${cleanUrl}`);
    console.log(error.message);
    return null;
  }
  const recipeName = await page.locator('h1, h1.rec-heading, .rec-heading')
    .first()
    .innerText()
    .catch(() => '');
  const bodyText = await page.locator('body').innerText().catch(() => '');

  const pageText = bodyText;

  const recipeId =
    page.url().match(/-(\d+)r$/)?.[1] ||
    pageText.match(/Recipe#\s*(\d+)/i)?.[1] ||
    '';

  const preparationTime =
    pageText.match(/Preparation Time\s*:\s*([^\n]+)/i)?.[1]?.trim() || '';

  const cookingTime =
    pageText.match(/Cooking Time\s*:\s*([^\n]+)/i)?.[1]?.trim() || '';

  const makes =
    pageText.match(/Makes\s*:\s*([^\n]+)/i)?.[1]?.trim() ||
    pageText.match(/Serves\s*:\s*([^\n]+)/i)?.[1]?.trim() ||
    '';

  const ingredients = await getAllTextsIfAvailable(
    page.locator('#rcpinglist li, .ingredients li, [itemprop="recipeIngredient"]')
  );

  const method = await getAllTextsIfAvailable(
    page.locator('#recipe_small_steps li, .recipe-method li, [itemprop="recipeInstructions"]')
  );

  const rating =
    await getTextIfAvailable(page.locator('[itemprop="ratingValue"], .ratingValue')) ||
    pageText.match(/Rating\s*:\s*([0-9.]+)/i)?.[1] ||
    '';

  return {
    recipeName,
    recipeId,
    preparationTime,
    cookingTime,
    makes,
    ingredients,
    method,
    rating,
    recipeUrl: page.url().split('#')[0]
  };
}

  
}

module.exports = { Scrapper };