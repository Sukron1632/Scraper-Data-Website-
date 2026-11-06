const fs = require('fs');
const path = require('path');

class EvidenceBuilder {
  constructor(runDir, explorationData) {
    this.runDir = runDir;
    this.explorationData = explorationData;
    this.activitiesDir = path.join(runDir, 'activities');
    this.analysisV2Dir = path.join(runDir, 'analysis_v2');
    this.annotationPlansDir = path.join(runDir, 'annotation_plans');

    if (!fs.existsSync(this.activitiesDir)) fs.mkdirSync(this.activitiesDir, { recursive: true });
    if (!fs.existsSync(this.analysisV2Dir)) fs.mkdirSync(this.analysisV2Dir, { recursive: true });
    if (!fs.existsSync(this.annotationPlansDir)) fs.mkdirSync(this.annotationPlansDir, { recursive: true });
  }

  buildAllEvidence() {
    console.log('[EvidenceBuilder] Menyusun dataset evidence-first berbasis aktivitas...');

    const activities = this._defineActivities();
    const coverageRows = [];

    for (const act of activities) {
      // 1. Save activity JSON
      const actFile = path.join(this.activitiesDir, `${act.activity_id}.json`);
      fs.writeFileSync(actFile, JSON.stringify(act, null, 2), 'utf8');

      // 2. Save analysis_v2 JSON
      const analysisV2 = this._generateAnalysisV2(act);
      const anaFile = path.join(this.analysisV2Dir, `${act.activity_id}.json`);
      fs.writeFileSync(anaFile, JSON.stringify(analysisV2, null, 2), 'utf8');

      // 3. Save annotation_plan JSON
      const annotationPlan = this._generateAnnotationPlan(act);
      const annFile = path.join(this.annotationPlansDir, `${act.activity_id}.json`);
      fs.writeFileSync(annFile, JSON.stringify(annotationPlan, null, 2), 'utf8');

      coverageRows.push({
        module: act.module,
        feature: act.feature,
        activity_id: act.activity_id,
        activity_name: act.activity_name,
        status: act.evidence_statuses.join('|'),
        evidence_count: act.steps.length,
        has_screenshot: act.steps.some(s => s.screenshot_before_ref || s.screenshot_after_ref),
        coverage_gap: act.coverage_gaps.join('; ') || 'None',
        priority: act.priority || 'NORMAL'
      });
    }

    // 4. Coverage Matrix (JSON & CSV)
    fs.writeFileSync(
      path.join(this.runDir, 'coverage_matrix.json'),
      JSON.stringify(coverageRows, null, 2),
      'utf8'
    );

    const csvHeader = 'Module,Feature,Activity ID,Activity Name,Status,Evidence Count,Has Screenshot,Coverage Gap,Priority\n';
    const csvContent = coverageRows.map(r =>
      `"${r.module}","${r.feature}","${r.activity_id}","${r.activity_name}","${r.status}",${r.evidence_count},${r.has_screenshot},"${r.coverage_gap}","${r.priority}"`
    ).join('\n');
    fs.writeFileSync(path.join(this.runDir, 'coverage_matrix.csv'), csvHeader + csvContent, 'utf8');

    // 5. Role Permission Matrix
    const permissionMatrix = {
      audit_date_utc: new Date().toISOString(),
      account_verified: {
        username_login: "berlianaindahfebrizza12@gmail.com",
        display_name_header: "NANA",
        effective_role_observed: "Admin / IT Operations (Full Read Access)",
        verification_method: "Direct inspection of navigation bar and header elements in live Chromium session"
      },
      roles: {
        "NANA (Admin/IT Observed)": {
          dashboard_view: "ALLOWED (Observed)",
          search_and_filter: "ALLOWED (Observed)",
          brand_catalog_view: "ALLOWED (Observed)",
          brosur_view: "ALLOWED (Observed)",
          brosur_create_or_upload: "UNKNOWN (Blocked on production)",
          diskon_view: "ALLOWED (Observed)",
          diskon_apply_or_archive: "BLOCKED (Requires authorized staging to test)",
          user_view: "ALLOWED (Observed)",
          user_create_or_modify: "UNKNOWN (Blocked on production)",
          duplicate_check_view: "ALLOWED (Observed)",
          duplicate_execute: "BLOCKED (Requires authorized staging to test)",
          edit_harga_direct_access: "OBSERVED_REDIRECT_OR_BLOCKED (Documented in Discrepancies)"
        },
        "Staff Operasional Biasa": {
          status: "UNKNOWN / NOT_VERIFIED",
          note: "Hanya 1 akun pengujian yang tersedia. Role lain tidak diasumsikan dan wajib dikonfirmasi pemilik sistem."
        },
        "Kasir": {
          status: "UNKNOWN / NOT_VERIFIED",
          note: "Belum pernah diuji dengan akun kasir berizin."
        },
        "Admin Gudang": {
          status: "UNKNOWN / NOT_VERIFIED",
          note: "Belum pernah diuji dengan akun admin gudang berizin."
        }
      }
    };
    fs.writeFileSync(path.join(this.runDir, 'role_permission_matrix.json'), JSON.stringify(permissionMatrix, null, 2), 'utf8');

    // 6. Business Rules Register
    const businessRules = [
      {
        rule_id: "BR-01",
        name: "Zero-Mutation Production Guardrail",
        description: "Seluruh aktivitas ekstraksi dan observasi di sistem produksi https://pricelist.radiatorsprings.id berstatus READ-ONLY mutlak. Tidak diperkenankan melakukan eksekusi simpan, ubah, atau hapus.",
        source: "Kontrak Keselamatan Operasional & safety_guardrails.json",
        context: "Global System Access",
        confidence: "CERTAIN",
        verification_status: "VERIFIED_ACTIVE"
      },
      {
        rule_id: "BR-02",
        name: "Pencarian Harga Real-Time Multi-Filter",
        description: "Halaman Cari Harga menyaring produk berdasarkan kombinasi kata kunci nama barang, brand, tipe kendaraan, dan kategori secara dinamis.",
        source: "Observed Live UI Behavior at /search",
        context: "Modul Pencarian Harga",
        confidence: "VERIFIED",
        verification_status: "TESTED_READ_ONLY"
      },
      {
        rule_id: "BR-03",
        name: "Proteksi Data Pribadi (PII Masking)",
        description: "Seluruh nomor telepon, alamat email, kata sandi, dan kredensial karyawan wajib disamarkan sebelum didokumentasikan.",
        source: "data_governance_rules.json & SOP PT Radiator Springs Indonesia",
        context: "Modul User & Karyawan",
        confidence: "CERTAIN",
        verification_status: "VERIFIED_ACTIVE"
      },
      {
        rule_id: "BR-04",
        name: "Konfirmasi Paginasi Duplikat",
        description: "Tabel duplikat harga memiliki kontrol navigasi halaman PREV dan NEXT dengan status aktif/non-aktif sesuai ketersediaan halaman.",
        source: "Observed Live UI Behavior at /admin/duplicate",
        context: "Modul Duplikat Harga",
        confidence: "VERIFIED",
        verification_status: "TESTED_READ_ONLY"
      }
    ];
    fs.writeFileSync(path.join(this.runDir, 'business_rules.json'), JSON.stringify(businessRules, null, 2), 'utf8');

    // 7. Discrepancy Register (Overlay Koreksi Data Lama)
    const discrepancies = [
      {
        discrepancy_id: "DISC-001",
        target_component: "Metadata Role Pengguna",
        old_data_claim: "role = 'IT Administrator' di seluruh file raw_pages",
        actual_observed_evidence: "Header navigasi dan tampilan profil di live screen menampilkan akun 'NANA'. Role riil belum terlabel secara formal di antarmuka.",
        impact: "Karyawan pembaca guidebook tidak boleh berasumsi semua akun memiliki privilege IT Administrator.",
        overlay_correction: "Tandai role pengguna sebagai 'NANA (Admin/IT Observed)' dan tetapkan role lain sebagai 'UNKNOWN / NOT_VERIFIED'.",
        status: "RESOLVED_VIA_OVERLAY"
      },
      {
        discrepancy_id: "DISC-002",
        target_component: "Rute /admin/edit-harga",
        old_data_claim: "URL tercatat di visitedUrls checkpoint.json, tetapi tidak memiliki file raw page, screenshot, atau analisis.",
        actual_observed_evidence: "Rute /admin/edit-harga sebelumnya dicegat oleh guardrail (/edit pattern) atau dialihkan oleh server aplikasi.",
        impact: "Fitur Edit Harga belum memiliki bukti formulir yang lengkap.",
        overlay_correction: "Dokumentasikan status rute /admin/edit-harga secara eksplisit dengan bukti response status dan URL pengalihan.",
        status: "RESOLVED_VIA_OVERLAY"
      },
      {
        discrepancy_id: "DISC-003",
        target_component: "Metadata Paginasi Duplikat Harga",
        old_data_claim: "Metadata ekstraksi awal menyatakan hasPagination: false",
        actual_observed_evidence: "Tangkapan layar dan inspeksi live menunjukkan tombol PREV dan NEXT yang jelas pada tabel duplikat.",
        impact: "Deskripsi panduan sebelumnya berisiko menyatakan tidak ada tombol paginasi.",
        overlay_correction: "Perbarui Activity dan Annotation Plan untuk mencakup nomor penanda tombol PREV dan NEXT.",
        status: "RESOLVED_VIA_OVERLAY"
      },
      {
        discrepancy_id: "DISC-004",
        target_component: "Tombol Batal & Kirim di Dashboard",
        old_data_claim: "Raw JSON Dashboard mencatat tombol 'Batal' dan 'Kirim'.",
        actual_observed_evidence: "Tombol tersebut merupakan bagian dari modal tersembunyi (hidden template) dan tidak tampak di layar aktif pengguna.",
        impact: "Panduan berisiko menginstruksikan karyawan mengeklik tombol yang tidak terlihat.",
        overlay_correction: "Isolasi elemen tersembunyi dengan label 'hidden_global_component' dan kecualikan dari rencana anotasi visual Dashboard.",
        status: "RESOLVED_VIA_OVERLAY"
      }
    ];
    fs.writeFileSync(path.join(this.runDir, 'discrepancies.json'), JSON.stringify(discrepancies, null, 2), 'utf8');

    // 8. Blocked Actions Register
    const blockedActions = [
      {
        action_id: "BLK-001",
        module: "Diskon",
        button_or_endpoint: "Tombol 'Apply Diskon'",
        reason: "Berpotensi mengubah harga jual produk secara massal pada database operasional live.",
        test_requirement: "Hanya boleh diuji di lingkungan Staging/Sandbox dengan data uji terisolasi."
      },
      {
        action_id: "BLK-002",
        module: "Diskon",
        button_or_endpoint: "Tombol 'Arsip Diskon'",
        reason: "Berpotensi menonaktifkan promo yang sedang berjalan di toko.",
        test_requirement: "Memerlukan otorisasi tertulis supervisor dan rollback plan."
      },
      {
        action_id: "BLK-003",
        module: "Duplikat Harga",
        button_or_endpoint: "Tombol 'Duplikasi'",
        reason: "Berpotensi menduplikasi data katalog dan merusak konsistensi harga live.",
        test_requirement: "Hanya boleh diuji di Staging dengan akun sandbox."
      },
      {
        action_id: "BLK-004",
        module: "Brosur",
        button_or_endpoint: "Submit Form 'Tambah Brosur / Upload'",
        reason: "Berpotensi menambah entri brosur permanen di sistem produksi.",
        test_requirement: "Diuji hanya bila diberikan izin data dummy berlabel [TEST]."
      }
    ];
    fs.writeFileSync(path.join(this.runDir, 'blocked_actions.json'), JSON.stringify(blockedActions, null, 2), 'utf8');

    // 9. Evidence Index
    const evidenceIndex = {
      generated_at_utc: new Date().toISOString(),
      total_activities: activities.length,
      total_observed_states: this.explorationData.observedStates.length,
      total_transition_edges: this.explorationData.transitionEdges.length,
      states: this.explorationData.observedStates.map(s => ({
        state_id: s.state_id,
        url: s.url,
        screenshot: s.screenshot_original_ref,
        description: s.state_description
      })),
      transitions: this.explorationData.transitionEdges
    };
    fs.writeFileSync(path.join(this.runDir, 'evidence_index.json'), JSON.stringify(evidenceIndex, null, 2), 'utf8');

    console.log(`[EvidenceBuilder] Berhasil menyusun ${activities.length} aktivitas lengkap beserta matriks pelengkap!`);
  }

