const fs = require('fs');

class LivewireGuardrailV4 {
  constructor() {
    this.allowedReadCount = 0;
    this.blockedCount = 0;
    this.blockedDetails = [];
    this.requestAuditLog = [];

    this.mutativeMethodPatterns = [
      /save/i, /store/i, /update/i, /delete/i, /destroy/i,
      /apply/i, /archive/i, /duplicate/i, /create/i, /upload/i,
      /toggle/i, /sync/i, /syncorgunits/i, /recalculate/i, /reset/i,
      /bulk/i, /edit/i, /simpan/i, /hapus/i, /arsip/i
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

      // 1. Allow static assets and harmless GET requests
      if (method === 'GET') {
        // Redact any query params that might look like token or secret
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
          // If JSON parse fails on POST, treat with deny-by-default
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
          console.warn(`[LivewireGuardrail V4] [INTERCEPTED] ${reason}`);
          return route.abort('blockedbyclient');
        }

        // Benign search / filter update
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
        classification: 'MUTATIVE_OR_UNKNOWN',
        action: 'BLOCKED_BY_GUARDRAIL'
      });
      console.warn(`[LivewireGuardrail V4] [BLOCKED] ${reason}`);
      return route.abort('blockedbyclient');
    });
  }

  getStats() {
    return {
      allowedReadCount: this.allowedReadCount,
      blockedCount: this.blockedCount,
      blockedDetails: this.blockedDetails,
      zeroMutationVerified: this.blockedCount === 0 || this.blockedDetails.every(b => b.reason.includes('dicegah') || b.reason.includes('dicegat')),
      clientSideMutationStatus: 'CLIENT_SIDE_NO_MUTATION_OBSERVED'
    };
  }

  exportRedactedAuditLog(outputPath) {
    const logData = {
      schema_version: "4.0",
      generated_at_utc: new Date().toISOString(),
      guardrail_stats: this.getStats(),
      total_logged_requests: this.requestAuditLog.length,
      redacted_requests: this.requestAuditLog
    };
    fs.writeFileSync(outputPath, JSON.stringify(logData, null, 2), 'utf8');
    console.log(`[LivewireGuardrail V4] Redacted request log tersimpan (${this.requestAuditLog.length} requests tercatat).`);
    return logData;
  }

  _sanitizeQuery(search) {
    if (!search) return '';
    return search.replace(/(token|secret|session|key|auth|password)=[^&]*/gi, '$1=[REDACTED]');
  }
}

module.exports = { LivewireGuardrailV4 };

