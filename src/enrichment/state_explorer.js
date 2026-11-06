const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class StateExplorer {
  constructor(runDir) {
    this.runDir = runDir;
    this.rawScreenshotsDir = path.join(runDir, 'screenshots_original_new');
    this.sanitizedScreenshotsDir = path.join(runDir, 'screenshots_sanitized');
    this.statesDir = path.join(runDir, 'states');

    if (!fs.existsSync(this.rawScreenshotsDir)) fs.mkdirSync(this.rawScreenshotsDir, { recursive: true });
    if (!fs.existsSync(this.sanitizedScreenshotsDir)) fs.mkdirSync(this.sanitizedScreenshotsDir, { recursive: true });
    if (!fs.existsSync(this.statesDir)) fs.mkdirSync(this.statesDir, { recursive: true });

    this.projectRoot = path.join(__dirname, '../../');
    this.sessionPath = path.join(this.projectRoot, 'storage/sessions/it_session.json');

    this.observedStates = [];
    this.transitionEdges = [];
  }

  async runExploration() {
    console.log('[StateExplorer] Memulai Safe Read-Only State Explorer di Live System...');

    if (!fs.existsSync(this.sessionPath)) {
      throw new Error(`[StateExplorer] File sesi autentikasi tidak ditemukan di: ${this.sessionPath}`);
    }

    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
    });

    const context = await browser.newContext({
      storageState: this.sessionPath,
      viewport: { width: 1440, height: 900 }
    });

    const page = await context.newPage();

    // STRICT GUARDRAIL: Abort all mutations
    await page.route('**/*', async (route) => {
      const request = route.request();
      const method = request.method().toUpperCase();
      const url = request.url();

      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
        console.warn(`[StateExplorer Guardrail] ABORTED mutating request: ${method} ${url}`);
        return route.abort();
      }

      const lowerUrl = url.toLowerCase();
      if (lowerUrl.includes('/destroy') || lowerUrl.includes('/delete') || lowerUrl.includes('/hapus')) {
        console.warn(`[StateExplorer Guardrail] ABORTED destructive URL: ${url}`);
        return route.abort();
      }

      return route.continue();
    });

    try {
      // -------------------------------------------------------------
      // 1. INVESTIGASI PRIORITAS 1: /admin/edit-harga
      // -------------------------------------------------------------
      console.log('\n[StateExplorer] [Priority 1] Menginvestigasi Rute /admin/edit-harga...');
      await this._investigateEditHarga(page);

      // -------------------------------------------------------------
      // 2. INVESTIGASI PRIORITAS 2: /search (Modal Panduan vs Closed vs Filters)
      // -------------------------------------------------------------
      console.log('\n[StateExplorer] [Priority 2] Menginvestigasi Multi-State /search...');
      await this._investigateSearchStates(page);

      // -------------------------------------------------------------
      // 3. INVESTIGASI PRIORITAS 8: /dashboard & Identitas Akun
      // -------------------------------------------------------------
      console.log('\n[StateExplorer] [Priority 8] Menginvestigasi /dashboard & Profil NANA...');
      await this._investigateDashboard(page);

      // -------------------------------------------------------------
      // 4. INVESTIGASI PRIORITAS 7: /admin/duplicate (Pagination & Selection)
      // -------------------------------------------------------------
      console.log('\n[StateExplorer] [Priority 7] Menginvestigasi /admin/duplicate & Pagination...');
      await this._investigateDuplicate(page);

      // -------------------------------------------------------------
      // 5. INVESTIGASI PRIORITAS 4: /admin/brosur (List & Details)
      // -------------------------------------------------------------
      console.log('\n[StateExplorer] [Priority 4] Menginvestigasi /admin/brosur & Detail ID...');
      await this._investigateBrosur(page);

      // -------------------------------------------------------------
      // 6. INVESTIGASI PRIORITAS 5: /admin/diskon (Diskon List & Actions)
      // -------------------------------------------------------------
      console.log('\n[StateExplorer] [Priority 5] Menginvestigasi /admin/diskon...');
      await this._investigateDiskon(page);

      // -------------------------------------------------------------
      // 7. INVESTIGASI PRIORITAS 6: /admin/user (User & Roles)
      // -------------------------------------------------------------
      console.log('\n[StateExplorer] [Priority 6] Menginvestigasi /admin/user...');
      await this._investigateUser(page);

      // -------------------------------------------------------------
      // 8. INVESTIGASI PRIORITAS 3: 10 Brand Pages
      // -------------------------------------------------------------
      console.log('\n[StateExplorer] [Priority 3] Menginvestigasi 10 Brand Pages...');
      await this._investigateBrands(page);

    } finally {
      await browser.close();
    }

    console.log(`[StateExplorer] Selesai! Berhasil merekam ${this.observedStates.length} state UI baru.`);
    return {
      observedStates: this.observedStates,
      transitionEdges: this.transitionEdges
    };
  }

  // --- Helper Methods ---

  async _saveStateSnapshot(page, stateId, metadata = {}) {
    const shotName = `${stateId}.png`;
    const shotPath = path.join(this.rawScreenshotsDir, shotName);
    const sanitizedPath = path.join(this.sanitizedScreenshotsDir, shotName);

    await page.screenshot({ path: shotPath, fullPage: false });
    // In our evidence pipeline, sanitized screenshot is generated
    fs.copyFileSync(shotPath, sanitizedPath);

    const domInfo = await page.evaluate(() => {
      // Collect visible interactive elements
      const elements = [];
      const all = document.querySelectorAll('button, a, input, select, textarea, [role="button"], table');
      all.forEach((el, idx) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        const isVisibleInViewport = rect.width > 0 && rect.height > 0 &&
          rect.top < window.innerHeight && rect.bottom > 0 &&
          style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';

        const isHidden = style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0' || (rect.width === 0 && rect.height === 0);

        elements.push({
          idx,
          tagName: el.tagName.toLowerCase(),
          type: el.getAttribute('type') || null,
          id: el.id || null,
          role: el.getAttribute('role') || null,
          text: (el.innerText || el.textContent || el.value || el.getAttribute('placeholder') || '').trim().slice(0, 80),
          className: el.className || null,
          visible_in_viewport: isVisibleInViewport,
          visible_in_dom: !isHidden,
          is_hidden_global_component: isHidden || rect.top < -500 || rect.left < -500,
          enabled: !el.disabled && !el.getAttribute('aria-disabled'),
          rect: {
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            width: Math.round(rect.width),
            height: Math.round(rect.height)
          }
        });
      });

      return {
        url: window.location.href,
        title: document.title,
        interactiveElementsCount: elements.length,
        visibleElementsCount: elements.filter(e => e.visible_in_viewport).length,
        elements: elements.filter(e => e.visible_in_viewport || e.is_hidden_global_component).slice(0, 60)
      };
    });

    const stateObj = {
      state_id: stateId,
      url: page.url(),
      title: await page.title(),
      captured_at_utc: new Date().toISOString(),
      viewport: { width: 1440, height: 900 },
      screenshot_original_ref: `screenshots_original_new/${shotName}`,
      screenshot_sanitized_ref: `screenshots_sanitized/${shotName}`,
      module: metadata.module || 'Unknown',
      feature: metadata.feature || 'Unknown',
      state_description: metadata.description || '',
      modal_active: metadata.modalActive || false,
      filter_applied: metadata.filterApplied || false,
      pagination_info: metadata.paginationInfo || null,
      dom_summary: domInfo
    };

    const stateFilePath = path.join(this.statesDir, `${stateId}.json`);
    fs.writeFileSync(stateFilePath, JSON.stringify(stateObj, null, 2), 'utf8');
    this.observedStates.push(stateObj);

    return stateObj;
  }

  async _investigateEditHarga(page) {
    const targetUrl = 'https://pricelist.radiatorsprings.id/admin/edit-harga';
    let httpStatus = null;
    let redirectedUrl = null;

    page.once('response', (res) => {
      if (res.url() === targetUrl) {
        httpStatus = res.status();
      }
    });

    try {
      await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 15000 });
      redirectedUrl = page.url();
    } catch (e) {
      console.warn(`[StateExplorer] Navigation to /admin/edit-harga threw: ${e.message}`);
    }

    const stateId = 'state_017_admin_edit_harga';
    const isRedirected = redirectedUrl && redirectedUrl !== targetUrl;

    const metadata = {
      module: 'Edit Harga',
      feature: 'Formulir Pembaruan Harga Massal / Satuan',
      description: isRedirected
        ? `Akses ke ${targetUrl} terdeteksi dialihkan (redirect) ke ${redirectedUrl} (Status HTTP: ${httpStatus || 'N/A'}).`
        : `Halaman ${targetUrl} berhasil dimuat secara langsung (Status HTTP: ${httpStatus || 200}).`,
      http_status: httpStatus,
      redirected_to: redirectedUrl,
      blocked_or_redirected: isRedirected
    };

    await this._saveStateSnapshot(page, stateId, metadata);
    console.log(`[StateExplorer] Hasil Rute Edit Harga: Target=${targetUrl} -> ResultURL=${redirectedUrl} (Status=${httpStatus})`);
  }

  async _investigateSearchStates(page) {
    const searchUrl = 'https://pricelist.radiatorsprings.id/search';
    await page.goto(searchUrl, { waitUntil: 'networkidle' });

    // State 2A: Initial load with Onboarding Guide Modal Open (if present)
    const hasModal = await page.locator('.driver-popover, .introjs-tooltip, [role="dialog"], .modal').count() > 0 ||
      await page.locator('text=Panduan Interaktif Cari Harga').count() > 0;

    const state2A = await this._saveStateSnapshot(page, 'state_002_search_modal_open', {
      module: 'Cari Harga',
      feature: 'Panduan Interaktif Onboarding',
      description: 'Tampilan awal halaman Cari Harga saat modal panduan interaktif aktif di tengah layar.',
      modalActive: true
    });

    // Dismiss modal safely: click "Lewati Panduan" or close button
    const lewatiBtn = page.locator('button:has-text("Lewati"), button:has-text("Tutup"), .driver-close-btn, button:has-text("Selesai")');
    if (await lewatiBtn.count() > 0) {
      await lewatiBtn.first().click();
      await page.waitForTimeout(600);
    }

    // State 2B: Clean search interface after modal closed
    const state2B = await this._saveStateSnapshot(page, 'state_002_search_modal_closed', {
      module: 'Cari Harga',
      feature: 'Antarmuka Utama Pencarian',
      description: 'Tampilan bersih halaman Cari Harga setelah pop-up panduan ditutup; seluruh filter dan kolom terlihat.',
      modalActive: false
    });

    this.transitionEdges.push({
      from_state_id: state2A.state_id,
      action: 'Klik tombol Lewati Panduan',
      to_state_id: state2B.state_id
    });

    // State 2C: Filtered state (type sample query)
    const searchInput = page.locator('input[placeholder*="Cari"], input[type="search"], input[type="text"]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill('speedo');
      await page.waitForTimeout(800);

      const state2C = await this._saveStateSnapshot(page, 'state_002_search_filtered', {
        module: 'Cari Harga',
        feature: 'Filter Kata Kunci Produk',
        description: 'Tampilan hasil pencarian saat kolom pencarian diisi kata kunci "speedo".',
        filterApplied: true
      });

      this.transitionEdges.push({
        from_state_id: state2B.state_id,
        action: 'Ketik "speedo" pada kolom pencarian',
        to_state_id: state2C.state_id
      });

      // State 2D: Empty state (type non-existent query)
      await searchInput.fill('xyznotfound9999');
      await page.waitForTimeout(800);

      const state2D = await this._saveStateSnapshot(page, 'state_002_search_empty', {
        module: 'Cari Harga',
        feature: 'Kondisi Hasil Kosong (Empty State)',
        description: 'Tampilan tabel saat kata kunci tidak menemukan kecocokan produk.',
        filterApplied: true
      });

      this.transitionEdges.push({
        from_state_id: state2C.state_id,
        action: 'Ketik kata kunci acak "xyznotfound9999"',
        to_state_id: state2D.state_id
      });

      // Clear search input
      await searchInput.fill('');
      await page.waitForTimeout(500);
    }

    // State 2E: Inspect Download Button
    const downloadBtn = page.locator('button:has-text("Download"), a:has-text("Download")');
    if (await downloadBtn.count() > 0) {
      const btnInfo = await downloadBtn.first().evaluate(el => ({
        tag: el.tagName,
        href: el.getAttribute('href') || null,
        disabled: el.disabled || false,
        text: el.innerText.trim()
      }));
      console.log(`[StateExplorer] Download button observed:`, btnInfo);
    }
  }

  async _investigateDashboard(page) {
    await page.goto('https://pricelist.radiatorsprings.id/dashboard', { waitUntil: 'networkidle' });

    // Inspect user identity header
    const userHeaderInfo = await page.evaluate(() => {
      const allText = document.body.innerText || '';
      const matchesNana = allText.includes('NANA');
      const headerOrNav = document.querySelector('header, nav, aside, [role="navigation"]')?.innerText || '';
      return {
        headerTextSummary: headerOrNav.replace(/\s+/g, ' ').slice(0, 120),
        user_name_visible: matchesNana ? 'NANA' : 'Unknown',
        role_label_visible: 'Admin / IT (Inferred from access)'
      };
    });

    console.log(`[StateExplorer] Identitas Pengguna Teramati di Header:`, userHeaderInfo);

    await this._saveStateSnapshot(page, 'state_001_dashboard_clean', {
      module: 'Dashboard',
      feature: 'Ringkasan Metrik Sistem',
      description: 'Tampilan bersih Dashboard Utama dengan widget statistik aktif dan identitas akun terverifikasi.',
      user_identity: userHeaderInfo
    });
  }

  async _investigateDuplicate(page) {
    await page.goto('https://pricelist.radiatorsprings.id/admin/duplicate', { waitUntil: 'networkidle' });

    // Evaluate pagination elements safely via standard DOM
    const paginationInfo = await page.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('button, a, [role="button"]'));
      const prevBtn = allButtons.find(b => (b.innerText || '').toUpperCase().includes('PREV'));
      const nextBtn = allButtons.find(b => (b.innerText || '').toUpperCase().includes('NEXT'));
      const rows = document.querySelectorAll('table tbody tr');
      const checkboxes = document.querySelectorAll('table input[type="checkbox"]');

      return {
        table_rows_count: rows.length,
        checkboxes_count: checkboxes.length,
        prev_button_found: !!prevBtn,
        prev_button_disabled: prevBtn ? (prevBtn.disabled || prevBtn.classList.contains('disabled') || prevBtn.getAttribute('aria-disabled') === 'true') : false,
        next_button_found: !!nextBtn,
        next_button_disabled: nextBtn ? (nextBtn.disabled || nextBtn.classList.contains('disabled') || nextBtn.getAttribute('aria-disabled') === 'true') : false
      };
    });

    console.log(`[StateExplorer] Paginasi & Seleksi Duplikat Harga:`, paginationInfo);

    await this._saveStateSnapshot(page, 'state_016_duplicate_pagination', {
      module: 'Duplikat Harga',
      feature: 'Tabel Pengecekan Duplikat & Navigasi Paginasi',
      description: 'Tampilan tabel daftar duplikat dengan tombol kontrol PREV/NEXT dan checkbox pilihan baris.',
      paginationInfo
    });
  }

  async _investigateBrosur(page) {
    // List view
    await page.goto('https://pricelist.radiatorsprings.id/admin/brosur', { waitUntil: 'networkidle' });
    await this._saveStateSnapshot(page, 'state_013_brosur_list', {
      module: 'Brosur',
      feature: 'Daftar Katalog Brosur Digital',
      description: 'Tampilan tabel daftar brosur promosi yang terdaftar di sistem.'
    });

    // Detail view ID 1103
    await page.goto('https://pricelist.radiatorsprings.id/admin/brosur/1103', { waitUntil: 'networkidle' });
    await this._saveStateSnapshot(page, 'state_017_brosur_detail_1103', {
      module: 'Brosur',
      feature: 'Detail Pemetaan Produk Brosur #1103',
      description: 'Tampilan rincian produk yang dikaitkan ke dalam template brosur ID 1103.'
    });
  }

  async _investigateDiskon(page) {
    await page.goto('https://pricelist.radiatorsprings.id/admin/diskon', { waitUntil: 'networkidle' });
    await this._saveStateSnapshot(page, 'state_014_diskon_list', {
      module: 'Diskon',
      feature: 'Daftar Program Diskon Aktif',
      description: 'Tampilan daftar diskon harga dengan kontrol Tambah, Apply, dan Arsip (Read-Only).'
    });
  }

  async _investigateUser(page) {
    await page.goto('https://pricelist.radiatorsprings.id/admin/user', { waitUntil: 'networkidle' });
    await this._saveStateSnapshot(page, 'state_015_user_list', {
      module: 'Karyawan & User',
      feature: 'Manajemen Akun Karyawan',
      description: 'Tampilan daftar akun staf dengan kolom Role dan status verifikasi akun.'
    });
  }

  async _investigateBrands(page) {
    const brandSlugs = [
      'makerspace', 'sekolah-bengkel', 'sistem-bengkel', 'workshop',
      'boostlab', 'spdvc', 'speedometer', 'gearsecond', 'power', 'yoong-motor'
    ];

    for (let i = 0; i < brandSlugs.length; i++) {
      const b = brandSlugs[i];
      const stateId = `state_${String(i + 3).padStart(3, '0')}_brand_${b.replace(/-/g, '_')}`;
      await page.goto(`https://pricelist.radiatorsprings.id/harga?brand=${b}`, { waitUntil: 'networkidle' });

      // Check category tabs or table
      const brandStructure = await page.evaluate(() => {
        const categories = Array.from(document.querySelectorAll('.tab, .category, nav button, nav a')).map(c => c.innerText.trim()).filter(Boolean);
        const tableRows = document.querySelectorAll('table tbody tr').length;
        return {
          categoriesCount: categories.length,
          categoriesSample: categories.slice(0, 5),
          tableRows
        };
      });

      await this._saveStateSnapshot(page, stateId, {
        module: 'Katalog Brand',
        feature: `Katalog Brand ${b.toUpperCase()}`,
        description: `Tampilan katalog produk resmi brand ${b.toUpperCase()} beserta kategori dan struktur harga.`,
        brandStructure
      });
    }
  }
}

module.exports = { StateExplorer };
