CREATE TABLE IF NOT EXISTS recipe_results (
  id SERIAL PRIMARY KEY,
  recipe_id VARCHAR(100),
  recipe_name TEXT,
  recipe_category TEXT,
  food_category TEXT,
  ingredients TEXT,
  preparation_time TEXT,
  cooking_time TEXT,
  tag TEXT,
  no_of_servings TEXT,
  cuisine_category TEXT,
  recipe_description TEXT,
  preparation_method TEXT,
  nutrient_values TEXT,
  recipe_url TEXT UNIQUE,
  searched_ingredient TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
