require('dotenv').config();

module.exports = {
  baseUrl: process.env.BASE_URL || 'https://m.tarladalal.com',
  excelPath: process.env.EXCEL_PATH || '"C://tarladalal-playwright-hybrid-js/data/ingredientsToAdd.xlsx"',
  maxRecipesPerIngredient: Number(process.env.MAX_RECIPES_PER_INGREDIENT || 5),
  db: {
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT || 5432),
    database: process.env.PGDATABASE || 'recipes_db',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres'
  }
};
