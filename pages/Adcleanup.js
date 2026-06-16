function cleanUrl(url) {
  return url.split('#')[0];
}

async function closeGoogleAds(page) {
  // Remove google vignette hash
  await page.evaluate(() => {
    if (window.location.hash.includes('google_vignette')) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  });

  // Try common close buttons
  const closeButtons = [
    'button[aria-label="Close"]',
    'div[aria-label="Close"]',
    '[id="dismiss-button"]',
    '.close',
    '.btn-close'
  ];

  for (const selector of closeButtons) {
    const btn = page.locator(selector).first();
    if (await btn.count() > 0) {
      try {
        await btn.click({ timeout: 2000 });
      } catch {}
    }
  }

  // Hide ad iframes visually
  await page.evaluate(() => {
    document.querySelectorAll('iframe, ins.adsbygoogle').forEach(el => {
      el.style.display = 'none';
      el.style.visibility = 'hidden';
    });
  });
}
module.exports = { cleanUrl, closeGoogleAds };