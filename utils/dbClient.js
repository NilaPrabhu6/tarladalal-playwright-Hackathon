const { Pool } = require('pg');
const config = require('../config/testConfig');

const pool = new Pool(config.db);

async function insertRecipe(recipe) {
  const query = `
    INSERT INTO recipe_results (
      recipe_id, recipe_name, recipe_category, food_category, ingredients,
      preparation_time, cooking_time, tag, no_of_servings, cuisine_category,
      recipe_description, preparation_method, nutrient_values, recipe_url,
      searched_ingredient
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15
    )
    ON CONFLICT (recipe_url) DO UPDATE SET
      recipe_name = EXCLUDED.recipe_name,
      ingredients = EXCLUDED.ingredients,
      preparation_time = EXCLUDED.preparation_time,
      cooking_time = EXCLUDED.cooking_time,
      nutrient_values = EXCLUDED.nutrient_values,
      searched_ingredient = EXCLUDED.searched_ingredient;
  `;

  const values = [
    recipe.recipeId,
    recipe.recipeName,
    recipe.recipeCategory,
    recipe.foodCategory,
    recipe.ingredients,
    recipe.preparationTime,
    recipe.cookingTime,
    recipe.tag,
    recipe.noOfServings,
    recipe.cuisineCategory,
    recipe.recipeDescription,
    recipe.preparationMethod,
    recipe.nutrientValues,
    recipe.recipeUrl,
    recipe.searchedIngredient
  ];

  await pool.query(query, values);
}

async function closeDb() {
  await pool.end();
}

module.exports = { insertRecipe, closeDb, pool };
