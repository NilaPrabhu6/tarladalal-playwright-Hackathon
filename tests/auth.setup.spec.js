const { test } = require('@playwright/test');
const fs = require('fs');

test('save authenticated session', async ({ page }) => {
  if (!fs.existsSync('auth')) {
    fs.mkdirSync('auth');
  }

  await page.goto('https://www.tarladalal.com/indian-recipe-using-list/', {
    waitUntil: 'domcontentloaded',
  });

  console.log('Login manually in browser. Then click Resume in Playwright Inspector.');

  await page.pause();

  await page.context().storageState({
    path: 'auth/tarla-auth.json',
  });

  console.log('Auth session saved successfully.');
});