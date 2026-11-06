---
name: advanced-crawler-playwright
description: >-
  High-performance, resilient web scraping and browser automation guide synthesizing patterns
  from Crawl4AI (35k+ stars), Playwright (65k+ stars), and Scrapling. Use when writing, debugging,
  or scaling web crawlers, dynamic JavaScript scrapers, or browser-based data extraction pipelines.
---

# Advanced Web Crawler & Playwright Automation

Expert blueprint for building resilient, high-speed, anti-bot compliant web scrapers and Playwright automation agents.

## 1. Playwright Core Rules & Best Practices

### A. Selector & Locator Hierarchy (Avoid Flakiness)
1. **Prefer User-Facing Locators**:
   - `page.getByRole('button', { name: 'Submit' })`
   - `page.getByLabel('Username')`
   - `page.getByText('Rp 150.000')`
   - `page.getByTestId('product-card')`
2. **Avoid Fragile Selectors**:
   - ❌ `div.col-md-4 > div:nth-child(2) > span.price-val` (Breaks on minor DOM changes)
   - ❌ Absolute XPath: `/html/body/div[2]/section/div...`
   - ✔️ Scoped sub-locators: `page.locator('.product-card').filter({ hasText: 'Motor Oil' })`
3. **Never Use Arbitrary Sleep / Timeout**:
   - ❌ `page.waitForTimeout(5000)` or `time.sleep(5)`
   - ✔️ Auto-waiting on actions (`click()`, `fill()`, `check()`)
   - ✔️ Explicit event waits: `page.waitForURL(...)`, `page.waitForResponse(...)`, `locator.waitFor({ state: 'visible' })`

### B. Network Optimization & Resource Blocking
Speed up crawling speed by up to 500% and save bandwidth by intercepting and aborting unnecessary assets:
```javascript
// Node.js Playwright
await page.route('**/*', (route) => {
  const resourceType = route.request().resourceType();
  if (['image', 'media', 'font', 'stylesheet'].includes(resourceType)) {
    return route.abort();
  }
  route.continue();
});
```
```python
# Python Playwright
async def block_unneeded_resources(route):
    if route.request.resource_type in ["image", "media", "font"]:
        await route.abort()
    else:
        await route.continue_()

await page.route("**/*", block_unneeded_resources)
```

### C. Session & Cookie Persistence
Avoid logging in or solving CAPTCHAs repeatedly by saving and reusing `storageState`:
```javascript
// Save state after login
await context.storageState({ path: 'storage/auth_state.json' });

// Create new context with cached cookies/local storage
const context = await browser.newContext({ storageState: 'storage/auth_state.json' });
```

---

## 2. Anti-Bot Evasion & Stealth (Crawl4AI & Scrapling Patterns)

### A. Fingerprint Normalization
- Set realistic `userAgent`, `viewport` (1920x1080), and locale headers.
- Remove webdriver signatures:
```javascript
await context.addInitScript(() => {
  Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  window.chrome = { runtime: {} };
  Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
  Object.defineProperty(navigator, 'languages', { get: () => ['id-ID', 'id', 'en-US', 'en'] });
});
```

### B. Adaptive Stealth Crawling via Scrapling (Python)
When target websites use Cloudflare, Datadome, or PerimeterX:
```bash
# Run stealth scrapling crawler
python src/crawler/scrapling_mass_crawler.py --stealth
```
Key principles in Scrapling:
- Uses TLS fingerprint spoofing matching genuine Chrome/Safari clients.
- Hybrid adaptive XPath/CSS engine that recovers if attributes shift.
- Built-in headless detection bypass.

---

## 3. High-Throughput Scraping Architecture

1. **Context Pooling**: Re-use Browser instances; spin up lightweight `BrowserContext` per target domain or proxy, and close `Page` immediately when finished.
2. **Exponential Backoff with Jitter**:
   - For HTTP 429 (Too Many Requests) or 503:
   - Delay: $T = \text{base} \times 2^{\text{retry}} + \text{uniform}(0, \text{jitter})$
3. **Data Integrity & Validation**:
   - Always validate parsed fields (price > 0, currency valid, URL absolute).
   - Log failed selectors with full page snapshots/screenshots to diagnose layout updates quickly.
4. **Clean Shutdown**:
   - Always close pages and contexts in `try...finally` blocks to prevent zombie Chromium processes and memory leaks.
