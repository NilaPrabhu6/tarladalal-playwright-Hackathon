# Tarla Dalal Playwright Hybrid Framework - JavaScript

## Features
- Playwright JavaScript framework
- Hybrid-driven model: data driven with Excel + reusable keyword/helper utilities
- Page Object Model design pattern
- PostgreSQL output persistence
- Mobile browser project using Pixel 5 profile
- HTML report, screenshots, videos, traces on failure

## Setup
```bash
npm install
npx playwright install
cp .env.example .env
npm run db:init
npm test
```

## PostgreSQL prerequisite
Create a PostgreSQL database named `recipes_db`, or update `.env` with your database details.

## Input test data
Excel path: `data/ingredients.xlsx`
Sheet: `Ingredients`
Column: `Ingredient`

## Output table
Table name: `recipe_results`

## Notes
The mobile URL can redirect to the desktop site depending on device/network behavior. The locators are intentionally resilient and use text, role, and URL patterns where possible.