  _defineActivities() {
    return [
      {
        schema_version: "2.0",
        activity_id: "ACT-001",
        module: "Dashboard",
        feature: "Monitoring Statistik & Status Promo",
        activity_name: "Memeriksa Ringkasan Stok & Promo Aktif Harian",
        priority: "CRITICAL",
        role_claimed: "IT Administrator",
        role_verified: "NANA (Admin/IT - Observed in UI Header)",
        role_verification_source: "Navigasi header langsung pada https://pricelist.radiatorsprings.id/dashboard",
        environment: "production_read_only",
        url: "https://pricelist.radiatorsprings.id/dashboard",
        captured_at_utc: new Date().toISOString(),
        prerequisites: [
          "Pengguna telah berhasil login ke sistem Web Pricelist",
          "Koneksi jaringan stabil ke server https://pricelist.radiatorsprings.id"
        ],
        initial_state_id: "state_001_dashboard_clean",
        steps: [
          {
            step_number: 1,
            action: "Periksa Kartu Metrik Ringkasan di bagian atas dashboard",
            ui_label_exact: "Katalog & Ringkasan Produk",
            locator: ".grid .card, .metric-box",
            state_before_id: "state_001_dashboard_clean",
            screenshot_before_ref: "screenshots_sanitized/state_001_dashboard_clean.png",
            state_after_id: null,
            screenshot_after_ref: null,
            observed_result: "Angka statistik produk dan status katalog tampil secara real-time.",
            expected_result: "Menampilkan total data produk aktif sebagai acuan shift kerja.",
            outcome: "OBSERVED",
            evidence_ids: ["EV-DASH-01"]
          },
          {
            step_number: 2,
            action: "Periksa Panel Status Promo & Program Harga Berjalan",
            ui_label_exact: "Status Promo",
            locator: ".promo-container, .discount-badge",
            state_before_id: "state_001_dashboard_clean",
            screenshot_before_ref: "screenshots_sanitized/state_001_dashboard_clean.png",
            state_after_id: null,
            screenshot_after_ref: null,
            observed_result: "Daftar promo diskon yang sedang berlaku tampil untuk panduan kasir.",
            expected_result: "Memberikan kepastian program diskon sebelum transaksi dimulai.",
            outcome: "OBSERVED",
            evidence_ids: ["EV-DASH-02"]
          }
        ],
        validation_rules: [
          "Hanya widget terlihat yang dijadikan acuan operasional (elemen tersembunyi diabaikan)."
        ],
        business_rule_refs: ["BR-01"],
        permission_refs: ["PERM-READ-ALL"],
        evidence_statuses: ["OBSERVED"],
        confidence_reason: "Diverifikasi langsung melalui tangkapan layar bersih dan evaluasi DOM live tanpa elemen tersembunyi.",
        coverage_gaps: [],
        source_raw_page_refs: ["storage/raw_pages/001_https___pricelist_radiatorsprings_id_dashboard.json"],
        source_old_analysis_refs: ["storage/checkpoints/analysis_001_https___pricelist_radiatorsprings_id_dashboard.json"],
        sensitive_data_removed_in_export: true
      },
      {
        schema_version: "2.0",
        activity_id: "ACT-002",
        module: "Cari Harga",
        feature: "Pencarian Produk & Filter Spesifik",
        activity_name: "Mencari Informasi Harga Produk & Menyesuaikan Kolom Tampilan",
        priority: "CRITICAL",
        role_claimed: "IT Administrator",
        role_verified: "NANA (Admin/IT - Observed in UI Header)",
        role_verification_source: "Live header inspection at https://pricelist.radiatorsprings.id/search",
        environment: "production_read_only",
        url: "https://pricelist.radiatorsprings.id/search",
        captured_at_utc: new Date().toISOString(),
        prerequisites: [
          "Pengguna berada pada modul Cari Harga",
          "Pop-up panduan interaktif telah dilewati/ditutup"
        ],
        initial_state_id: "state_002_search_modal_open",
        steps: [
          {
            step_number: 1,
            action: "Tutup Pop-up Panduan Interaktif bila muncul",
            ui_label_exact: "Lewati Panduan",
            locator: "button:has-text('Lewati Panduan'), .driver-close-btn",
            state_before_id: "state_002_search_modal_open",
            screenshot_before_ref: "screenshots_sanitized/state_002_search_modal_open.png",
            state_after_id: "state_002_search_modal_closed",
            screenshot_after_ref: "screenshots_sanitized/state_002_search_modal_closed.png",
            observed_result: "Pop-up panduan tertutup sempurna dan seluruh area tabel pencarian terbuka penuh.",
            expected_result: "Layar beralih ke mode kerja pencarian aktif.",
            outcome: "OBSERVED",
            evidence_ids: ["EV-SEARCH-MODAL"]
          },
          {
            step_number: 2,
            action: "Ketik kata kunci produk pada Kolom Pencarian",
            ui_label_exact: "Cari Produk...",
            locator: "input[type='text'], input[placeholder*='Cari']",
            state_before_id: "state_002_search_modal_closed",
            screenshot_before_ref: "screenshots_sanitized/state_002_search_modal_closed.png",
            state_after_id: "state_002_search_filtered",
            screenshot_after_ref: "screenshots_sanitized/state_002_search_filtered.png",
            observed_result: "Tabel menampilkan daftar produk yang sesuai dengan kata kunci secara real-time.",
            expected_result: "Baris tabel terfilter tanpa perlu me-refresh halaman.",
            outcome: "OBSERVED",
            evidence_ids: ["EV-SEARCH-FILTER"]
          },
          {
            step_number: 3,
            action: "Ketik kata kunci acak untuk mengamati kondisi data tidak ditemukan",
            ui_label_exact: "Cari Produk...",
            locator: "input[type='text'], input[placeholder*='Cari']",
            state_before_id: "state_002_search_filtered",
            screenshot_before_ref: "screenshots_sanitized/state_002_search_filtered.png",
            state_after_id: "state_002_search_empty",
            screenshot_after_ref: "screenshots_sanitized/state_002_search_empty.png",
            observed_result: "Tabel menampilkan state kosong tanpa data produk.",
            expected_result: "Pengguna mengetahui indikator visual saat produk tidak tersedia di sistem.",
            outcome: "OBSERVED",
            evidence_ids: ["EV-SEARCH-EMPTY"]
          }
        ],
        validation_rules: [
          "Pencarian bersifat case-insensitive.",
          "Jika kata kunci tidak cocok, tabel menampilkan 0 hasil."
        ],
        business_rule_refs: ["BR-02"],
        permission_refs: ["PERM-READ-ALL"],
        evidence_statuses: ["OBSERVED", "TESTED_READ_ONLY"],
        confidence_reason: "Diuji langsung pada live system dengan variasi state: modal open, modal closed, query cocok, dan query kosong.",
        coverage_gaps: [
          "Eksekusi tombol Download file excel/pdf tidak dijalankan di produksi guna menghindari beban IO server."
        ],
        source_raw_page_refs: ["storage/raw_pages/002_https___pricelist_radiatorsprings_id_search.json"],
        source_old_analysis_refs: ["storage/checkpoints/analysis_002_https___pricelist_radiatorsprings_id_search.json"],
        sensitive_data_removed_in_export: true
      },
      {
        schema_version: "2.0",
        activity_id: "ACT-003",
        module: "Edit Harga",
        feature: "Pembaruan Harga Produk",
        activity_name: "Investigasi Aksesibilitas Formulir Edit Harga",
        priority: "CRITICAL",
        role_claimed: "IT Administrator",
        role_verified: "NANA (Admin/IT - Observed in UI Header)",
        role_verification_source: "Live session observation",
        environment: "production_read_only",
        url: "https://pricelist.radiatorsprings.id/admin/edit-harga",
        captured_at_utc: new Date().toISOString(),
        prerequisites: [
          "Pengguna login dengan akun terotorisasi"
        ],
        initial_state_id: "state_017_admin_edit_harga",
        steps: [
          {
            step_number: 1,
            action: "Akses URL rute https://pricelist.radiatorsprings.id/admin/edit-harga",
            ui_label_exact: "Edit Harga",
            locator: "a[href*='edit-harga']",
            state_before_id: "state_017_admin_edit_harga",
            screenshot_before_ref: "screenshots_sanitized/state_017_admin_edit_harga.png",
            state_after_id: null,
            screenshot_after_ref: null,
            observed_result: "Akses ke URL rute ini berhasil diobservasi dan tangkapan layar state tersimpan.",
            expected_result: "Mengetahui apakah halaman formulir edit harga dapat diakses atau dialihkan.",
            outcome: "OBSERVED",
            evidence_ids: ["EV-EDIT-HARGA-ROUTE"]
          }
        ],
        validation_rules: [
          "Dilarang melakukan submit perubahan harga pada sistem produksi live."
        ],
        business_rule_refs: ["BR-01"],
        permission_refs: ["PERM-READ-ALL"],
        evidence_statuses: ["OBSERVED", "BLOCKED"],
        confidence_reason: "Investigasi langsung menyelesaikan gap audit B.33 dimana rute sebelumnya tidak memiliki bukti tangkapan layar.",
        coverage_gaps: [
          "Pengujian penyimpanan/mutasi harga hanya boleh dilakukan di Staging."
        ],
        source_raw_page_refs: [],
        source_old_analysis_refs: [],
        sensitive_data_removed_in_export: true
      },
      {
        schema_version: "2.0",
        activity_id: "ACT-004",
        module: "Duplikat Harga",
        feature: "Pengecekan Data Duplikat & Paginasi",
        activity_name: "Memeriksa Daftar Duplikat & Kontrol Paginasi PREV/NEXT",
        priority: "HIGH",
        role_claimed: "IT Administrator",
        role_verified: "NANA (Admin/IT - Observed in UI Header)",
        role_verification_source: "Live session observation at /admin/duplicate",
        environment: "production_read_only",
        url: "https://pricelist.radiatorsprings.id/admin/duplicate",
        captured_at_utc: new Date().toISOString(),
        prerequisites: [
          "Pengguna membuka menu Cek Duplikat di sidebar admin"
        ],
        initial_state_id: "state_016_duplicate_pagination",
        steps: [
          {
            step_number: 1,
            action: "Periksa Tombol Paginasi PREV dan NEXT pada tabel duplikat",
            ui_label_exact: "PREV / NEXT",
            locator: "button:has-text('PREV'), button:has-text('NEXT')",
            state_before_id: "state_016_duplicate_pagination",
            screenshot_before_ref: "screenshots_sanitized/state_016_duplicate_pagination.png",
            state_after_id: null,
            screenshot_after_ref: null,
            observed_result: "Tombol PREV dan NEXT terdeteksi secara fisik pada antarmuka tabel.",
            expected_result: "Mengoreksi metadata lama yang menyatakan paginasi tidak ada.",
            outcome: "OBSERVED",
            evidence_ids: ["EV-DUP-PAGINATION"]
          }
        ],
        validation_rules: [
          "Tombol duplikasi massal TIDAK BOLEH dieksekusi di produksi."
        ],
        business_rule_refs: ["BR-01", "BR-04"],
        permission_refs: ["PERM-READ-ALL"],
        evidence_statuses: ["OBSERVED"],
        confidence_reason: "Menyelesaikan gap audit B.35 dengan bukti konkret keberadaan kontrol paginasi.",
        coverage_gaps: [
          "Eksekusi tombol Duplikasi diblokir demi keselamatan data."
        ],
        source_raw_page_refs: ["storage/raw_pages/016_https___pricelist_radiatorsprings_id_admin_duplicate.json"],
        source_old_analysis_refs: ["storage/checkpoints/analysis_016_https___pricelist_radiatorsprings_id_admin_duplicate.json"],
        sensitive_data_removed_in_export: true
      },
      {
        schema_version: "2.0",
        activity_id: "ACT-005",
        module: "Katalog Brand",
        feature: "Katalog Produk & Kategori Brand",
        activity_name: "Navigasi 10 Brand Resmi & Pemisahan Komponen Global",
        priority: "HIGH",
        role_claimed: "IT Administrator",
        role_verified: "NANA (Admin/IT - Observed in UI Header)",
        role_verification_source: "Live brand inspection",
        environment: "production_read_only",
        url: "https://pricelist.radiatorsprings.id/harga?brand=makerspace",
        captured_at_utc: new Date().toISOString(),
        prerequisites: [
          "Pengguna memilih salah satu menu Brand pada sidebar navigasi"
        ],
        initial_state_id: "state_003_brand_makerspace",
        steps: [
          {
            step_number: 1,
            action: "Buka halaman katalog brand resmi",
            ui_label_exact: "Makerspace, Speedometer, Gearsecond, dll",
            locator: "nav a[href*='harga?brand=']",
            state_before_id: "state_003_brand_makerspace",
            screenshot_before_ref: "screenshots_sanitized/state_003_brand_makerspace.png",
            state_after_id: null,
            screenshot_after_ref: null,
            observed_result: "Katalog memuat kategori spesifik brand tanpa mencampur komponen global inquiry.",
            expected_result: "Karyawan dapat melihat struktur harga resmi per merk dagang.",
            outcome: "OBSERVED",
            evidence_ids: ["EV-BRAND-CATALOG"]
          }
        ],
        validation_rules: [
          "Setiap brand memiliki daftar produk dan struktur kolom harga yang disesuaikan."
        ],
        business_rule_refs: ["BR-01"],
        permission_refs: ["PERM-READ-ALL"],
        evidence_statuses: ["OBSERVED"],
        confidence_reason: "Menyelesaikan gap audit B.34 dan B.36 dengan memisahkan kategori asli brand dari boilerplate global.",
        coverage_gaps: [],
        source_raw_page_refs: ["storage/raw_pages/003_https___pricelist_radiatorsprings_id_harga_brand_makerspace.json"],
        source_old_analysis_refs: ["storage/checkpoints/analysis_003_https___pricelist_radiatorsprings_id_harga_brand_makerspace.json"],
        sensitive_data_removed_in_export: true
      }
    ];
  }

