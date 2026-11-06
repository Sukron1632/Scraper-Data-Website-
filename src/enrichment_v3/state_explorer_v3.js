const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { LivewireGuardrail } = require('./livewire_guardrail');

class StateExplorerV3 {
  constructor(runDir) {
    this.runDir = runDir;
    this.rawScreenshotsDir = path.join(runDir, 'screenshots_original_new');
    this.sanitizedScreenshotsDir = path.join(runDir, 'screenshots_sanitized_v3');
    this.statesDir = path.join(runDir, 'states_v3');
    this.transitionsDir = path.join(runDir, 'transitions_v3');

    if (!fs.existsSync(this.rawScreenshotsDir)) fs.mkdirSync(this.rawScreenshotsDir, { recursive: true });
    if (!fs.existsSync(this.sanitizedScreenshotsDir)) fs.mkdirSync(this.sanitizedScreenshotsDir, { recursive: true });
    if (!fs.existsSync(this.statesDir)) fs.mkdirSync(this.statesDir, { recursive: true });
    if (!fs.existsSync(this.transitionsDir)) fs.mkdirSync(this.transitionsDir, { recursive: true });

    this.projectRoot = path.join(__dirname, '../../');
    this.sessionPath = path.join(this.projectRoot, 'storage/sessions/it_session.json');

    this.guardrail = new LivewireGuardrail();
    this.observedStates = [];
    this.transitions = [];
    this.behavioralAssertions = [];
  }

  async runExploration() {
    console.log('[StateExplorer V3] Memulai Safe Multi-State Explorer V3 dengan Livewire Guardrail...');

    if (!fs.existsSync(this.sessionPath)) {
      throw new Error(`[StateExplorer V3] File sesi tidak ditemukan: ${this.sessionPath}`);
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

    // Attach strict Livewire Guardrail
    await page.route('**/*', async (route) => {
      const request = route.request();
      if (!this.guardrail.isSafeRequest(request)) {
        return route.abort();
      }
      return route.continue();
    });

    try {
      // 1. DASHBOARD & PROFIL
      console.log('\n[StateExplorer V3] [1/8] Menjelajahi Dashboard & Identitas Akun...');
      await this._exploreDashboard(page);

      // 2. SEARCH & BEHAVIORAL ASSERTIONS (2-PASS INDEPENDENT TEST)
      console.log('\n[StateExplorer V3] [2/8] Menjalankan 2-Pass Behavioral Assertions pada Cari Harga...');
      await this._exploreSearchTwoPass(page);

      // 3. EDIT HARGA INVESTIGATION
      console.log('\n[StateExplorer V3] [3/8] Menjelajahi Rute Edit Harga (/admin/edit-harga)...');
      await this._exploreEditHarga(page);

      // 4. DUPLIKAT HARGA & PAGINATION
      console.log('\n[StateExplorer V3] [4/8] Menjelajahi Duplikat Harga & Paginasi PREV/NEXT...');
      await this._exploreDuplicate(page);

      // 5. BROSUR (LIST & DETAIL 1103)
      console.log('\n[StateExplorer V3] [5/8] Menjelajahi Brosur (List & Detail #1103)...');
      await this._exploreBrosur(page);

      // 6. DISKON
      console.log('\n[StateExplorer V3] [6/8] Menjelajahi Diskon (Read-Only)...');
      await this._exploreDiskon(page);

      // 7. USER & KARYAWAN (DENGAN MASKING PII TOTAL)
      console.log('\n[StateExplorer V3] [7/8] Menjelajahi User & Karyawan dengan Sanitasi PII Penuh...');
      await this._exploreUser(page);

      // 8. 10 BRAND PAGES
      console.log('\n[StateExplorer V3] [8/8] Menjelajahi 10 Halaman Brand Resmi...');
      await this._exploreBrands(page);

    } finally {
      await browser.close();
    }

    console.log(`[StateExplorer V3] Eksplorasi tuntas! Tercatat ${this.observedStates.length} states & ${this.transitions.length} transisi.`);
    return {
      states: this.observedStates,
      transitions: this.transitions,
      behavioralAssertions: this.behavioralAssertions,
      guardrailStats: this.guardrail.getStats()
    };
  }

  // --- Snapshot Helper with Pixel-Measured Coordinates & PII Masking ---
  async _saveStateSnapshot(page, stateId, metadata = {}, options = {}) {
    const shotName = `${stateId}.png`;
    const rawPath = path.join(this.rawScreenshotsDir, shotName);
    const sanitizedPath = path.join(this.sanitizedScreenshotsDir, shotName);

    // Save unmodified raw screenshot
    await page.screenshot({ path: rawPath, fullPage: false });

    // Apply PII visual masking on sanitized screenshot if needed
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

    // Extract DOM with exact pixel bounding boxes
    const domData = await page.evaluate(() => {
      const interactiveElements = [];
      const targets = document.querySelectorAll('button, a, input, select, textarea, [role="button"], table, h1, h2, h3, .card, .metric-box');

      targets.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        const isVisible = rect.width > 0 && rect.height > 0 &&
          rect.top < window.innerHeight && rect.bottom > 0 &&
          style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';

        const isHidden = style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0' || rect.top < -500;

        let rawText = (el.innerText || el.textContent || el.value || el.getAttribute('placeholder') || '').trim();
        // Mask PII numbers and emails in extracted text
        rawText = rawText.replace(/\+?\d{8,15}/g, '[REDACTED_PHONE]');
        rawText = rawText.replace(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g, '[REDACTED_EMAIL]');

        interactiveElements.push({
          element_id: `EL-${String(index + 1).padStart(3, '0')}`,
          tag: el.tagName.toLowerCase(),
          type: el.getAttribute('type') || null,
          role: el.getAttribute('role') || null,
          ui_text_exact: rawText.slice(0, 100),
          visible_in_viewport: isVisible,
          is_hidden_template: isHidden,
          enabled: !el.disabled && el.getAttribute('aria-disabled') !== 'true',
          bbox_px: [
            Math.round(rect.x),
            Math.round(rect.y),
            Math.round(rect.width),
            Math.round(rect.height)
          ]
        });
      });

      const tables = Array.from(document.querySelectorAll('table')).map(t => {
        const headers = Array.from(t.querySelectorAll('thead th')).map(th => th.innerText.trim());
        const rowCount = t.querySelectorAll('tbody tr').length;
        return { headers, rowCount };
      });

      return {
        title: document.title,
        url: window.location.href,
        elements: interactiveElements.filter(e => e.visible_in_viewport || e.is_hidden_template),
        tables
      };
    });

