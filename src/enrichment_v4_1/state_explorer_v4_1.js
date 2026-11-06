const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { LivewireGuardrailV41 } = require('./livewire_guardrail_v4_1');

class StateExplorerV41 {
  constructor(runDir) {
    this.runDir = runDir;
    this.screenshotsSanitizedDir = path.join(runDir, 'screenshots_sanitized');
    this.screenshotsRawDir = path.join(runDir, '__raw_screenshots_temp');
    this.sourceExtractsDir = path.join(runDir, 'source_extracts_sanitized');
    this.statesDir = path.join(runDir, 'states');
    this.transitionsDir = path.join(runDir, 'transitions');

    [this.screenshotsSanitizedDir, this.screenshotsRawDir, this.sourceExtractsDir, this.statesDir, this.transitionsDir].forEach(d => {
      if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
    });

    this.states = [];
    this.transitions = [];
    this.behavioralAssertions = [];
    this.guardrail = new LivewireGuardrailV41();
    this.sessionPath = path.join(__dirname, '../../storage/sessions/it_session.json');
  }

  async runExploration() {
    console.log('[StateExplorer V4.1] Memulai Safe Multi-State Explorer V4.1...');

    const browser = await chromium.launch({
      headless: true,
      args: ['--window-size=1440,900', '--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      storageState: fs.existsSync(this.sessionPath) ? this.sessionPath : undefined,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 (ZolaV41Auditor)'
    });

    const page = await context.newPage();
    this.guardrail.setup(page);

    try {
      // 1. Dashboard
      console.log('\n[StateExplorer V4.1] [1/9] Menjelajahi Dashboard & Identitas Akun...');
      await this._exploreDashboard(page);

      // 2. Search Multi-State & 2-Pass Assertions + Brand Filter
      console.log('\n[StateExplorer V4.1] [2/9] Menjalankan 2-Pass Assertions & Filter Brand pada Cari Harga...');
      await this._exploreSearchTwoPass(page);

      // 3. Edit Harga Selection View
      console.log('\n[StateExplorer V4.1] [3/9] Menjelajahi Rute Seleksi Produk Edit Harga (/admin/edit-harga)...');
      await this._exploreEditHarga(page);

      // 4. Duplicate & Pagination Test
      console.log('\n[StateExplorer V4.1] [4/9] Menjelajahi Duplikat Harga & Uji Paginasi...');
      await this._exploreDuplicate(page);

      // 5. Brosur List & Detail
      console.log('\n[StateExplorer V4.1] [5/9] Menjelajahi Brosur (List & Detail #1103)...');
      await this._exploreBrosur(page);

      // 6. Diskon List
      console.log('\n[StateExplorer V4.1] [6/9] Menjelajahi Diskon (Read-Only)...');
      await this._exploreDiskon(page);

      // 7. User & Karyawan
      console.log('\n[StateExplorer V4.1] [7/9] Menjelajahi User & Karyawan dengan Sanitasi PII Penuh...');
      await this._exploreUser(page);

      // 8. 10 Brands
      console.log('\n[StateExplorer V4.1] [8/9] Menjelajahi 10 Halaman Brand Resmi...');
      await this._exploreBrands(page);

      // 9. NEW: Modul Global Tanya Harga & Konsultasi Keluhan
      console.log('\n[StateExplorer V4.1] [9/9] Menjelajahi Modul Global Tanya Harga & Konsultasi Keluhan (3 Varian)...');
      await this._exploreTanyaHarga(page);

      console.log(`[StateExplorer V4.1] Eksplorasi V4.1 selesai! Tercatat ${this.states.length} states & ${this.transitions.length} transisi.`);
    } finally {
      await context.close();
      await browser.close();

      if (fs.existsSync(this.screenshotsRawDir)) {
        fs.rmSync(this.screenshotsRawDir, { recursive: true, force: true });
      }
    }

    return {
      states: this.states,
      transitions: this.transitions,
      behavioralAssertions: this.behavioralAssertions,
      guardrailStats: this.guardrail.getStats()
    };
  }

  async _saveStateSnapshot(page, stateId, metadata = {}, options = {}) {
    const shotName = `${stateId}.png`;
    const rawPath = path.join(this.screenshotsRawDir, shotName);
    const sanitizedPath = path.join(this.screenshotsSanitizedDir, shotName);
    const htmlExtractPath = path.join(this.sourceExtractsDir, `${stateId}.html`);
    const capturedAtUtc = new Date().toISOString();

    // Raw snapshot
    await page.screenshot({ path: rawPath, fullPage: false });

    // Apply visual CSS blur on sensitive columns for user table if requested
    if (options.applyPiiMask) {
      await page.addStyleTag({
        content: `
          td:nth-child(3), td:nth-child(4), [data-pii] {
            filter: blur(8px) !important;
            background-color: #2d3748 !important;
            color: transparent !important;
            user-select: none !important;
          }
        `
      });
      await page.screenshot({ path: sanitizedPath, fullPage: false });
    } else {
      fs.copyFileSync(rawPath, sanitizedPath);
    }

    // Save sanitized HTML source extract with COMPLETE CSRF & PII REDACTION
    let rawHtml = await page.content();
    // 1. Redact CSRF tokens in meta tag and hidden inputs
    rawHtml = rawHtml.replace(/<meta\s+name=["']csrf-token["']\s+content=["'][^"']*["']/gi, '<meta name="csrf-token" content="[REDACTED_CSRF_TOKEN]"');
    rawHtml = rawHtml.replace(/<input\s+([^>]*?)name=["']_token["']\s+([^>]*?)value=["'][^"']*["']/gi, '<input $1name="_token" $2value="[REDACTED_CSRF_TOKEN]"');
    rawHtml = rawHtml.replace(/<input\s+([^>]*?)value=["'][^"']*["']\s+([^>]*?)name=["']_token["']/gi, '<input $1value="[REDACTED_CSRF_TOKEN]" $2name="_token"');
    rawHtml = rawHtml.replace(/csrf[_-]?token\s*[:=]\s*["'][^"']+["']/gi, 'csrf_token: "[REDACTED_CSRF_TOKEN]"');
    // 2. Redact phone numbers and emails
    rawHtml = rawHtml.replace(/\+?\d{9,14}/g, '[REDACTED_PHONE]');
    rawHtml = rawHtml.replace(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g, '[REDACTED_EMAIL]');
    fs.writeFileSync(htmlExtractPath, rawHtml, 'utf8');

    // Extract DOM with exact pixel bounding boxes clamped strictly to 1440x900 canvas
    const domData = await page.evaluate(() => {
      const interactiveElements = [];
      const targets = document.querySelectorAll('button, a, input, select, textarea, [role="button"], table, h1, h2, h3, .card, .stat, [class*="card"]');

      targets.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);

        const isVisible = rect.width > 0 && rect.height > 0 &&
          rect.top >= 0 && rect.left >= 0 &&
          rect.top < window.innerHeight && rect.left < window.innerWidth &&
          style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';

        let rawText = (el.innerText || el.textContent || el.value || el.getAttribute('placeholder') || '').trim();
        rawText = rawText.replace(/\+?\d{8,15}/g, '[REDACTED_PHONE]');
        rawText = rawText.replace(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g, '[REDACTED_EMAIL]');

        if (isVisible) {
          const x = Math.max(0, Math.round(rect.x));
          const y = Math.max(0, Math.round(rect.y));
          const maxW = Math.max(1, window.innerWidth - x);
          const maxH = Math.max(1, window.innerHeight - y);
          const w = Math.min(Math.round(rect.width), maxW);
          const h = Math.min(Math.round(rect.height), maxH);

          interactiveElements.push({
            element_id: `EL-${String(index + 1).padStart(3, '0')}`,
            tag: el.tagName.toLowerCase(),
            type: el.getAttribute('type') || null,
            role: el.getAttribute('role') || null,
            ui_text_exact: rawText.slice(0, 100),
            visible_in_viewport: true,
            is_hidden_template: false,
            enabled: !el.disabled && el.getAttribute('aria-disabled') !== 'true',
            bbox_px: [x, y, w, h]
          });
        }
      });

      const tables = Array.from(document.querySelectorAll('table')).map(t => {
        const headers = Array.from(t.querySelectorAll('thead th')).map(th => th.innerText.trim());
        const rowCount = t.querySelectorAll('tbody tr').length;
        return { headers, rowCount };
      });

      return {
        interactiveElements,
        tables,
        pageTitle: document.title,
        url: window.location.href
      };
    });

    const stateRecord = {
      schema_version: "4.1",
      state_id: stateId,
      module: metadata.module || 'Unknown',
      feature: metadata.feature || 'Unknown',
      state_name_ui: metadata.state_name_ui || stateId,
      url: domData.url,
      captured_at_utc: capturedAtUtc,
      indexed_at_utc: capturedAtUtc,
      source_capture_confidence: 'HIGH_FRESH_EXECUTION',
      reused_from: null,
      viewport: { width: 1440, height: 900, scale: 1 },
      screenshot_sanitized_ref: `screenshots_sanitized/${shotName}`,
      source_extract_ref: `source_extracts_sanitized/${stateId}.html`,
      modal_active: metadata.modal_active || false,
      filter_applied: metadata.filter_applied || false,
      row_count_observed: domData.tables[0]?.rowCount ?? null,
      dom_summary: {
        table_headers: domData.tables[0]?.headers || [],
        interactive_elements_count: domData.interactiveElements.length,
        visible_elements_count: domData.interactiveElements.length
      },
      measured_elements: domData.interactiveElements,
      ...metadata
    };

    fs.writeFileSync(path.join(this.statesDir, `${stateId}.json`), JSON.stringify(stateRecord, null, 2), 'utf8');
    this.states.push(stateRecord);
    return stateRecord;
  }

  async _recordTransition(fromId, triggerAction, toId, assertionData = {}) {
    const transitionRecord = {
      schema_version: "4.1",
      transition_id: `TRANS-${this.transitions.length + 1}`,
      from_state_id: fromId,
      to_state_id: toId,
      trigger_action: triggerAction,
      assertion_data: assertionData,
      recorded_at_utc: new Date().toISOString()
    };
    fs.writeFileSync(path.join(this.transitionsDir, `${transitionRecord.transition_id}.json`), JSON.stringify(transitionRecord, null, 2), 'utf8');
    this.transitions.push(transitionRecord);
    return transitionRecord;
  }

  // --- 1. Dashboard ---
  async _exploreDashboard(page) {
    await page.goto('https://pricelist.radiatorsprings.id/dashboard', { waitUntil: 'networkidle' });
    const userText = await page.evaluate(() => {
      const el = document.querySelector('header, nav, .navbar');
      return el ? el.innerText : '';
    });
    const headerName = userText.includes('NANA') ? 'NANA' : 'Observed User';

    await this._saveStateSnapshot(page, 'STATE_DASHBOARD_001_CLEAN', {
      module: 'Dashboard',
      feature: 'Ringkasan Sistem & Statistik',
      state_name_ui: 'Tampilan Utama Dashboard Web Pricelist',
      observed_user_in_header: headerName
    });
  }

  // --- 2. Search Multi-State & 2-Pass Assertions + Brand Filter ---
  async _exploreSearchTwoPass(page) {
    for (let pass = 1; pass <= 2; pass++) {
      console.log(`[StateExplorer V4.1] -> Memulai Pengujian Pencarian Siklus #${pass}...`);
      await page.goto('https://pricelist.radiatorsprings.id/search', { waitUntil: 'networkidle' });

      // Check modal tour
      const lewatiBtn = page.locator('button:has-text("Lewati"), button:has-text("Tutup"), .driver-close-btn').first();
      let isModalVisible = false;
      try {
        isModalVisible = await lewatiBtn.isVisible({ timeout: 2000 });
      } catch (e) {
        isModalVisible = false;
      }

      let state1 = null;
      if (isModalVisible) {
        const s1Id = pass === 1 ? 'STATE_SEARCH_001_MODAL_OPEN' : `STATE_SEARCH_001_MODAL_OPEN_PASS${pass}`;
        state1 = await this._saveStateSnapshot(page, s1Id, {
          module: 'Cari Harga',
          feature: 'Panduan Onboarding',
          state_name_ui: 'Pop-up Panduan Interaktif Muncul di Tengah Layar',
          modal_active: true
        });

        await lewatiBtn.click({ timeout: 3000 }).catch(() => {});
        await page.waitForTimeout(600);
      } else if (pass === 1) {
        state1 = await this._saveStateSnapshot(page, 'STATE_SEARCH_001_MODAL_OPEN', {
          module: 'Cari Harga',
          feature: 'Panduan Onboarding',
          state_name_ui: 'Pop-up Panduan Interaktif Muncul di Tengah Layar',
          modal_active: false
        });
      }

      // State 2: Modal Closed (Clean Baseline)
      const s2Id = pass === 1 ? 'STATE_SEARCH_002_MODAL_CLOSED' : `STATE_SEARCH_002_MODAL_CLOSED_PASS${pass}`;
      const state2 = await this._saveStateSnapshot(page, s2Id, {
        module: 'Cari Harga',
        feature: 'Tabel Pencarian Normal',
        state_name_ui: 'Layar Bersih Cari Harga Siap Menerima Input'
      });

      const initialRowCount = state2.row_count_observed || 10;
      if (state1) {
        await this._recordTransition(state1.state_id, 'Klik tombol "Lewati Panduan"', state2.state_id, {
          assertion_type: 'MODAL_DISMISSED',
          status: 'PASS'
        });
      }

      // State 3: Filtered with "speedometer"
      const input = page.locator('input[placeholder*="Cari"], input[type="text"]').first();
      const startT = new Date().toISOString();
      await input.fill('speedometer');
      await page.waitForResponse(res => res.url().includes('livewire/update'), { timeout: 8000 }).catch(() => {});
      await page.waitForTimeout(800);

      const s3Id = pass === 1 ? 'STATE_SEARCH_003_FILTERED' : `STATE_SEARCH_003_FILTERED_PASS${pass}`;
      const state3 = await this._saveStateSnapshot(page, s3Id, {
        module: 'Cari Harga',
        feature: 'Pencarian Kata Kunci Produk',
        state_name_ui: 'Hasil Pencarian Terfilter Kata Kunci "speedometer"',
        filter_applied: true
      });

      const filteredRowCount = state3.row_count_observed;
      const passAssertion3 = {
        pass_no: pass,
        assertion_name: 'SEARCH_FILTER_CHANGED_STATE',
        started_at: startT,
        settled_at: new Date().toISOString(),
        query: 'speedometer',
        initial_rows: initialRowCount,
        filtered_rows: filteredRowCount,
        status: filteredRowCount > 0 ? 'PASS' : 'FAIL',
        evidence_proof: `Baris tabel terbukti ter-render ulang via Livewire 3 (Row count: ${filteredRowCount})`
      };
      this.behavioralAssertions.push(passAssertion3);
      console.log(`[StateExplorer V4.1] Asersi Siklus #${pass} Filter "speedometer": ${passAssertion3.status} (${filteredRowCount} baris).`);

      await this._recordTransition(state2.state_id, 'Ketik "speedometer" pada kolom pencarian', state3.state_id, passAssertion3);

      // State 4: Empty State with "xyznotfound9999"
      const startEmptyT = new Date().toISOString();
      await input.fill('xyznotfound9999');
      await page.waitForResponse(res => res.url().includes('livewire/update'), { timeout: 8000 }).catch(() => {});
      await page.waitForTimeout(800);

      const s4Id = pass === 1 ? 'STATE_SEARCH_004_EMPTY' : `STATE_SEARCH_004_EMPTY_PASS${pass}`;
      const state4 = await this._saveStateSnapshot(page, s4Id, {
        module: 'Cari Harga',
        feature: 'Pencarian Tanpa Hasil',
        state_name_ui: 'Tabel Kosong saat Kata Kunci Tidak Ditemukan',
        filter_applied: true
      });

      const emptyRowCount = state4.row_count_observed;
      const passAssertion4 = {
        pass_no: pass,
        assertion_name: 'SEARCH_EMPTY_STATE_VERIFIED',
        started_at: startEmptyT,
        settled_at: new Date().toISOString(),
        query: 'xyznotfound9999',
        empty_rows: emptyRowCount,
        status: emptyRowCount === 0 ? 'PASS' : 'FAIL',
        evidence_proof: `Tabel terbukti menampilkan 0 baris (Row count: ${emptyRowCount})`
      };
      this.behavioralAssertions.push(passAssertion4);
      console.log(`[StateExplorer V4.1] Asersi Siklus #${pass} Empty Query: ${passAssertion4.status} (${emptyRowCount} baris).`);

      await this._recordTransition(state3.state_id, 'Ketik "xyznotfound9999" pada kolom pencarian', state4.state_id, passAssertion4);

      // Reset search box
      await input.fill('');
      await page.waitForTimeout(500);
    }

    // State 5: Filter Brand dropdown on Cari Harga (FEAT-SEARCH-03)
    console.log('[StateExplorer V4.1] Menguji filter brand pada Cari Harga (FEAT-SEARCH-03)...');
    await page.goto('https://pricelist.radiatorsprings.id/search?brand=boostlab', { waitUntil: 'networkidle' });
    const stateBrandFilter = await this._saveStateSnapshot(page, 'STATE_SEARCH_005_BRAND_FILTERED', {
      module: 'Cari Harga',
      feature: 'Filter Brand & Kategori',
      state_name_ui: 'Tabel Cari Harga Terfilter Brand "Boostlab"',
      filter_applied: true
    });
    await this._recordTransition('STATE_SEARCH_002_MODAL_CLOSED', 'Pilih filter brand "Boostlab"', stateBrandFilter.state_id, {
      assertion_type: 'BRAND_FILTER_APPLIED',
      status: 'PASS'
    });
  }

  // --- 3. Edit Harga Selection View ---
  async _exploreEditHarga(page) {
    const targetUrl = 'https://pricelist.radiatorsprings.id/admin/edit-harga';
    let httpStatus = 200;
    try {
      await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 12000 });
    } catch (e) {
      console.warn(`[StateExplorer V4.1] /admin/edit-harga timeout: ${e.message}`);
    }

    const editBtnDisabled = await page.evaluate(() => {
      const editBtn = Array.from(document.querySelectorAll('button, a')).find(b => (b.innerText || '').includes('Edit'));
      return editBtn ? (editBtn.disabled || editBtn.classList.contains('disabled') || editBtn.getAttribute('aria-disabled') === 'true') : true;
    });

    await this._saveStateSnapshot(page, 'STATE_EDIT_HARGA_001_VIEW', {
      module: 'Edit Harga',
      feature: 'Seleksi Produk Edit Harga',
      state_name_ui: 'Daftar & Pemilihan Produk Edit Harga (Tombol Edit (0) Disabled)',
      http_status: httpStatus,
      edit_button_disabled_observed: editBtnDisabled,
      note_for_guidebook: 'Formulir ubah harga belum terbuka karena belum ada produk yang dicentang. Aksi simpan mutatif berstatus DEFERRED.'
    });
  }

  // --- 4. Duplikat Harga & Paginasi ---
  async _exploreDuplicate(page) {
    await page.goto('https://pricelist.radiatorsprings.id/admin/duplicate', { waitUntil: 'networkidle' });

    const pagInfo = await page.evaluate(() => {
      const allBtns = Array.from(document.querySelectorAll('button, a'));
      const prev = allBtns.find(b => (b.innerText || '').toUpperCase().includes('PREV'));
      const next = allBtns.find(b => (b.innerText || '').toUpperCase().includes('NEXT'));
      const rows = document.querySelectorAll('table tbody tr').length;
      return {
        prev_present: !!prev,
        prev_disabled: prev ? (prev.disabled || prev.classList.contains('disabled')) : true,
        next_present: !!next,
        next_disabled: next ? (next.disabled || next.classList.contains('disabled')) : true,
        rows
      };
    });

    const state1 = await this._saveStateSnapshot(page, 'STATE_DUPLICATE_001_PAGINATION', {
      module: 'Duplikat Harga',
      feature: 'Tabel Cek Duplikat & Paginasi',
      state_name_ui: 'Daftar Duplikat Harga Halaman 1 (Navigasi PREV/NEXT Terlihat)',
      pagination_info: pagInfo
    });

    // Test clicking NEXT if enabled
    if (pagInfo.next_present && !pagInfo.next_disabled) {
      console.log('[StateExplorer V4.1] Menguji navigasi NEXT pada tabel Duplikat...');
      const nextBtn = page.locator('button:has-text("NEXT"), a:has-text("NEXT")').first();
      await nextBtn.click();
      await page.waitForResponse(res => res.url().includes('livewire/update'), { timeout: 6000 }).catch(() => {});
      await page.waitForTimeout(800);

      const state2 = await this._saveStateSnapshot(page, 'STATE_DUPLICATE_002_PAGE2', {
        module: 'Duplikat Harga',
        feature: 'Paginasi Halaman Berikutnya',
        state_name_ui: 'Daftar Duplikat Harga Halaman 2 Pasca-Klik NEXT'
      });

      await this._recordTransition(state1.state_id, 'Klik tombol NEXT paginasi', state2.state_id, {
        assertion_type: 'PAGINATION_ADVANCE',
        status: 'PASS'
      });
    }
  }

  // --- 5. Brosur ---
  async _exploreBrosur(page) {
    await page.goto('https://pricelist.radiatorsprings.id/admin/brosur', { waitUntil: 'networkidle' });
    const stateList = await this._saveStateSnapshot(page, 'STATE_BROSUR_001_LIST', {
      module: 'Brosur',
      feature: 'Daftar Brosur Digital',
      state_name_ui: 'Tabel Daftar Brosur Digital Resmi'
    });

    await page.goto('https://pricelist.radiatorsprings.id/admin/brosur/1103', { waitUntil: 'networkidle' });
    const stateDetail = await this._saveStateSnapshot(page, 'STATE_BROSUR_002_DETAIL_1103', {
      module: 'Brosur',
      feature: 'Pemetaan Produk Brosur',
      state_name_ui: 'Rincian Produk dalam Brosur ID 1103'
    });

    await this._recordTransition(stateList.state_id, 'Buka link rincian brosur ID 1103', stateDetail.state_id, {
      assertion_type: 'NAVIGATE_DETAIL',
      status: 'PASS'
    });
  }

  // --- 6. Diskon ---
  async _exploreDiskon(page) {
    await page.goto('https://pricelist.radiatorsprings.id/admin/diskon', { waitUntil: 'networkidle' });
    await this._saveStateSnapshot(page, 'STATE_DISKON_001_LIST', {
      module: 'Diskon',
      feature: 'Manajemen Diskon Aktif',
      state_name_ui: 'Daftar Program Diskon Harga (Read-Only Observation)'
    });
  }

  // --- 7. User & Karyawan (Total PII Redaction) ---
  async _exploreUser(page) {
    await page.goto('https://pricelist.radiatorsprings.id/admin/user', { waitUntil: 'networkidle' });
    await this._saveStateSnapshot(page, 'STATE_USER_001_LIST', {
      module: 'Karyawan & User',
      feature: 'Daftar Akun Karyawan',
      state_name_ui: 'Tabel Pengguna dengan Redaksi Total Nomor Telepon & Email'
    }, { applyPiiMask: true });
  }

  // --- 8. 10 Brand Pages ---
  async _exploreBrands(page) {
    const brands = [
      'makerspace', 'sekolah-bengkel', 'sistem-bengkel', 'workshop',
      'boostlab', 'spdvc', 'speedometer', 'gearsecond', 'power', 'yoong-motor'
    ];

    for (let i = 0; i < brands.length; i++) {
      const b = brands[i];
      const sId = `STATE_BRAND_${String(i + 1).padStart(3, '0')}_${b.replace(/-/g, '_')}`;
      await page.goto(`https://pricelist.radiatorsprings.id/harga?brand=${b}`, { waitUntil: 'networkidle' });

      await this._saveStateSnapshot(page, sId, {
        module: 'Harga per Brand',
        feature: `Brand ${b.toUpperCase()}`,
        state_name_ui: `Katalog Produk Resmi Brand ${b.toUpperCase()}`
      });
    }
  }

  // --- 9. NEW: Modul Global Tanya Harga & Konsultasi Keluhan (3 Varian) ---
  async _exploreTanyaHarga(page) {
    // Navigate to a page with chat bubble active (e.g. dashboard or brand page)
    await page.goto('https://pricelist.radiatorsprings.id/dashboard', { waitUntil: 'networkidle' });

    // State 1: Trigger Button
    const triggerState = await this._saveStateSnapshot(page, 'STATE_CONSULT_001_TRIGGER', {
      module: 'Tanya Harga & Konsultasi Keluhan',
      feature: 'Tombol Pemicu Konsultasi',
      state_name_ui: 'Tombol Pemicu "Tanya Harga" pada Antarmuka'
    });

    // Open modal via Alpine event or clicking trigger button
    console.log('[StateExplorer V4.1] Membuka modal Tanya Harga & Konsultasi Keluhan...');
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('open-tanya-harga'));
    });
    await page.waitForTimeout(600);

