const { test, expect, chromium } = require('@playwright/test');
const {
  REALISTIC_HEADERS,
  getRandomUserAgent,
  randomDelay,
  applyStealthScripts,
  waitForCloudflareChallenge,
  isCloudflareBlocked,
} = require('../utils/browserHelper');

const TARGET_URL = ' https://www.tarladalal.com/indian-recipe-using-list/';

test.describe('Strategy 1 — Headful Browser with Stealth Overrides', () => {
  test('should load homepage without Cloudflare block', async () => {
    const browser = await chromium.launch({
      headless: false,
      channel: 'chrome', // Use real Chrome
      slowMo: 50,        // Slight slowdown helps avoid detection
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-features=IsolateOrigins,site-per-process',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--window-size=1920,1080',
        '--start-maximized',
        '--no-first-run',
        '--no-default-browser-check',
        '--lang=en-US',
      ],
      ignoreDefaultArgs: ['--enable-automation'], // 👈 Removes "Chrome is being controlled" banner
    });

    const context = await browser.newContext({
      userAgent: getRandomUserAgent(),
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US',
      timezoneId: 'America/New_York',
      extraHTTPHeaders: REALISTIC_HEADERS,
      javaScriptEnabled: true,
      bypassCSP: true,
      ignoreHTTPSErrors: true,
    });

    const page = await context.newPage();
    await applyStealthScripts(page);

    console.log('🌐 Navigating to:', TARGET_URL);

    // Navigate with relaxed wait condition
    const response = await page.goto(TARGET_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 90000, // Extended timeout for CF challenge
    });

    console.log('📡 Initial response status:', response?.status());
    console.log('📄 Initial page title:', await page.title());

    // Wait for Cloudflare challenge (if any)
    console.log('⏳ Waiting for Cloudflare challenge to resolve...');
    const challengeResolved = await waitForCloudflareChallenge(page, 45000);
    console.log('✅ Challenge resolved:', challengeResolved);

    // Give the page extra time to settle
    await randomDelay(3000, 5000);

    // Take screenshot for debugging
    await page.screenshot({ path: 'strategy1-result.png', fullPage: false });

    const blocked = await isCloudflareBlocked(page);
    const finalTitle = await page.title();
    const finalURL = page.url();

    console.log('========================================');
    console.log('🔒 CF Blocked:', blocked);
    console.log('📄 Final Title:', finalTitle);
    console.log('🌐 Final URL:', finalURL);
    console.log('========================================');

    // Assertions
    expect(blocked).toBe(false);
    await expect(page).not.toHaveTitle(/Just a moment/i);
    await expect(page).not.toHaveTitle(/Access denied/i);

    // Verify actual content loaded
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(200);

    await browser.close();
  });
});
