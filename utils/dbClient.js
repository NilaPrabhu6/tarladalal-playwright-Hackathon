const { Pool } = require('pg');
const config = require('../config/testConfig');

const pool = new Pool(config.db);

async function createRecipeTable(tablename) {
  await pool.query(`CREATE TABLE IF NOT EXISTS ${tablename} (
      recipe_id TEXT,
      recipe_name TEXT,
      recipe_url TEXT, 
      preparation_time TEXT,
      cooking_time TEXT,
      no_of_servings TEXT
  );
  `);
}


async function insertRecipe(recipe, tablename) {
  console.log(recipe.recipeId + recipe.recipeName);
  const query = `
    INSERT INTO ${tablename} (
      recipe_id,
      recipe_name,
      recipe_url,
      preparation_time,
      cooking_time,
      no_of_servings
    )
    VALUES ( $1, $2, $3,$4, $5, $6)
  `;

  await pool.query(query, [
    recipe.recipeId,
    recipe.recipeName,
    recipe.recipeUrl,
    recipe.preparation_time,
    recipe.cooking_time,
    recipe.no_of_servings
  ]);
}

async function closeDb() {
  await pool.end();
}

module.exports = {createRecipeTable, insertRecipe, closeDb, pool };
