const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { SafetyGuardrails } = require('./guardrails');
const { SessionManager } = require('../auth/session_manager');
const { DomParser } = require('./dom_parser');
const { DataSanitizer } = require('./data_sanitizer');
require('dotenv').config();

class SafeCrawler {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || process.env.BASE_URL;
    this.role = options.role || process.env.ACTIVE_CRAWL_ROLE || 'employee';
    this.maxPages = options.maxPages || parseInt(process.env.MAX_PAGES_LIMIT || '50', 10);
    this.maxDepth = options.maxDepth || parseInt(process.env.MAX_DEPTH || '3', 10);
    this.rateLimitDelay = options.rateLimitDelay || parseInt(process.env.RATE_LIMIT_DELAY_MS || '2500', 10);
    this.headless = process.env.BROWSER_HEADLESS !== 'false';

    this.storageDir = path.join(__dirname, '../../storage');
    this.screenshotsDir = path.join(this.storageDir, 'screenshots');
    this.rawPagesDir = path.join(this.storageDir, 'raw_pages');
    this.checkpointFile = path.join(this.storageDir, 'checkpoints', 'checkpoint.json');

    this.guardrails = new SafetyGuardrails();
    this.sessionManager = new SessionManager();

    this.visitedUrls = new Set();
    this.crawledData = [];
    this.queue = [];
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  saveCheckpoint() {
    const data = {
      timestamp: new Date().toISOString(),
      role: this.role,
      visitedCount: this.visitedUrls.size,
      visitedUrls: Array.from(this.visitedUrls),
      crawledCount: this.crawledData.length,
      queue: this.queue
    };
    fs.writeFileSync(this.checkpointFile, JSON.stringify(data, null, 2), 'utf8');
  }

