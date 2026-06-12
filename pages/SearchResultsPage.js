class SearchResultsPage {
  constructor(page) {
    this.page = page;
  }

  async isCloudflareBlocked() {
    const title = await this.page.title().catch(() => '');
    const url = this.page.url();

    const bodyText = await this.page
      .locator('body')
      .innerText({ timeout: 5000 })
      .catch(() => '');

    return (
      title.toLowerCase().includes('cloudflare') ||
      title.toLowerCase().includes('just a moment') ||
      url.toLowerCase().includes('cloudflare') ||
      bodyText.toLowerCase().includes('cloudflare') ||
      bodyText.toLowerCase().includes('checking your browser')
    );
  }

  async getRecipeLinks(limit = 10) {
    await this.page.waitForLoadState('domcontentloaded');

    if (await this.isCloudflareBlocked()) {
      console.log('Cloudflare block detected. Skipping recipe extraction.');

      await this.page.screenshot({
        path: 'cloudflare-blocked.png',
        fullPage: true,
      });

      return [];
    }

    const links = await this.page.locator('a[href]').evaluateAll((anchors) => {
      const unique = new Map();

      anchors.forEach((a) => {
        const href = a.href;
        const text = (a.innerText || a.textContent || '').trim();

        if (
          href &&
          text &&
          href.includes('tarladalal.com') &&
          !href.includes('cloudflare.com') &&
          !/login|register|privacy|contact|javascript|member/i.test(href) &&
          !/login|register|privacy|contact|cloudflare/i.test(text)
        ) {
          unique.set(href, {
            name: text,
            url: href,
          });
        }
      });

      return Array.from(unique.values());
    });

    const validRecipeLinks = links.filter((link) => {
      return (
        link.url.includes('tarladalal.com') &&
        !link.url.includes('cloudflare.com') &&
        !/cloudflare/i.test(link.name)
      );
    });

    console.log('Filtered valid recipe links:', validRecipeLinks);

    return validRecipeLinks.slice(0, limit);
  }
}

module.exports = { SearchResultsPage };