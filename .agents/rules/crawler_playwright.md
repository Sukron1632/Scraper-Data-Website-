# Playwright, Scrapling, & Web Crawler Engineering Rules

1. **Locator Strategy**:
   - Always prefer `getByRole`, `getByLabel`, `getByText`, or `getByTestId`.
   - Never use auto-generated or deeply nested class selectors (e.g. `.css-19zjg9 > div`).
2. **Timing & Synchronization**:
   - Strictly prohibit arbitrary delays (`waitForTimeout` / `time.sleep`).
   - Use action auto-waiting or explicit assertion events (`expect(locator).toBeVisible()`).
3. **Bandwidth & Speed**:
   - Abort images, media, and fonts via route interception during catalog extraction.
4. **Anti-Bot & Stealth**:
   - Employ TLS fingerprint spoofing via Scrapling for Cloudflare-protected endpoints.
   - Emulate realistic viewports and remove automated browser navigator artifacts.
5. **Process Safety**:
   - Always close browser pages and contexts in `finally` blocks.