  loadCheckpoint() {
    if (fs.existsSync(this.checkpointFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(this.checkpointFile, 'utf8'));
        this.visitedUrls = new Set(data.visitedUrls || []);
        this.queue = data.queue || [];
        console.log(`[SafeCrawler] Resumed from checkpoint: ${this.visitedUrls.size} visited URLs loaded.`);
        return true;
      } catch (err) {
        console.warn(`[SafeCrawler] Failed to load checkpoint: ${err.message}`);
      }
    }
    return false;
  }

  isInternalUrl(urlStr) {
    try {
      const baseObj = new URL(this.baseUrl);
      const targetObj = new URL(urlStr);
      return targetObj.hostname === baseObj.hostname;
    } catch {
      return false;
    }
  }

  isHtmlPage(urlStr) {
    if (!urlStr) return false;
    if (/\.(png|jpg|jpeg|gif|svg|webp|pdf|zip|css|js|ico|woff|woff2|ttf)$/i.test(urlStr)) {
      return false;
    }
    return true;
  }

  cleanUrl(urlStr) {
    try {
      const obj = new URL(urlStr);
      obj.hash = ''; // strip fragment
      return obj.toString();
    } catch {
      return urlStr;
    }
  }

  async start() {
    console.log(`=======================================================`);
    console.log(`[SafeCrawler] INITIALIZING SAFE LIVE CRAWLER`);
    console.log(`Target URL        : ${this.baseUrl}`);
    console.log(`Role Mode         : ${this.role}`);
    console.log(`Rate Limit Delay  : ${this.rateLimitDelay} ms`);
    console.log(`Max Pages         : ${this.maxPages}`);
    console.log(`Safety Guardrails : STRICT READ-ONLY ACTIVE`);
    console.log(`=======================================================`);

    if (!this.baseUrl) {
      throw new Error('BASE_URL is not defined! Please set BASE_URL in your .env file.');
    }

    const browser = await chromium.launch({
      headless: this.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    });

    const hasSession = this.sessionManager.hasExistingSession(this.role);
    const contextOptions = {
      viewport: { width: 1440, height: 900 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 (Antigravity-Guidebook-SafeCrawler/1.0)'
    };

    if (hasSession) {
      contextOptions.storageState = this.sessionManager.getSessionPath(this.role);
      console.log(`[SafeCrawler] Loading authenticated storageState for role: ${this.role}`);
    }

    const context = await browser.newContext(contextOptions);

    const page = await context.newPage();

    // Attach strict guardrails
    await this.guardrails.attachToPage(page, !hasSession);

    // Initial Login if needed
    if (!hasSession) {
      console.log(`[SafeCrawler] No existing session found. Attempting safe login...`);
      await this.sessionManager.performLogin(page, context, this.role);
    }

    // Initial queue: Seed with all core operational routes
    if (this.queue.length === 0) {
      const baseClean = this.baseUrl.replace(/\/+$/, '');
      const coreRoutes = [
        '/dashboard',
        '/search',
        '/harga?brand=makerspace',
        '/harga?brand=sekolah-bengkel',
        '/harga?brand=sistem-bengkel',
        '/harga?brand=workshop',
        '/harga?brand=boostlab',
        '/harga?brand=spdvc',
        '/harga?brand=speedometer',
        '/harga?brand=gearsecond',
        '/harga?brand=power',
        '/harga?brand=yoong-motor',
        '/admin/brosur',
        '/admin/diskon',
        '/admin/user',
        '/admin/duplicate',
        '/admin/edit-harga'
      ];

      for (const r of coreRoutes) {
        this.queue.push({ url: baseClean + r, depth: 0 });
      }
      console.log(`[SafeCrawler] Enqueued ${this.queue.length} core operational routes.`);
    }

    let pageIndex = 1;

    while (this.queue.length > 0 && this.visitedUrls.size < this.maxPages) {
      const { url: currentTargetUrl, depth } = this.queue.shift();
      const targetUrl = this.cleanUrl(currentTargetUrl);

      if (this.visitedUrls.has(targetUrl)) {
        continue;
      }

      this.visitedUrls.add(targetUrl);

      console.log(`\n[SafeCrawler] [${pageIndex}/${this.maxPages}] Crawling: ${targetUrl} (Depth: ${depth})`);

      try {
        const response = await page.goto(targetUrl, {
          waitUntil: 'networkidle',
          timeout: 30000
        }).catch(async () => {
          // Fallback to domcontentloaded if networkidle takes too long
          return await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        });

        const status = response ? response.status() : 200;
        if (status === 429 || status === 503) {
          console.warn(`[SafeCrawler] Server reported ${status}. Backing off for 10 seconds to preserve server health...`);
          await this.sleep(10000);
          continue;
        }

        // Wait settle delay
        await this.sleep(800);

        // Take Screenshot
        const safeSlug = targetUrl.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 60);
        const screenshotFileName = `${String(pageIndex).padStart(3, '0')}_${safeSlug}.png`;
        const screenshotPath = path.join(this.screenshotsDir, screenshotFileName);
        await page.screenshot({ path: screenshotPath, fullPage: false });

        // Extract DOM & metadata
        const html = await page.content();
        let pageData = DomParser.parsePageStructure(html, targetUrl);
        pageData.pageIndex = pageIndex;
        pageData.screenshotFile = screenshotFileName;
        pageData.screenshotPath = screenshotPath;
        pageData.role = this.role;

        // Apply Sensitive Data Masking (PII / Financial Sanitization)
        pageData = DataSanitizer.sanitizeObject(pageData);

        // Save raw page summary
        const rawJsonPath = path.join(this.rawPagesDir, `${String(pageIndex).padStart(3, '0')}_${safeSlug}.json`);
        fs.writeFileSync(rawJsonPath, JSON.stringify(pageData, null, 2), 'utf8');

        this.crawledData.push(pageData);
        console.log(`[SafeCrawler] Captured: "${pageData.pageTitle}" | Menus: ${pageData.navigationLinks.length} | Form Fields: ${pageData.formFields.length} | Tables: ${pageData.tables.length}`);

        // Discover new safe links if within depth limit
        if (depth < this.maxDepth) {
          for (const item of pageData.navigationLinks) {
            try {
              const fullUrl = new URL(item.href, targetUrl).toString();
              const cleaned = this.cleanUrl(fullUrl);

              if (this.isInternalUrl(cleaned) &&
                  this.isHtmlPage(cleaned) &&
                  !this.visitedUrls.has(cleaned) &&
                  this.guardrails.isSafeAction(item.text, item.href)) {
                this.queue.push({ url: cleaned, depth: depth + 1 });
              }
            } catch {
              // Ignore invalid url
            }
          }
        }

        pageIndex++;
        this.saveCheckpoint();

        // Enforce rate limiting delay to avoid server burden
        console.log(`[SafeCrawler] Throttling: Sleeping ${this.rateLimitDelay}ms to keep server load minimal...`);
        await this.sleep(this.rateLimitDelay);

      } catch (err) {
        console.error(`[SafeCrawler] Error processing ${targetUrl}: ${err.message}`);
        await this.sleep(this.rateLimitDelay);
      }
    }

    console.log(`\n=======================================================`);
    console.log(`[SafeCrawler] CRAWL COMPLETED SUCCESSFULLY`);
    console.log(`Total Pages Processed: ${this.crawledData.length}`);
    console.log(`Screenshots Saved To : ${this.screenshotsDir}`);
    console.log(`Raw Data Saved To    : ${this.rawPagesDir}`);
    console.log(`=======================================================`);

    await browser.close();
    return this.crawledData;
  }
}

module.exports = { SafeCrawler };

