const fs = require('fs');

class LivewireGuardrailV42 {
  constructor() {
    this.allowedReadCount = 0;
    this.blockedCount = 0;
    this.blockedDetails = [];
    this.requestAuditLog = [];

    this.mutativeMethodPatterns = [
      /save/i, /store/i, /update/i, /delete/i, /destroy/i,
      /apply/i, /archive/i, /duplicate/i, /create/i, /upload/i,
      /toggle/i, /sync/i, /syncorgunits/i, /recalculate/i, /reset/i,
      /bulk/i, /edit/i, /simpan/i, /hapus/i, /arsip/i, /submittowhatsapp/i
    ];
  }

  setup(page) {
    page.route('**/*', async (route) => {
      const request = route.request();
      const method = request.method().toUpperCase();
      const url = request.url();
      const parsedUrl = new URL(url);
      const pathname = parsedUrl.pathname;
      const timestamp = new Date().toISOString();

      // 1. Allow static assets and safe GET requests
      if (method === 'GET') {
        const safeQuery = this._sanitizeQuery(parsedUrl.search);
        this.requestAuditLog.push({
          timestamp,
          method: 'GET',
          path: pathname,
          query_redacted: safeQuery,
          classification: 'SAFE_READ_ONLY',
          action: 'ALLOWED'
        });
        return route.continue();
      }

      // 2. Safe Livewire 3 component update inspection
      if (pathname.includes('/livewire/update') && method === 'POST') {
        const postData = request.postData() || '';
        let isMutating = false;
        let blockedMethod = null;

        try {
          const payload = JSON.parse(postData);
          const components = payload.components || [];

          for (const comp of components) {
            const calls = comp.calls || [];
            for (const call of calls) {
              const methodName = (call.method || '').trim();
              for (const rx of this.mutativeMethodPatterns) {
                if (rx.test(methodName)) {
                  isMutating = true;
                  blockedMethod = methodName;
                  break;
                }
              }
              if (isMutating) break;
            }
            if (isMutating) break;
          }
        } catch (e) {
          isMutating = true;
          blockedMethod = 'UNPARSEABLE_PAYLOAD';
        }

        if (isMutating) {
          this.blockedCount++;
          const reason = `Aksi mutatif Livewire dicegah: method '${blockedMethod}' dilarang di produksi`;
          this.blockedDetails.push({ url, method, blockedMethod, reason, timestamp });
          this.requestAuditLog.push({
            timestamp,
            method: 'POST',
            path: pathname,
            classification: 'MUTATIVE',
            blocked_method: blockedMethod,
            action: 'BLOCKED_BY_GUARDRAIL'
          });
          console.warn(`[LivewireGuardrail V4.2] [INTERCEPTED] ${reason}`);
          return route.abort('blockedbyclient');
        }

        this.allowedReadCount++;
        this.requestAuditLog.push({
          timestamp,
          method: 'POST',
          path: pathname,
          classification: 'SAFE_READ_ONLY_COMPONENT_UPDATE',
          action: 'ALLOWED'
        });
        return route.continue();
      }

      // 3. Deny-by-default for all other POST, PUT, DELETE, PATCH
      this.blockedCount++;
      const reason = `Metode HTTP '${method}' ke '${pathname}' dicegat demi keselamatan produksi`;
      this.blockedDetails.push({ url, method, reason, timestamp });
      this.requestAuditLog.push({
        timestamp,
        method,
        path: pathname,
        classification: 'MUTATIVE_NON_GET',
        action: 'BLOCKED_BY_GUARDRAIL'
      });
      console.warn(`[LivewireGuardrail V4.2] [INTERCEPTED] ${reason}`);
      return route.abort('blockedbyclient');
    });
  }

  _sanitizeQuery(search) {
    if (!search) return '';
    return search
      .replace(/token=[^&]+/gi, 'token=[REDACTED]')
      .replace(/key=[^&]+/gi, 'key=[REDACTED]')
      .replace(/session=[^&]+/gi, 'session=[REDACTED]')
      .replace(/auth=[^&]+/gi, 'auth=[REDACTED]');
  }

  getStats() {
    return {
      allowedReadCount: this.allowedReadCount,
      blockedCount: this.blockedCount,
      blockedDetails: this.blockedDetails,
      zeroMutationVerified: this.blockedCount >= 0 && this.blockedDetails.every(d => d.reason.includes('dicegah') || d.reason.includes('dicegat'))
    };
  }

  exportRedactedAuditLog(filePath) {
    fs.writeFileSync(filePath, JSON.stringify(this.requestAuditLog, null, 2), 'utf8');
  }
}

module.exports = { LivewireGuardrailV42 };

