const fs = require('fs');
const path = require('path');

// Load guardrails config
const configPath = path.join(__dirname, '../../config/safety_guardrails.json');
let safetyConfig = {
  strictMode: true,
  blockedHttpMethods: ['POST', 'PUT', 'DELETE', 'PATCH'],
  allowedAuthEndpoints: ['/login', '/signin', '/auth', '/api/login'],
  forbiddenActionKeywords: ['simpan', 'save', 'submit', 'hapus', 'delete', 'update', 'ubah', 'bayar', 'batal', 'tambah'],
  forbiddenUrlPatterns: ['/delete', '/destroy', '/remove', '/edit', '/update', '/save']
};

if (fs.existsSync(configPath)) {
  try {
    safetyConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (err) {
    console.error('[Guardrails] Warning: Failed to parse safety_guardrails.json, using defaults.', err.message);
  }
}

class SafetyGuardrails {
  constructor(options = {}) {
    this.strictMode = options.strictMode !== undefined ? options.strictMode : safetyConfig.strictMode;
    this.allowedAuthEndpoints = options.allowedAuthEndpoints || safetyConfig.allowedAuthEndpoints;
    this.forbiddenKeywords = safetyConfig.forbiddenActionKeywords.map(k => k.toLowerCase());
    this.forbiddenUrls = safetyConfig.forbiddenUrlPatterns.map(u => u.toLowerCase());
  }

  /**
   * Attach network-level request interceptor to Playwright Page.
   * Strictly prevents destructive HTTP verbs.
   */
  async attachToPage(page, isAuthStep = false) {
    await page.route('**/*', async (route) => {
      const request = route.request();
      const method = request.method().toUpperCase();
      const url = request.url().toLowerCase();

      // Check forbidden methods
      if (safetyConfig.blockedHttpMethods.includes(method)) {
        const isAuthEndpoint = this.allowedAuthEndpoints.some(endpoint => url.includes(endpoint.toLowerCase()));

        if (isAuthStep && isAuthEndpoint) {
          // Allow authentication POST only during explicit login phase
          console.log(`[Guardrails] [AUTH ALLOWED] ${method} -> ${request.url()}`);
          return route.continue();
        }

        console.warn(`\x1b[31m[STRICT GUARDRAIL BLOCKED]\x1b[0m ${method} request blocked on live server: ${request.url()}`);
        return route.abort('blockedbyclient');
      }

      // Check URL query or paths for dangerous action keywords
      for (const pattern of this.forbiddenUrls) {
        if (url.includes(pattern)) {
          console.warn(`\x1b[31m[STRICT GUARDRAIL BLOCKED]\x1b[0m URL matching forbidden pattern: ${pattern} -> ${request.url()}`);
          return route.abort('blockedbyclient');
        }
      }

      // Safe GET / read-only request
      return route.continue();
    });

    // In-browser DOM protection script
    await page.addInitScript(() => {
      // 1. Prevent form submissions
      window.addEventListener('submit', (e) => {
        console.warn('[Guardrails] Prevented form submission on live system.');
        e.preventDefault();
        e.stopPropagation();
        return false;
      }, true);

      // 2. Disable dangerous buttons visually and functionally
      const observer = new MutationObserver(() => {
        const dangerousTerms = [
          'simpan', 'save', 'submit', 'hapus', 'delete', 'destroy',
          'update', 'ubah', 'edit', 'bayar', 'checkout', 'batal',
          'tambah', 'create', 'insert', 'konfirmasi', 'kirim'
        ];

        document.querySelectorAll('button, input[type="submit"], a.btn, [role="button"]').forEach(btn => {
          const text = (btn.innerText || btn.value || btn.getAttribute('aria-label') || '').trim().toLowerCase();
          const isDangerous = dangerousTerms.some(term => text.includes(term));

          if (isDangerous) {
            btn.setAttribute('data-guardrail-disabled', 'true');
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
            btn.title = 'Dinonaktifkan oleh Guardrail Read-Only (Sistem Live Operasional)';
            btn.onclick = (e) => {
              e.preventDefault();
              e.stopPropagation();
              console.warn(`[Guardrails] Klik pada "${text}" diblokir untuk menjaga keutuhan data.`);
              return false;
            };
          }
        });
      });

      if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
      } else {
        document.addEventListener('DOMContentLoaded', () => {
          observer.observe(document.body, { childList: true, subtree: true });
        });
      }
    });
  }

  /**
   * Check if a text or label is safe to interact with.
   */
  isSafeAction(text, href = '') {
    if (!text && !href) return true;

    const lowerText = (text || '').toLowerCase().trim();
    const lowerHref = (href || '').toLowerCase().trim();

    for (const kw of this.forbiddenKeywords) {
      if (lowerText.includes(kw)) {
        return false;
      }
    }

    for (const urlPattern of this.forbiddenUrls) {
      if (lowerHref.includes(urlPattern)) {
        return false;
      }
    }

    return true;
  }
}

module.exports = { SafetyGuardrails, safetyConfig };

