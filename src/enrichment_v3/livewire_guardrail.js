class LivewireGuardrail {
  constructor() {
    this.blockedCount = 0;
    this.allowedReadCount = 0;
    this.blockedLog = [];
  }

  isSafeRequest(request) {
    const method = request.method().toUpperCase();
    const url = request.url();

    // Standard GET is always safe
    if (method === 'GET' || method === 'OPTIONS' || method === 'HEAD') {
      const lower = url.toLowerCase();
      if (lower.includes('/destroy') || lower.includes('/delete') || lower.includes('/hapus')) {
        this._recordBlocked(method, url, 'Destructive keyword in GET URL');
        return false;
      }
      return true;
    }

    // Livewire 3 Component Updates via POST
    if (method === 'POST' && url.includes('/livewire/update')) {
      const postData = request.postData();
      if (!postData) {
        this.allowedReadCount++;
        return true;
      }

      try {
        const payload = JSON.parse(postData);
        const components = payload.components || [];

        const mutatingMethods = [
          'save', 'simpan', 'delete', 'hapus', 'destroy', 'apply',
          'archive', 'arsip', 'duplicate', 'duplikasi', 'store',
          'create', 'tambah', 'import', 'upload', 'publish'
        ];

        for (const comp of components) {
          const calls = comp.calls || [];
          for (const call of calls) {
            const methodCalled = (call.method || '').toLowerCase();
            for (const dangerous of mutatingMethods) {
              if (methodCalled.includes(dangerous)) {
                this._recordBlocked(method, url, `Mutating Livewire call: ${call.method}`);
                return false;
              }
            }
          }
        }

        // Only benign updates (e.g. search, brand filter, pagination)
        this.allowedReadCount++;
        return true;
      } catch (err) {
        // If cannot parse safely, abort
        this._recordBlocked(method, url, `Unparseable Livewire payload: ${err.message}`);
        return false;
      }
    }

    // All other POST/PUT/DELETE/PATCH are strictly blocked
    this._recordBlocked(method, url, `HTTP Method ${method} is blocked on production`);
    return false;
  }

  _recordBlocked(method, url, reason) {
    this.blockedCount++;
    const entry = {
      timestamp: new Date().toISOString(),
      method,
      url,
      reason
    };
    this.blockedLog.push(entry);
    console.warn(`[LivewireGuardrail] BLOCKED ${method} ${url} -> ${reason}`);
  }

  getStats() {
    return {
      blockedCount: this.blockedCount,
      allowedReadCount: this.allowedReadCount,
      blockedLog: this.blockedLog
    };
  }
}

module.exports = { LivewireGuardrail };