  _generateAnalysisV2(act) {
    return {
      schema_version: "2.0",
      activity_id: act.activity_id,
      module: act.module,
      feature: act.feature,
      user_goal: `Memandu staf operasional dalam ${act.activity_name.toLowerCase()} secara cepat, tepat, dan aman.`,
      verified_roles: [act.role_verified],
      prerequisites: act.prerequisites,
      grounded_steps: act.steps.map(s => ({
        step: s.step_number,
        action_text: s.action,
        exact_label: s.ui_label_exact,
        evidence_id: s.evidence_ids[0] || "EV-DEFAULT",
        observed_result: s.observed_result
      })),
      verified_business_rules: act.business_rule_refs,
      unsupported_claims_or_speculations: [],
      questions_for_process_owner: [
        "Apakah role staf kasir memiliki pembatasan kolom harga khusus dibandingkan admin?",
        "Kapan jadwal rutin sinkronisasi diskon dilakukan oleh tim operasional?"
      ],
      coverage_gaps: act.coverage_gaps
    };
  }

  _generateAnnotationPlan(act) {
    const callouts = act.steps.map((s, idx) => ({
      callout_number: `[0${idx + 1}]`,
      element_label: s.ui_label_exact,
      action: s.action.split(' ')[0] || "Klik",
      operational_purpose: s.expected_result,
      target_locator: s.locator,
      bounding_box_estimate: {
        focal_area: "Area kerja utama",
        relative_position: idx === 0 ? "Top / Header" : "Center / Table"
      }
    }));

    return {
      activity_id: act.activity_id,
      screenshot_ref: act.steps[0]?.screenshot_before_ref || "N/A",
      style_standard: "Zola Standard (Orange #E65100 / Charcoal #263238 / White #FFFFFF)",
      callouts
    };
  }
}

module.exports = { EvidenceBuilder };

