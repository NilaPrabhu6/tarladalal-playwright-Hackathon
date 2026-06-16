/**
 * Shared browser launch helpers for Cloudflare bypass strategies
 */

const REALISTIC_USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.6312.122 Safari/537.36',
];

const REALISTIC_HEADERS = {
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Cache-Control': 'max-age=0',
};

/**
 * Returns a random user agent from the list
 */
function getRandomUserAgent() {
  return REALISTIC_USER_AGENTS[Math.floor(Math.random() * REALISTIC_USER_AGENTS.length)];
}

/**
 * Sleeps for a given number of milliseconds
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Random delay between min and max ms to simulate human behavior
 */
async function randomDelay(min = 1000, max = 3000) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  await sleep(delay);
}

/**
 * Applies stealth overrides directly via page.addInitScript to mask
 * common bot-detection signals without needing an extra plugin
 */
async function applyStealthScripts(page) {
  await page.addInitScript(() => {
    // 1. Override navigator.webdriver
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
    });

    // 2. Mock plugins to appear as a real browser
    Object.defineProperty(navigator, 'plugins', {
      get: () => [
        { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
        { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai', description: '' },
        { name: 'Native Client', filename: 'internal-nacl-plugin', description: '' },
      ],
    });

    // 3. Spoof language list
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en'],
    });

    // 4. Override permission query to avoid bot signals
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters) =>
      parameters.name === 'notifications'
        ? Promise.resolve({ state: Notification.permission })
        : originalQuery(parameters);

    // 5. Spoof chrome object present in real Chrome
    window.chrome = {
      runtime: {},
      loadTimes: function () {},
      csi: function () {},
      app: {},
    };

    // 6. Remove headless signals from user agent data
    if (navigator.userAgentData) {
      Object.defineProperty(navigator.userAgentData, 'brands', {
        get: () => [
          { brand: 'Chromium', version: '125' },
          { brand: 'Google Chrome', version: '125' },
          { brand: 'Not-A.Brand', version: '99' },
        ],
      });
    }
  });
}

/**
 * Waits for Cloudflare challenge to resolve (if present)
 * Cloudflare challenges typically take 5-10 seconds
 */
async function waitForCloudflareChallenge(page, timeout = 30000) {
  const cfSelectors = [
    '#challenge-running',
    '#challenge-stage',
    '.cf-browser-verification',
    '#cf-please-wait',
    'iframe[src*="challenges.cloudflare.com"]',
  ];

  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const challengeVisible = await page
      .locator(cfSelectors.join(', '))
      .first()
      .isVisible()
      .catch(() => false);

    if (!challengeVisible) {
      return true; // Challenge resolved or was never shown
    }

    await sleep(1500);
  }

  return false; // Challenge did not resolve within timeout
}

/**
 * Checks whether the current page is showing a Cloudflare block page
 */
async function isCloudflareBlocked(page) {
  const title = await page.title();
  const bodyText = await page.locator('body').innerText().catch(() => '');
  const url = page.url();

  const cfIndicators = [
    title.includes('Just a moment'),
    title.includes('Attention Required'),
    title.includes('Access denied'),
    bodyText.includes('Checking your browser'),
    bodyText.includes('Enable JavaScript and cookies'),
    bodyText.includes('cf-error'),
    url.includes('cloudflare.com'),
    bodyText.includes('DDoS protection by Cloudflare'),
    bodyText.includes('Ray ID'),
  ];

  return cfIndicators.some(Boolean);
}

module.exports = {
  REALISTIC_HEADERS,
  getRandomUserAgent,
  sleep,
  randomDelay,
  applyStealthScripts,
  waitForCloudflareChallenge,
  isCloudflareBlocked,
};