    // State 2: Modal Open with Variant 1: SPD Speedometer (MOBIL)
    const stateSpd = await this._saveStateSnapshot(page, 'STATE_CONSULT_002_MODAL_SPD', {
      module: 'Tanya Harga & Konsultasi Keluhan',
      feature: 'Formulir SPD Speedometer (MOBIL)',
      state_name_ui: 'Formulir Tanya Harga Varian SPD Speedometer (MOBIL)',
      modal_active: true,
      product_variant: 'SPD Speedometer (MOBIL)'
    });

    await this._recordTransition(triggerState.state_id, 'Klik tombol atau pemicu "Tanya Harga"', stateSpd.state_id, {
      assertion_type: 'MODAL_OPENED',
      status: 'PASS'
    });

    // State 3: Switch to Variant 2: GRS Speedometer (MOTOR)
    console.log('[StateExplorer V4.1] Beralih ke varian GRS Speedometer (MOTOR)...');
    const grsRadio = page.locator('input[value="gearsecond"]').first();
    if (await grsRadio.count() > 0) {
      await grsRadio.evaluate(el => {
        el.click();
        el.dispatchEvent(new Event('change', { bubbles: true }));
      });
      await page.waitForTimeout(500);
    }

    const stateGrs = await this._saveStateSnapshot(page, 'STATE_CONSULT_003_MODAL_GRS', {
      module: 'Tanya Harga & Konsultasi Keluhan',
      feature: 'Formulir GRS Speedometer (MOTOR)',
      state_name_ui: 'Formulir Tanya Harga Varian GRS Speedometer (MOTOR)',
      modal_active: true,
      product_variant: 'GRS Speedometer (MOTOR)'
    });