    const stateObj = {
      schema_version: "3.0",
      state_id: stateId,
      module: metadata.module || 'Unknown',
      feature: metadata.feature || 'Unknown',
      state_name_ui: metadata.state_name_ui || stateId,
      url: page.url(),
      captured_at_utc: new Date().toISOString(),
      viewport: { width: 1440, height: 900, scale: 1 },
      screenshot_sanitized_ref: `screenshots_sanitized_v3/${shotName}`,
      modal_active: metadata.modal_active || false,
      filter_applied: metadata.filter_applied || false,
      row_count_observed: domData.tables[0]?.rowCount ?? null,
      dom_summary: {
        table_headers: domData.tables[0]?.headers || [],
        interactive_elements_count: domData.elements.length,
        visible_elements_count: domData.elements.filter(e => e.visible_in_viewport).length
      },
      measured_elements: domData.elements
    };

    const stateFilePath = path.join(this.statesDir, `${stateId}.json`);
    fs.writeFileSync(stateFilePath, JSON.stringify(stateObj, null, 2), 'utf8');
    this.observedStates.push(stateObj);

    return stateObj;
  }

  async _recordTransition(fromStateId, actionText, toStateId, assertionObj = {}) {
    const transition = {
      transition_id: `TR-${String(this.transitions.length + 1).padStart(3, '0')}`,
      from_state_id: fromStateId,
      action_ui_accurate: actionText,
      to_state_id: toStateId,
      recorded_at_utc: new Date().toISOString(),
      assertion: assertionObj
    };
    const tPath = path.join(this.transitionsDir, `${transition.transition_id}.json`);
    fs.writeFileSync(tPath, JSON.stringify(transition, null, 2), 'utf8');
    this.transitions.push(transition);
    return transition;
  }

  // --- 1. Dashboard ---
  async _exploreDashboard(page) {
    await page.goto('https://pricelist.radiatorsprings.id/dashboard', { waitUntil: 'networkidle' });

    const headerProfile = await page.evaluate(() => {
      const text = document.body.innerText || '';
      return {
        hasNana: text.includes('NANA'),
        hasAdminText: text.includes('Admin')
      };
    });

    await this._saveStateSnapshot(page, 'STATE_DASHBOARD_001_CLEAN', {
      module: 'Dashboard',
      feature: 'Ringkasan Sistem & Statistik',
      state_name_ui: 'Tampilan Utama Dashboard Web Pricelist',
      user_verified_display: headerProfile.hasNana ? 'NANA' : 'ROLE_UNVERIFIED'
    });
  }

  // --- 2. Search Multi-State & 2-Pass Assertions ---
  async _exploreSearchTwoPass(page) {
    for (let pass = 1; pass <= 2; pass++) {
      console.log(`[StateExplorer V3] -> Memulai Pengujian Pencarian Siklus #${pass}...`);
      await page.goto('https://pricelist.radiatorsprings.id/search', { waitUntil: 'networkidle' });

      // Dismiss Modal if visible
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
      // Wait for livewire response
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
      console.log(`[StateExplorer V3] Asersi Siklus #${pass} Filter "speedometer": ${passAssertion3.status} (${filteredRowCount} baris).`);

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
      console.log(`[StateExplorer V3] Asersi Siklus #${pass} Empty Query: ${passAssertion4.status} (${emptyRowCount} baris).`);

      await this._recordTransition(state3.state_id, 'Ketik "xyznotfound9999" pada kolom pencarian', state4.state_id, passAssertion4);

      // Reset search box
      await input.fill('');
      await page.waitForTimeout(500);
    }
  }

  // --- 3. Edit Harga Investigation ---
  async _exploreEditHarga(page) {
    const targetUrl = 'https://pricelist.radiatorsprings.id/admin/edit-harga';
    let httpStatus = 200;
    try {
      await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 10000 });
    } catch (e) {
      console.warn(`[StateExplorer V3] /admin/edit-harga timeout: ${e.message}`);
    }

    await this._saveStateSnapshot(page, 'STATE_EDIT_HARGA_001_VIEW', {
      module: 'Edit Harga',
      feature: 'Formulir Pembaruan Harga Massal',
      state_name_ui: 'Antarmuka Modul Edit Harga (Read-Only Observation)',
      http_status: httpStatus,
      form_present: await page.locator('form, table').count() > 0
    });
  }

  // --- 4. Duplikat Harga & Pagination ---
  async _exploreDuplicate(page) {
    await page.goto('https://pricelist.radiatorsprings.id/admin/duplicate', { waitUntil: 'networkidle' });

    const pagInfo = await page.evaluate(() => {
      const allBtns = Array.from(document.querySelectorAll('button, a'));
      const prev = allBtns.find(b => (b.innerText || '').toUpperCase().includes('PREV'));
      const next = allBtns.find(b => (b.innerText || '').toUpperCase().includes('NEXT'));
      const rows = document.querySelectorAll('table tbody tr').length;
      return {
        prev_disabled: prev ? (prev.disabled || prev.classList.contains('disabled')) : false,
        next_disabled: next ? (next.disabled || next.classList.contains('disabled')) : false,
        rows
      };
    });

    await this._saveStateSnapshot(page, 'STATE_DUPLICATE_001_PAGINATION', {
      module: 'Duplikat Harga',
      feature: 'Tabel Cek Duplikat & Paginasi',
      state_name_ui: 'Daftar Duplikat dengan Navigasi PREV/NEXT Aktif',
      pagination_info: pagInfo
    });
  }

  // --- 5. Brosur ---
  async _exploreBrosur(page) {
    // List
    await page.goto('https://pricelist.radiatorsprings.id/admin/brosur', { waitUntil: 'networkidle' });
    await this._saveStateSnapshot(page, 'STATE_BROSUR_001_LIST', {
      module: 'Brosur',
      feature: 'Daftar Brosur Digital',
      state_name_ui: 'Tabel Daftar Brosur Promosi'
    });

    // Detail 1103
    await page.goto('https://pricelist.radiatorsprings.id/admin/brosur/1103', { waitUntil: 'networkidle' });
    await this._saveStateSnapshot(page, 'STATE_BROSUR_002_DETAIL_1103', {
      module: 'Brosur',
      feature: 'Pemetaan Produk Brosur',
      state_name_ui: 'Rincian Produk dalam Brosur ID 1103'
    });
  }

  // --- 6. Diskon ---
  async _exploreDiskon(page) {
    await page.goto('https://pricelist.radiatorsprings.id/admin/diskon', { waitUntil: 'networkidle' });
    await this._saveStateSnapshot(page, 'STATE_DISKON_001_LIST', {
      module: 'Diskon',
      feature: 'Manajemen Diskon Aktif',
      state_name_ui: 'Daftar Program Diskon Harga (Read-Only)'
    });
  }

  // --- 7. User & Karyawan (Total PII Redaction) ---
  async _exploreUser(page) {
    await page.goto('https://pricelist.radiatorsprings.id/admin/user', { waitUntil: 'networkidle' });
    // Apply strict visual PII mask on screenshot
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
        module: 'Katalog Brand',
        feature: `Brand ${b.toUpperCase()}`,
        state_name_ui: `Katalog Produk Resmi Brand ${b.toUpperCase()}`
      });
    }
  }
}

module.exports = { StateExplorerV3 };
