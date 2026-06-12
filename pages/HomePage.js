class HomePage {
  constructor(page) {
    this.page = page;
    this.searchInput = page.locator('input[type="search"], input[name*="search" i], input[id*="search" i], input[placeholder*="Search" i]').first();
    this.searchButton = page.getByRole('button', { name: /search/i }).first();
  }

  async goto() {
    await this.page.goto('https://m.tarladalal.com', { waitUntil: 'domcontentloaded' });
    //await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async searchRecipeByIngredient(ingredient) {
    await this.goto();

    if (!(await this.searchInput.count())) {
      await this.page.goto(`https://www.tarladalal.com/search.aspx?search=${encodeURIComponent(ingredient)}`, { waitUntil: 'domcontentloaded' });
      return;
    }

    await this.searchInput.fill(ingredient);

    if (await this.searchButton.count()) {
      await Promise.all([
        this.page.waitForLoadState('domcontentloaded').catch(() => {}),
        this.searchButton.click()
      ]);
    } else {
      await this.searchInput.press('Enter');
      await this.page.waitForLoadState('domcontentloaded').catch(() => {});
    }
  }
}

module.exports = { HomePage };