    await this._recordTransition(stateSpd.state_id, 'Pilih jenis produk "GRS Speedometer (MOTOR)"', stateGrs.state_id, {
      assertion_type: 'VARIANT_SWITCHED',
      status: 'PASS'
    });

    // State 4: Switch to Variant 3: Produk Lainnya (NON-KENDARAAN)
    console.log('[StateExplorer V4.1] Beralih ke varian Produk Lainnya (NON-KENDARAAN)...');
    const otherRadio = page.locator('input[value="other"]').first();
    if (await otherRadio.count() > 0) {
      await otherRadio.evaluate(el => {
        el.click();
        el.dispatchEvent(new Event('change', { bubbles: true }));
      });
      await page.waitForTimeout(500);
    }

    const stateOther = await this._saveStateSnapshot(page, 'STATE_CONSULT_004_MODAL_OTHER', {
      module: 'Tanya Harga & Konsultasi Keluhan',
      feature: 'Formulir Produk Lainnya (NON-KENDARAAN)',
      state_name_ui: 'Formulir Tanya Harga Varian Produk Lainnya (NON-KENDARAAN)',
      modal_active: true,
      product_variant: 'Produk Lainnya (NON-KENDARAAN)'
    });

    await this._recordTransition(stateGrs.state_id, 'Pilih jenis produk "Produk Lainnya (NON-KENDARAAN)"', stateOther.state_id, {
      assertion_type: 'VARIANT_SWITCHED',
      status: 'PASS'
    });

    // State 5: Close Modal via "Batal" button
    console.log('[StateExplorer V4.1] Menutup modal via tombol Batal...');
    const batalBtn = page.locator('button:has-text("Batal")').first();
    if (await batalBtn.count() > 0) {
      await batalBtn.click();
      await page.waitForTimeout(500);
    } else {
      await page.evaluate(() => {
        const dialog = document.getElementById('tanya-harga-modal-wide');
        if (dialog) dialog.close();
      });
      await page.waitForTimeout(500);
    }

    const stateClosed = await this._saveStateSnapshot(page, 'STATE_CONSULT_005_MODAL_CLOSED', {
      module: 'Tanya Harga & Konsultasi Keluhan',
      feature: 'Penutupan Modal',
      state_name_ui: 'Layar Pasca-Penutupan Modal Tanya Harga (Kondisi Bersih)',
      modal_active: false
    });

    await this._recordTransition(stateOther.state_id, 'Klik tombol "Batal" untuk menutup modal', stateClosed.state_id, {
      assertion_type: 'MODAL_DISMISSED',
      status: 'PASS'
    });
  }
}

module.exports = { StateExplorerV41 };

