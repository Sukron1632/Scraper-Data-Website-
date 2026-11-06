# ZOLA — FINAL MASTER SUPER PROMPT V4.2
## Feature Exhaustiveness, Evidence Closure, Guidebook Baseline Freeze & Release Audit

**PROYEK:** Web Pricelist — PT Radiator Springs Indonesia  
**TUJUAN:** Menuntaskan inventarisasi seluruh modul, fitur, aktivitas, dan kontrol yang relevan untuk guidebook **SEBELUM kerangka guidebook dibekukan**, sehingga fitur yang sebenarnya sudah ada tidak perlu disisipkan di tengah proses desain/penulisan. Hasil harus siap menjadi **root/baseline guidebook berbasis bukti**, dengan **pengecualian yang didokumentasikan** untuk eksekusi yang berpotensi mengubah sistem produksi.  
**PERAN AI:** Principal System Analyst, Senior Browser/DOM Automation Engineer, UX Interaction Auditor, QA & Data Integrity Engineer, Security Reviewer, Documentation Information Architect, dan Independent Release Auditor.  
**MODE EKSEKUSI:** Observasi dan perbaikan non-destruktif terlebih dahulu. Terapkan *append-only, versioned, provenance-driven, evidence-first*. Jangan membangun ulang scraper maupun menghapus hasil terdahulu.

> **PERINTAH PENTING:** Jangan menganggap `9 modul / 21 fitur / 14 aktivitas` sebagai jumlah akhir yang wajib tetap. Itu adalah **baseline V4.1 yang telah diaudit**, bukan bukti bahwa semua fitur sudah ditemukan. Jangan menaikkan status menjadi PASS dengan hanya mengganti teks laporan atau menambah baris inventory tanpa bukti. Yang wajib diselesaikan ialah *reconciliation* semua fungsi yang dapat diamati dan semua temuan belum terjawab.

---

## 0 — HIRARKI PRIORITAS DAN LARANGAN MUTLAK

Prioritas: **keselamatan produksi > kerahasiaan > integritas data historis > kejujuran status bukti > kelengkapan inventaris > kecepatan**.

1. **PRODUKSI TIDAK BOLEH BERUBAH:** Jangan membuat/memperbarui/menghapus data atau file bisnis; mengirim konsultasi; upload; menambah merk/tipe/diskon/brosur/user; edit harga; duplikasi; apply/arsip diskon; publish; sinkronisasi user atau org units; mengganti setting; menjalankan import/export yang memiliki side-effect; atau memicu notifikasi bisnis yang mengubah state. Jangan melakukan tindakan yang belum dibuktikan non-mutatif.
2. Jangan menganggap `GET` selalu aman, atau `POST` Livewire/AJAX selalu mutatif. Sebelum aksi, tentukan sifatnya melalui pembacaan kode/kontrak dan bukti yang diizinkan. **Jika ragu: jangan klik; dokumentasikan `SAFETY_BLOCKED` dan lanjutkan kontrol lain.** Jangan mengirim request eksplorasi manual yang mem-bypass perilaku UI.
3. Tidak boleh mengganti role, bypass permission, melepas disabled attribute, memaksa submit, memanipulasi JS aplikasi, atau mengubah server untuk mengejar screenshot. Jangan mengakses endpoint tak berizin.
4. Jangan mengubah source code aplikasi bisnis, DB, data/akun produksi, atau riwayat. Perbaikan pada *tool scraper* saja boleh melalui ekstensi kompatibel dan pengujian aman; jangan ubah semantik data atau checkpoint existing.
5. **SELURUH dataset V1, V2, V3, V4, V4.1, screenshot, JSON, analysis, raw_pages, session files, konfigurasi, dan checkpoint lama bersifat READ-ONLY / IMMUTABLE.** Buat run V4.2 baru; tidak boleh overwrite, rename, delete, move, reset, atau re-initialize existing. Buat manifest SHA-256 baseline sebelum proses dan laporkan perbandingan setelah proses. Tidak perlu memasukkan folder rahasia ke ZIP publik.
6. Session, cookie, CSRF, `_token`, bearer, API key, password, signed URL, email pribadi, nomor telepon, data pelanggan/karyawan, dan rahasia lain **tidak boleh ada dalam ZIP distribusi, request AI, log audit terbagikan, maupun screenshot terbitan**. Redaksi hanya pada salinan sanitasi, tidak pada master asli. Bila sudah terekspos, catat sebagai insiden dan sarankan rotasi kepada admin; jangan memakai rahasianya.
7. Semua aksi mutatif **tetap ditemukan dan didokumentasikan** tetapi pelaksanaannya diberi `MUTATIVE_DEFERRED` atau `SAFETY_BLOCKED`. Deferred adalah pengecualian **hanya untuk eksekusi**, bukan alasan menghilangkan tombol, form dasar yang aman diamati, modul, atau fitur dari daftar isi.
8. Jangan menulis klaim `ZERO_MUTATION_SERVER_VERIFIED` hanya dari request log klien. Pisahkan `CLIENT_MUTATION_NOT_OBSERVED` dan `SERVER_AUDIT_VERIFIED` (yang kedua butuh log server/DB yang benar-benar tersedia dan diizinkan). Jangan menyatakan PASS bila bukti belum ada.
9. Jika beberapa referensi (source code, UI live, akun role lain, gambar lama, template HRIS/To-Do) tidak tersedia, nyatakan `REFERENCE_NOT_AVAILABLE` dan batas cakupan eksplisit. **Tidak boleh mengarang** isi data, URL, hasil aksi, kewenangan, ataupun angka statistik.
10. Jangan mengklaim semua fitur perusahaan telah ditemukan bila hanya mengaudit satu role, satu tenant, atau satu ukuran viewport. Klaim yang diperbolehkan ialah `NO_UNRESOLVED_IN_SCOPE_FEATURES` **dalam cakupan bukti yang benar-benar diakses**, ditambah daftar pembatasan untuk area yang tidak dapat dilihat.

## 1 — SUMBER ACUAN DAN TEMUAN V4.1 YANG WAJIB DIPULIHKAN

Gunakan workspace, kode scraper, browser yang sah, ZIP V4.1, audit independen V4.1, dan pedoman guidebook Zola sebagai dasar. Bila ada perbedaan, **observasi UI aktual + bukti aplikasi** mengungguli asumsi analysis AI; logika backend hanya diklaim jika kode/kontrak/owner benar-benar memverifikasi.

**Baseline V4.1 terverifikasi dalam audit terdahulu:** 9 modul (8 route + 1 modal global), 21 fitur (14 read-only, 7 deferred), 14 aktivitas, 31 screenshot, 31 HTML tersanitasi, 14 annotation plans, serta 7 dossier deferred. Angka ini bukan target maksimum; hitung ulang dari run aktual.

### 1.1 Sembilan modul baseline yang HARUS dipertahankan identitasnya

| ID | Modul | Sifat lokasi |
|---|---|---|
| `MOD-001` | Dashboard | route `/dashboard` |
| `MOD-002` | Cari Harga | route `/search` |
| `MOD-003` | Harga per Brand | route `/harga?brand=...` |
| `MOD-004` | Brosur | route `/admin/brosur` |
| `MOD-005` | Diskon | route `/admin/diskon` |
| `MOD-006` | Karyawan & User | route `/admin/user` |
| `MOD-007` | Duplikat Harga | route `/admin/duplicate` |
| `MOD-008` | Edit Harga | route `/admin/edit-harga` |
| `MOD-009` | Tanya Harga & Konsultasi Keluhan | modal global, **bukan sidebar baru** |

Jangan mengubah ID/nama yang sudah dipakai; alias boleh untuk penamaan bab agar mudah dibaca. Modul baru hanya dibentuk bila ada fungsi independen yang dibuktikan; komponen kecil tetap merupakan fitur/subfitur. Hindari membuat modul palsu karena route berbeda atau modal muncul berulang.

### 1.2 Temuan kekurangan yang WAJIB dituntaskan satu per satu

**Cakupan fitur:**
- `FEAT-BROSUR-LIST` (*Daftar Brosur Digital*) ada tetapi tidak mempunyai `mapped_activities`; harus mendapat aktivitas/referensi evidence yang formal, terpisah secara jelas dari membuka detail brosur.
- Pada Harga per Brand terlihat **Tambah Merk** dan **Tambah Tipe**; dua kontrol ini belum tercakup sebagai fitur/dossier. Cantumkan minimal keberadaan, posisi, konteks, role teramati, dan `MUTATIVE_DEFERRED` bila dapat mengubah data; jangan menekannya di produksi.
- Pada Diskon terlihat tombol **Tambah**, sedangkan dossier lama baru Apply dan Arsip. Buat rekaman fitur `Tambah Diskon` terpisah; catat aksi lain Edit/Hapus/Status hanya **bila benar-benar ditemukan**, jangan diasumsikan.
- Pada Cari Harga terdapat kontrol **Download, jumlah baris 10/25/50/100, Refresh, filter Merk/Tipe/Kategori/Brand, toggle kolom harga, kolom pencarian, empty/loading state, serta navigasi tabel**. Temukan satu per satu dan kelola sebagai fitur, subfitur, atau state yang semantik (hindari membuat fitur artifisial per dekorasi).
- Pada Dashboard ada kontrol brosur **Open (HD), Download, Bagikan, Salin Link** dalam bukti measured_elements. Periksa visibilitas, alur, dan relevansinya; tautkan ke modul Brosur/shortcut Dashboard sesuai UI, bukan didiamkan.
- Audit pula tombol **Tambah, Edit, Hapus, Detail, menu ⋮, checkbox, pemilihan kolom, tombol disabled, ikon header/floating**, dan kontrol global lain pada SEMUA halaman untuk memastikan tidak ada yang tertinggal. Jangan menyimpulkan keberadaan bila tidak terlihat/terdeteksi.
- **Tanya Harga & Konsultasi Keluhan**: pastikan tiga varian `SPD Speedometer (MOBIL)`, `GRS Speedometer (MOTOR)`, `Produk Lainnya (NON-KENDARAAN)`, semua field kondisional (termasuk `Nama Produk` khusus non-kendaraan), required mark yang terlihat, lampiran (Pilih File/Drag & Drop/Paste), X/Batal/Kirim, sumber pemicu, dan keterkaitan modal global. `Kirim` tetap deferred.

**Anotasi salah target — HARUS DIVERIFIKASI DARI PIXEL / GEOMETRI / STATE YANG BENAR, BUKAN SEKADAR STATUS REPORT:**
- `ACT-SEARCH-001`: `Lewati Panduan` harus memakai **state modal terbuka**, bukan search box setelah modal tertutup. Referensi audit: `STATE_SEARCH_001_MODAL_OPEN`; bbox target semula terukur `[590,513,134,38]` pada snapshot yang diaudit (ukur ulang jika screenshot berbeda).
- `ACT-SEARCH-004`: dropdown **Pilih Brand**, bukan search bar. Referensi semula `STATE_SEARCH_005_BRAND_FILTERED`, bbox select `[308,212,258,36]`.
- `ACT-DUP-001`: tombol **NEXT**, bukan angka harga. Audit sebelumnya menemukan target di `[1340,282,39,17]`.
- `ACT-CONSULT-003`: **Batal** yang sebenarnya, bukan area kosong; audit sebelumnya `[1107,729,69,40]`.
- `ACT-BRAND-001`: pemilih **brand** sebenarnya, bukan pojok header; salah satu bukti `STATE_BRAND_007_speedometer`, link `SPD Speedometer` di `[32,540,209,34]`.
- **Semua 14 preview lain juga WAJIB direview visual**, bukan hanya lima temuan; koordinat nonzero ≠ benar secara makna. Referensi bbox adalah petunjuk audit, **bukan angka yang harus disalin mentah ke gambar baru**.

**Kualitas dataset / QA:**
- `QA_PASS_A/B` melaporkan G13 PASS padahal A mencatat `passed_items=1/3` dan B `2/3`; periksa akar penyebab dan perbaiki pengujian, bukan status saja.
- Bukti *post-packaging* Pass C belum dilampirkan; hasil akhir harus mengandung report QA C yang benar-benar dijalankan terhadap ZIP hasil final.
- `release_decision.json` masih memiliki checksum placeholder `CALCULATING_POST_PACKAGING`. Gunakan SHA-256 pada **sidecar eksternal `.sha256`**, bukan memasukkan checksum ZIP ke dalam ZIP sendiri; tetap tulis hash yang sesuai pada laporan di luar ZIP setelah paket final dibuat.
- Rekonsiliasi metrik laporan QA (sebelumnya pernah 29 vs 31 evidence), jumlah modul/fitur/aktivitas baru, referensi ID, dan metadata `evidence_count`, `timestamps`.
- Status role `NANA` belum terverifikasi sebagai admin; jangan mengklaim akses role lain. Screenshot modal konsultasi yang pernah dilihat user bertema gelap sedangkan hasil scraping terang; identifikasi tema yang dipilih, dokumentasikan variasi bila ada, jangan menyatukan screenshot berbeda tema tanpa penjelasan.
- Terdapat POST Livewire read-only menurut log klien; audit keamanannya harus jujur dan tidak otomatis mengklaim nihil mutasi server.

---

## 2 — DEFINISIKAN DULU APA YANG DIANGGAP MODUL, FITUR, SUBFITUR, AKTIVITAS, DAN STATE

Tujuan ini mencegah dua masalah sekaligus: fitur penting hilang karena tidak punya route; dan daftar isi terlalu banyak karena setiap ikon dekoratif menjadi bab.

- **Modul**: kelompok pekerjaan besar yang masuk akal sebagai satu bab atau subbab; bisa berupa route maupun **global modal** yang mandiri secara tugas.
- **Fitur**: kemampuan nyata yang dapat digunakan/dilihat pengguna, dengan input-output atau tujuan operasional tertentu (mis. filter harga, daftar brosur, konsultasi, tambah diskon).
- **Subfitur/kontrol**: tombol, tab, opsi, link, filter, checkbox, dropdown, atau ikon yang menjadi bagian dari satu fitur. Seluruh kontrol bermakna harus terpetakan meskipun tidak wajib masing-masing dibuat aktivitas terpisah.
- **Aktivitas**: hal yang dilakukan pengguna, berbentuk kata kerja dan hasil yang teramati; mengelompokkan beberapa kontrol terkait agar guidebook singkat.
- **State**: kondisi layar seperti initial/loaded/empty/filtered/modal open/closed/disabled/pagination/error; tidak otomatis fitur terpisah.
- **Global feature**: dapat diakses dari beberapa halaman (mis. Tanya Harga), satu ID canonical dengan banyak entry point.
- **Deferred**: aksi ada tetapi tidak boleh dieksekusi dalam produksi. Tidak boleh hilang dari inventaris maupun guidebook; instruksi konseptual boleh hanya yang diperkuat bukti yang sudah diamati.
- **Out of scope**: fitur dibuktikan ada tetapi sengaja dikecualikan dari cakupan guidebook melalui keputusan tertulis pemilik proyek, bukan karena scraper lupa.

Satu kontrol dianggap **tercatat tuntas** bila: `control_id`, label persis atau accessible name, route/state, role teramati, jenis tindakan, koordinat/locator bila tampak, linked feature/activity/dossier, evidence, dan status keamanan ada. Kontrol dekoratif boleh dilabel `NON_INTERACTIVE_DECORATION` dengan alasan; jangan diam-diam dihapus dari hasil perbandingan.

---

## 3 — INVENTARISASI FULL-COVERAGE (BUKAN SEKADAR MEMBACA SIDEBAR)

Jalankan discover dalam beberapa lintasan yang **independen sumbernya** dan lakukan *set reconciliation*.

### PASS D1 — Rekonstruksi navigasi dan route

1. Mulai dari daftar URL existing, sidebar, topbar, tab, logo, breadcrumb, footer, quick action, floating buttons, tombol tabel, icon links, kartu dashboard, dan dialog.
2. Temukan pintu masuk ke setiap modul dan subfitur; cocokkan UI label dengan route dan hasil navigasi aman yang benar-benar terjadi. Catat redirect/403/disabled sebagai state; jangan mencoba bypass.
3. Lakukan pemeriksaan ulang seluruh halaman setelah scroll vertikal/horizontal (termasuk tabel lebar), pagination yang aman, modal/drawer, dan filter/read-only yang diizinkan.
4. Jangan hanya membaca menu yang langsung terlihat: cek menu `⋮`, tooltip, ikon, tombol disembunyikan oleh responsive layout, row actions, tab tidak aktif, dan komponen global. Jangan klik elemen yang tidak pasti aman.

### PASS D2 — Visible UI / Accessibility / DOM

Untuk setiap state yang telah dicapai secara aman, inventaris setiap kontrol yang **terlihat dan actionable/terindikasi interaktif** dari `button`, `a`, `input`, `select`, `textarea`, label clickable, role button/menuitem/tab, icon-only control, elemen event-driven yang teramati.

Data wajib: exact label, locator unik bila memungkinkan, computed visibility, enabled/disabled, container, posisi, URL, state ID, role, semantic action, data dependency, screenshot evidence. Komponen hidden di DOM **hanya masuk daftar kandidat discovery**; jangan dianggap aktif kecuali state visualnya sudah dibuktikan.

Deduplikasi event listener JS, Livewire, Alpine, modal global, form bersama, serta tautan yang mengarah ke fungsi sama. Catat *same feature, different entry point* agar tidak menambah duplikasi modul.

### PASS D3 — Source code read-only (jika tersedia)

Baca kode frontend/router/Blade/JS/Livewire/component definitions secara READ-ONLY untuk membangun **candidate inventory**: route, view, komponen, handler, conditional role, feature flags, modal, tombol, label, dan state. Jangan menjalankan controller endpoint mutatif untuk membuktikannya. Catat `SOURCE_CODE_FOUND_NOT_UI_VERIFIED` bila fungsi ada di kode tetapi tidak teramati pada akun/UI.

Jika source code unavailable: catat `SOURCE_CODE_NOT_AVAILABLE`, jangan menganggap tidak ada fitur lain.

### PASS D4 — State & condition coverage

Untuk tiap fitur, cari state yang memengaruhi langkah pengguna: tampilan awal, modal, tab, pilihan varian, filter, pencarian, kosong, loading, validasi client yang dapat diamati tanpa submit, pagination, disabled, error yang kebetulan muncul, detail, serta keberadaan tombol mutatif. Jangan sengaja memicu kegagalan produksi atau submit hanya demi error state.

Uji pada role/viewport hanya yang benar-benar diberikan dan diizinkan. Jika terdapat akses admin dan non-admin secara sah, bandingkan; jika tidak, catat `ROLE_COVERAGE_LIMITED` dan jangan mengarang.

### PASS D5 — Reconciliation empat arah (WAJIB, gate keras)

Buat hasil diff untuk empat himpunan berikut:

- **A = Visible interactive controls** dari seluruh screenshot/state yang diobservasi.
- **B = Code/DOM/route candidates** yang ditemukan tanpa mengasumsikan bisa digunakan.
- **C = Canonical feature + control inventory** yang akan menjadi sumber guidebook.
- **D = Activities/deferred dossiers/guidebook outline** yang akan benar-benar ditulis.

Kerjakan:

1. `A - C`: semua kontrol terlihat tetapi belum tercatat → *buat feature/subfeature record*, atau beri justifikasi `DECORATIVE/THIRD_PARTY/OUT_OF_SCOPE` yang punya bukti. **Jumlah item tak berstatus wajib 0**.
2. `B - C`: kandidat kode/DOM belum tervalidasi → beri status `CANDIDATE_UNVERIFIED`, `HIDDEN`, `ROLE_BLOCKED`, `REMOVED`, atau `NOT_RELEVANT` beralasan; jangan langsung dihapus atau dipromosikan ke VERIFIED.
3. `C - D`: setiap fitur `READ_ONLY/UI_ONLY` harus punya minimal 1 aktivitas terpetakan atau `BLOCKED_WITH_EVIDENCE`; setiap fitur `MUTATIVE_DEFERRED` harus punya dossier dan titik anotasi dasar. **Jumlah fitur tanpa disposisi wajib 0**.
4. `D - C`: setiap aktivitas dan judul guidebook harus menaut ke fitur canonical yang sungguh ada, bukan menu/tindakan rekaan. **Jumlah aktivitas tanpa fitur wajib 0**.
5. Seluruh state/screenshot/evidence yang dipakai harus memiliki relasi file→state→kontrol→fitur→aktivitas→section; aset tambahan yang tidak dipakai harus punya disposisi `REFERENCE_ONLY/ARCHIVE` agar tidak terhitung sebagai fitur yang belum ditulis.

Hasilkan `control_to_feature_reconciliation.json`, `candidate_to_inventory_reconciliation.json`, `feature_to_activity_coverage.json`, `orphan_evidence_report.json`, dan `unresolved_discovery_register.json`. Satu file dengan `unresolved: 0` hanya valid jika rincian raw item dan cara penghitungannya disertakan.

---

## 4 — INVENTARIS MINIMUM PER MODUL (CEK KEMBALI, BUKAN MENYIMPULKAN FUNGSI TANPA BUKTI)

### MOD-001 — Dashboard

- Ringkasan statistik, widget dan penjelasan angka berdasarkan label aktual.
- Menu/shortcut brosur: `Open (HD)`, `Download`, `Bagikan`, `Salin Link` jika tampak pada state yang tepat. Periksa keterkaitan ke Brosur dan buat cross-link, jangan duplikasi petunjuk.
- Filter/widget/date range, refresh, notifikasi, profile, logout atau ikon lain hanya jika teramati. Bila aksi log out dapat mengganggu sesi scraper, cukup identifikasi tanpa menekan.
- Catat empty/error state dan pesan penting yang tersedia, tidak perlu membuat skenario palsu.

### MOD-002 — Cari Harga

- Onboarding Driver.js: membuka, lanjut, lewati/tutup; hindari salah mengambil state setelah modal tutup.
- Input pencarian dan hasil aktual (termasuk loading dan empty yang valid setelah UI settled).
- Filter Brand, Merk, Tipe, Kategori (termasuk dependensi) — periksa mana yang benar-benar tersedia.
- Limit baris `10/25/50/100`, refresh, navigasi halaman, pengurutan kolom bila ada, konfigurasi kolom harga/toggle.
- Download/export, pilih format bila terlihat; jangan memicu permintaan yang mungkin berdampak atau mengekspor data privat tanpa izin.
- Interaksi kartu, row detail, harga, status, icon action; pengelompokan prosedur tidak bertele-tele.

### MOD-003 — Harga per Brand

- Inventaris seluruh brand teramati; 10 brand V4.1 adalah baseline, pastikan apakah ada yang bertambah/berkurang dengan bukti aktual.
- Pemilihan brand → kategori/subkategori → daftar/detail produk yang benar-benar ada.
- `Tambah Merk` dan `Tambah Tipe` sebagai subfitur/dossier mutatif yang **terpisah** dari baca kategori; jangan klik di produksi.
- Pencarian/filter/scroll kartu/kembali/aksi produk bila terlihat.
- Hindari penulisan sepuluh prosedur identik bila alurnya sama; buat satu alur utama ditambah perbedaan brand yang memang terlihat.

### MOD-004 — Brosur

- **Daftar Brosur** harus menjadi activity atau bagian eksplisit ber-ID; perbaiki `FEAT-BROSUR-LIST` mapping kosong.
- Filter, cari, daftar, status, rincian brosur, klik aman daftar→detail; bukti before/after.
- `Open (HD)`, Download, Share/Salin Link, tautan dari Dashboard bila ada dan aman; jangan menyimpulkan semua brosur punya opsi yang sama bila terbukti hanya pada item contoh.
- Tambah/Upload, edit, hapus atau publish **hanya kalau ditemukan**; buat dossier per aksi mutatif atau subaksi sesuai risiko. Jangan upload di produksi.

### MOD-005 — Diskon

- Daftar diskon, tabel, filter, detail dan status yang teramati.
- `Tambah Diskon` sebagai fitur deferred **baru** selain `Apply`/`Arsip`. Boleh membuka form jika dan hanya jika buka form tidak berdampak; jangan simpan, apply, arsip, atau unggah.
- Edit/Hapus/aktivasi lain dicatat jika ditemukan; bukan asumsi.
- Jangan menyimpulkan rumus diskon atau perubahan harga kasir tanpa dokumen/kode owner yang mendukung.

### MOD-006 — Karyawan & User

- Daftar akun, pencarian, filter, pagination, label role yang terlihat; sanitasi nama, nomor, email, dan identitas lain.
- Sync User dan Sync Org Units, Tambah/Edit/Hapus akun serta pengaturan role **hanya jika ada**; catat sebagai deferred dengan bukti dasar.
- Jangan menyimpulkan akun `NANA` adalah IT Administrator tanpa verifikasi server/owner yang sah.

### MOD-007 — Duplikat Harga

- Daftar produk, filter, pagination PREV/NEXT, perubahan halaman yang benar-benar terlihat.
- Kontrol seleksi, pencarian, duplikasi, opsi tambahan; `Duplikat` eksekusi deferred.
- Pastikan highlight PREV/NEXT benar pada state dan screenshot yang sepadan.

### MOD-008 — Edit Harga

- Daftar produk, checkbox, jumlah terpilih, tombol `Edit (0)` disabled dan state lain yang aman teramati.
- Jika pemilihan checkbox murni UI dan aman secara terbukti, rekam state setelah pemilihan; jika ragu jangan klik.
- Jangan mengklaim formulir Edit Harga/hasil Simpan sudah teramati bila screenshot baru menunjukkan daftar. Tombol submit tetap deferred.

### MOD-009 — Tanya Harga & Konsultasi Keluhan (GLOBAL MODAL)

- Trigger floating/header/entry points lain yang teramati; modal global, bukan route baru fiktif.
- Tiga varian SPD MOBIL, GRS MOTOR, Produk Lainnya NON-KENDARAAN; petakan field visible/hidden setiap varian secara terpisah.
- SPD dan GRS: Merk Kendaraan, Tipe Kendaraan, Transmisi, Tahun Kendaraan, Detail Pertanyaan/Keluhan, Foto Lampiran **sepanjang memang terlihat pada varian aktual**.
- Non-kendaraan: `Nama Produk`, Detail Pertanyaan/Keluhan, Foto Lampiran; jangan menambahkan field kendaraan bila sebenarnya hidden.
- Placeholder `Pilih atau tulis manual...`, tanda wajib `*`, upload Drag & Drop/Paste/Pilih File, Batal/X, area scroll.
- Tombol Kirim dan dampak WhatsApp/notifikasi **tidak boleh diuji**; hasil penerima, ticketing, dan response time tidak boleh dikarang.

### Modul/fitur di luar baseline

Jika source code atau UI membuka fungsi baru, letakkan di modul relevan (atau modul baru dengan bukti), berikan ID stabil, tambahkan ke struktur guidebook **sebelum freeze**, lalu ulangi reconciliation. Jangan diam-diam menaruh di catatan lampiran tanpa lokasi dalam outline.

---

## 5 — METODE BUKTI DAN STATUS KEBENARAN (ANTI-HALUSINASI)

Setiap klaim guidebook wajib dipetakan ke provenance. Gunakan record dengan minimal:

- `module_id`, `feature_id`, `control_id`, `activity_id`, `state_id`, `transition_id`, `evidence_id`.
- `label_ui_exact`, `source_type` (`UI_VISIBLE`, `CLIENT_CODE`, `SERVER_CODE`, `OWNER_CONFIRMED`, `INFERENCE`), `source_path`, `route`, `role_observed`, `captured_at`, `app_version_if_known`.
- `precondition`, `action`, `observed_result`, `expected_result_source`, `safe_execution_class`, `verification_status`, `unknowns`, `guidebook_allowed_claims`, `guidebook_forbidden_claims`.
- `screen_image_path`, `screen_sha256`, `source_html_path`, `html_sha256`, `locator`, `bbox_px` hanya jika benar-benar terukur, `evidence_links` dan `review_notes`.

Status klaim yang berbeda: `DISCOVERED_CANDIDATE`, `VISUALLY_OBSERVED`, `SAFE_INTERACTION_VERIFIED`, `CODE_CONFIRMED`, `OWNER_CONFIRMED`, `MUTATIVE_DEFERRED`, `ROLE_BLOCKED`, `SAFETY_BLOCKED`, `UNKNOWN`. Jangan menaikkan `VISUALLY_OBSERVED` menjadi `SAFE_INTERACTION_VERIFIED` karena tombol terlihat. Jangan mempromosikan `INFERENCE` sebagai fakta tanpa sumber.

Untuk panduan final, beda antara **fungsi yang terlihat** dan **hasil setelah klik**. `Kirim` tampil ≠ terkirim; `Apply` tampil ≠ promo diterapkan; `Edit (0)` tampil ≠ formulir harga telah terlihat.

---

## 6 — PERENCANAAN GUIDEBOOK SEKALIGUS, SEBELUM DESAIN DIMULAI

**Buat kerangka final dari keseluruhan inventaris yang telah ditutup, bukan sambil jalan per bab.** Struktur bukan salinan mentah sidebar: dahulukan alur pengguna dan modul yang terkait, tetapi tetap ada peta silang menu asli.

Hasil wajib:

1. `guidebook_blueprint_final.md` berisi cover, Cara Menggunakan Panduan (RUTIN/BERKALA/KHUSUS sesuai relevansi aktual), daftar bagian dan subbab, tujuan bagian, fitur, aktivitas, serta catatan akses.
2. `guidebook_outline_structured.json`: `section_id`, urutan, nama bagian, `module_ids`, `feature_ids`, `activity_ids`, role, status, evidence, `deferred_refs`, estimasi slot visual, `ready_for_design`.
3. `module_feature_activity_map.csv` dan `.json`: seluruh fitur termasuk yang deferred, menyatakan **lokasi final di guidebook**, agar tidak ada fitur yang muncul tanpa tempat.
4. `guidebook_content_stubs.md`: satu kalimat fungsi/tujuan per aktivitas sesuai bukti, langkah instruktif singkat untuk yang terverifikasi, serta `TODO_OWNER/STAGING` untuk deferred; jangan isi hasil buatan.
5. `cross_reference_index.json`: fitur dari dashboard/global modal dapat dirujuk dari beberapa alur tanpa mengulang bab yang sama.
6. `missing_information_requests.md`: pertanyaan khusus ke owner mengenai role, aturan bisnis, fitur akses terbatas, theme dan tindakan yang memerlukan staging; setiap pertanyaan menyebut fitur dan evidence yang mendasari.

**Kebijakan anti-insertion:** satu pun bagian visual final tidak boleh disusun sebelum matriks `feature_to_outline_mapping` mencakup **100% fitur yang ditemukan dan masuk scope**, termasuk dossier deferred. Jika ada fitur baru sebelum freeze, masukkan ke struktur, jalankan ulang reconciliation, dan revisi daftar isi **sekarang**, bukan nanti saat penulisan setengah jalan.

Setelah freeze, temuan fitur baru diproses sebagai `POST_FREEZE_CHANGE_REQUEST` dengan alasan, dampak halaman, bab terpengaruh, dan keputusan apakah perlu re-freeze; **tidak otomatis menjadikan seluruh draft selesai**, dan jangan menyembunyikan penemuan baru untuk mempertahankan status PASS.

### Standar visual Zola (acuan Panduan HRIS & To-Do)

- Sasaran karyawan non-IT, bahasa Indonesia singkat dan spesifik.
- Struktur: cover → cara menggunakan → daftar isi → pembuka bagian (`APA YANG AKAN ANDA PELAJARI`, bila relevan `ALUR SINGKAT`, `CATATAN PENTING`) → nama fitur/aktivitas → gambar asli beranotasi → caption.
- Visual-first, dominan oranye–charcoal–putih, screenshot aktual (tidak membuat UI fiktif), nomor callout berurutan, panah/highlight pada kontrol yang nyata, kelompokkan elemen yang saling terkait.
- Artwork anotasi **full-bleed tanpa margin putih di luar gambar**, rasio proporsional, nyaman saat dimasukkan ke Word A4 ±14–15 cm lebar; pilih 1–4 panel seperlunya, bukan paksa semua isi jadi satu gambar sempit.
- Setiap aktivitas harus menjawab **di mana / apa yang dilakukan / apa hasilnya atau batasannya**. Fitur deferred dijelaskan keberadaan dan risiko/batasannya, tanpa prosedur sukses palsu.
- Konsistensi mode tema terang/gelap dan ukuran teks; bila screenshot berasal dari versi/tema berbeda, dokumentasikan dan jangan campur tanpa alasan.

---

## 7 — GEOMETRI ANOTASI DAN REVIEW VISUAL SEMANTIK (P0)

1. Hitung `bbox_px` berdasarkan elemen pada **state screenshot tepat yang digunakan**; jika browser memakai CSS pixels berbeda dari screenshot, konversikan menggunakan viewport, DPR, scroll offset, crop/scale, dan catat transformasinya. Bukan sekadar mengambil DOM bbox dari state lain.
2. Wajib `width>0`, `height>0`, berada dalam batas screenshot, dan mencakup visual target (bukan tetangga/kolom lain). Ukur ulang sesuai screenshot aktual; jangan menyalin nilai audit sebelumnya tanpa pemeriksaan.
3. Setiap callout mempunyai `action_target_label`, `target_element_id_or_locator`, `screenshot_ref`, `bbox_px`, `text_callout`, `semantic_review`.
4. Render overlay preview untuk **SEMUA** target, bukan satu persegi per aktivitas bila aktivitas menjelaskan beberapa kontrol penting. Review terhadap gambar penuh, lihat apakah highlight benar-benar menutupi tombol/field yang dimaksud.
5. Reviewer visual yang independen dari pembuat bbox harus memberi **PASS/FAIL per target** dan melampirkan alasan dan bukti preview. Penguji harus bisa mengoreksi lokasi. Tidak boleh PASS karena JSON nonzero atau karena previous AI berkata verified.
6. Gate kuat: **0 placeholder `[0,0,0,0]`, 0 semantic target mismatch, 0 source screenshot mismatch, 0 label menyebut tombol yang berbeda**, pada semua callout yang akan dipakai dalam guidebook.
7. Untuk state UI disabled, anotasi harus secara eksplisit menyebut disabled; jangan menjelaskan seolah tombol sudah aktif.

---

## 8 — KEBIJAKAN PRODUKSI READ-ONLY DAN DOSSIER PENGECUALIAN

Klasifikasikan aksi: `SAFE_READ_ONLY_VERIFIED`, `SAFE_UI_LOCAL_VERIFIED`, `MUTATIVE_DEFERRED`, `UNKNOWN_SAFETY_BLOCKED`, `ROLE_BLOCKED`. Aman hanya jika ada bukti memadai. 

Untuk setiap deferred, wajib `deferred_feature_id`, `parent_module_id`, `display_label`, `entry_point`, `visible_state_and_screenshot`, `ui_fields_if_safely_seen`, `why_mutative`, `what_is_not_tested`, `staging_test_plan`, `owner_confirmation_needed`, `allowed_guidebook_text`, `prohibited_guidebook_text`, `linked_outline_section`.

Aksi wajib dicatat minimal: Kirim Konsultasi; Simpan/Ubah Harga; Duplikat; Apply/Arsip Diskon; Tambah Diskon; Tambah Merk; Tambah Tipe; Tambah/Upload Brosur; Sync User dan Org Units. Tambah/Edit/Hapus/Publish yang benar-benar ditemukan harus dilampirkan. Jumlah deferred boleh lebih dari tujuh karena inventaris baru harus dilengkapi. **Tidak boleh klik eksekusi**.

UI Form mutatif yang aman hanya boleh dibuka bila benar-benar telah terbukti tidak melakukan perubahan/side-effect. Jika belum pasti, cukup foto tombol, baca source code, tandai `SAFETY_BLOCKED` dan lanjut. Jangan memalsukan screenshot form.

---

## 9 — PRIVASI, KEAMANAN, DAN KONSISTENSI PAKET

- Sanitasi screenshot (nomor, email, nama pribadi, foto, alamat, pelanggan, identitas karyawan), HTML, atribut/data JSON, log network, source diff, dan metadata EXIF bila relevan.
- Sanitasi bukan menghapus atribut yang dibutuhkan audit secara serampangan: pertahankan struktur tag/label dan ganti hanya nilai rahasia dengan placeholder konsisten seperti `[REDACTED_CSRF_TOKEN]`, `[REDACTED_PHONE]`, `[REDACTED_EMAIL]`.
- File sesi/cookie/token asli tidak boleh ikut ZIP distribusi. Jangan mengunggah source code berisi secret. Tetap simpan master historis di workspace terlindungi tanpa perubahan.
- File ZIP menggunakan **path relatif POSIX `/`**, tidak boleh `..`, path absolut, symlink berbahaya, duplicate entries, atau path Windows `\`.
- Seluruh referensi JSON menggunakan **relative POSIX paths**, SHA256 aktual, metadata dimensi, tipe file, versi, capture time, dan source provenance. Buat `MANIFEST.json` terstruktur dan `README_START_HERE.md` dengan petunjuk membuka dataset.
- Uji bahwa ZIP bisa dipindahkan ke folder berbeda dan tetap dapat dibaca serta relasi utuh. Sertakan file audit hash ZIP secara **eksternal** setelah paket dibekukan.

---

## 10 — STANDAR OUTPUT DATA (KONTRAK MINIMUM, BUKAN SEKADAR NAMA FILE)

Di dalam root run baru (misalnya `runs/V4_2_feature_closure_<RUN_ID>/`), keluarkan:

```text
README_START_HERE.md
MANIFEST.json
discovery/
  module_inventory_final.json
  feature_inventory_final.json
  ui_control_registry.json
  candidate_feature_registry.json
  entrypoint_matrix.json
  role_access_limitations.json
  control_to_feature_reconciliation.json
  candidate_to_inventory_reconciliation.json
  unresolved_discovery_register.json
coverage/
  module_feature_activity_map.csv
  feature_to_activity_coverage.json
  feature_to_outline_mapping.json
  screenshot_coverage.json
  coverage_summary.json
  deferred_register.json
activities/
  ACT-*.json
states/
  STATE-*.json
transitions/
  TRANS-*.json
evidence/
  evidence_index.json
  source_index.json
  screenshots_sanitized/
  html_sanitized/
  annotation_previews/
annotations/
  plans/*.json
  semantic_review.json
deferred_dossiers/
  FEAT-*.json
guidebook_ready/
  guidebook_blueprint_final.md
  guidebook_outline_structured.json
  guidebook_content_stubs.md
  cross_reference_index.json
  missing_information_requests.md
reports/
  baseline_integrity.json
  security_privacy_scan.json
  production_request_safety.json
  orphan_evidence_report.json
  discovery_passes_D1_D5.json
  QA_A_SCHEMA_LINKS.json
  QA_B_VISUAL_SEMANTIC.json
  QA_C_FINAL_ZIP_REOPEN.json
  release_readiness.json
  release_readiness.md
  freeze_record.json
```

Semua data harus berasal dari observasi/hasil yang ada. Bila nama folder di workspace berbeda, boleh gunakan padanan namun wajib sediakan manifest canonical serta mapping kompatibilitas ke V4.1. Jangan memutus file atau link lama. Jangan menyalin token/sesi mentah demi memenuhi file count. Nama/jenis file bukan sukses: **isi dan relasinya harus benar-benar diperiksa**.

### Contoh satu item registry (sesuaikan fakta aktual)

```json
{
  "control_id": "CTRL-<stable_id>",
  "module_id": "MOD-<existing_or_new>",
  "feature_id": "FEAT-<canonical_id>",
  "activity_ids": ["ACT-<verified_if_any>"],
  "ui_label_exact": "<verbatim_visible_label>",
  "entry_point_state_id": "STATE-<id>",
  "visible": true,
  "enabled": false,
  "classification": "MUTATIVE_DEFERRED",
  "evidence_ids": ["EVD-<id>"],
  "allowed_claim": "Tombol tersedia namun belum bisa digunakan pada state ini",
  "not_verified": ["efek sesudah aktivasi", "aturan backend"],
  "mapped_guidebook_section": "SEC-<id>",
  "disposition": "DEFERRED_WITH_DOSSIER"
}
```

Contoh di atas merupakan **SKEMA ILUSTRATIF**, bukan klaim nilai aktual. Semua placeholder wajib diisi dengan nilai/bukti nyata pada output final.

---

## 11 — QUALITY GATES FINAL, HAK VETO, DAN ATURAN PASS/FAIL

**Setiap gate memiliki syarat logis yang dievaluasi otomatis berdasarkan data mentah, dan reviewer menyertakan bukti independen.** Jangan menggunakan angka tetap V4.1 (21 fitur, 14 activity, 31 evidence) setelah discovery bertambah. Hitung ulang denominator secara aktual.

| Gate | Syarat PASS | FAIL / BLOCKED bila |
|---|---|---|
| QG01 Safety | Tidak ada aksi mutatif produksi terpicu selama run; klasifikasi action lengkap, log klien diperiksa | Ada aksi berpotensi mutatif tak diblokir; pembuktian server dipalsukan |
| QG02 Historical integrity | Baseline manifest/hash sama untuk file lama yang dapat diuji | Ada file lama berubah atau tidak diperiksa tetapi diklaim PASS |
| QG03 Security & privacy | Tidak ada secret/PII yang terdeteksi dalam semua file distribusi setelah scan multi-metode + review sampel visual | Token/PII ditemukan atau scanner hanya mencari satu pola dan mengklaim absolut |
| QG04 Navigation / entrypoints | Semua menu/route/global UI yang dapat diakses dipetakan serta disambungkan ke canonical module | Ada entry point tanpa disposisi |
| QG05 UI control inventory | **A-C unresolved=0** untuk kontrol actionable yang teramati | Kontrol seperti Tambah Merk/Tipe/Diskon/Download/Filter masih tidak tercatat |
| QG06 Candidate reconciliation | **B-C tanpa disposisi=0**; yang tak bisa dilihat dicatat Unknown/Blocked | Kandidat DOM/kode lenyap tanpa alasan |
| QG07 Feature-to-activity mapping | **C-D tanpa disposisi=0**; seluruh read-only punya aktivitas atau blocker, deferred punya dossier | Brosur List atau fitur lain tanpa aktivitas/dossier |
| QG08 Reverse activity trace | **D-C orphan=0**; tiap aktivitas dan section punya feature/evidence yang sah | Panduan menulis fitur fiktif |
| QG09 Evidence integrity | Semua screenshot/HTML/state/transition sesuai path/hash, before/after, jumlah, dan timestamp yang masuk akal | Broken link, hash tidak cocok, empty state salah |
| QG10 Annotation geometry+semantics | 100% callout yang digunakan benar target dan state, overlay visual diperiksa independen | Satu target salah, meski koordinat valid |
| QG11 Deferred completeness | Semua kontrol mutatif yang teramati punya dossier + lokasi outline, tanpa eksekusi produksi | Tombol mutatif hilang atau hasil diada-adakan |
| QG12 Guidebook information architecture | 100% fitur in-scope terhubung ke bagian/aktivitas sebelum freeze, tidak ada bab liar/terduplikasi | Fitur baru diketahui tapi belum diberi tempat |
| QG13 Consistent QA metrics | `passed_items == tested_items` jika PASS, denominator sinkron antarsemua laporan | Klaim PASS padahal 1/3 atau 2/3 |
| QG14 Portable secure package | Semua relative POSIX path, tanpa rahasia, manifest dan file ada, tidak ada duplicate/path traversal | ZIP tidak portabel atau ada secret |
| QG15 Independent final ZIP audit | QA C membuka **ZIP yang sudah final**, mengecek ulang QG03–QG14 dan hash sidecar yang dibuat sesudah ZIP dibekukan | QA C tidak ada, checksum placeholder, laporan merujuk ZIP lain |
| QG16 Coverage limitations honesty | Batas role, tenant, viewport, kode unavailable, staging dan aksi deferred tertulis jelas | Klaim semua fitur/role terverifikasi tanpa akses |
| QG17 Freeze proof | Berita acara freeze menyebut jumlah aktual, hashes, modul/feature map, owner/open blockers dan versi; tak ada unresolved in-scope | Kerangka dibekukan ketika kontrol penting belum terpetakan |

**Aturan evaluasi mutlak:** satu gate wajib FAIL/BLOCKED → **bukan `GO_WITH_DOCUMENTED_EXCEPTIONS` untuk keseluruhan source of truth**. Pengecualian yang diterima hanya jenis eksekusi mutatif / akses terbatas yang terdokumentasi dengan baik, bukan data hilang, anotasi salah, secret bocor atau QA yang belum dilakukan.

### QA wajib tiga tahap

- **QA A — Integritas, skema, cakupan**: dijalankan setelah enrichment atas output baru. Periksa seluruh relasi, selisih himpunan A–D, signoff safety, keamanan, dan readiness masing-masing fitur.
- **QA B — Review visual SEMUA target dan isi**: reviewer terpisah dari pembuat rencana. Buka screenshot, baca CTA/text, cek bbox, interaksi sebelum/sesudah, serta label sesuai UI. Perbaiki lalu jalankan ulang QA A dan QA B jika output berubah.
- **QA C — Audit ZIP FISIK setelah dibekukan**: selesai membuat ZIP, **buka file ZIP itu sendiri** dalam folder scratch/temp read-only, bukan folder sumber; validasi isi, manifest, 100% link/hash, secret, dokumentasi, semua gate, versi dan nama paket; hasil QA C disimpan di luar ZIP atau tercakup secara benar melalui dua fase pengemasan yang tidak membentuk hash sirkular. Jika artefak internal berubah setelah QA C, buat ulang paket dan audit ulang. **Hash SHA256 ZIP disimpan di sidecar `.sha256` setelah selesai; tidak boleh placeholder.**

Laporan setiap gate wajib menampilkan: `gate_id`, `status`, `tested_items`, `passed_items`, `failed_items`, `blocked_items`, `artifact_paths`, `finding_ids`, `reviewer`, `timestamp`, `notes`. Jika `blocked_items > 0`, jelaskan mengapa itu exception yang diizinkan atau kegagalan. Jangan memaksa semua BLOCKED menjadi PASS.

---

## 12 — KRITERIA RELEASE / STATUS GUIDEBOOK

Pisahkan tiga status agar tidak menipu kualitas:

1. **`FRAMEWORK_READY`**: semua fitur **teramati dan berada dalam cakupan** memiliki tempat di kerangka final; jumlah orphan=0; daftar keterbatasan discovery tersedia; metadata relevan terhubung. Saat ini tidak mensyaratkan aksi mutatif selesai.
2. **`VISUAL_AND_READONLY_READY_WITH_DOCUMENTED_EXCEPTIONS`**: semua aktivitas read-only yang aman telah didokumentasi dan lolos QA visual, seluruh aksi mutatif terdokumentasi sebagai deferred; file distribusi aman dan dapat dilacak. Ini adalah **TARGET GO utama**.
3. **`FULL_MUTATIVE_PROCEDURES_VERIFIED`**: baru dapat diklaim bila prosedur tulis data telah benar-benar diuji di staging/izin yang sesuai, termasuk efek sesudah tindakan; **bukan target run produksi ini**.

Jika keseluruhan butir QG kritis lulus dan pengecualian mutatif benar-benar tercatat, putuskan `GO_WITH_DOCUMENTED_EXCEPTIONS` dan kunci `guidebook_blueprint_final.md`. Bila belum, putuskan `PARTIAL_GO` atau `NO_GO` dengan daftar blocker dan langkah perbaikan spesifik. Jangan menutup project hanya dengan status generik.

### FREEZE RECORD wajib

Buat `freeze_record.json` yang memuat:
- nama aplikasi, lingkungan, timestamp, run ID, hash artifact, daftar modul/fitur/aktivitas **aktual**;
- daftar fitur/candidate/controls yang in-scope dan status, pengecualian deferred, role/viewport/source code limitations;
- total `unresolved_in_scope_controls`, `unmapped_readonly_features`, `undocumented_deferred_actions`, `orphan_activities`, `unreviewed_annotations`; untuk freeze GO, seluruh angka ini harus **0**;
- seluruh bagian guidebook yang disetujui berdasarkan data dan crosswalk ID;
- sinyal perubahan sistem setelah tanggal capture yang akan memicu `REVALIDATION_REQUIRED` bila nantinya ditemukan.

**Tidak ada sistem scraping yang dapat menjamin fitur tersembunyi yang tidak tersedia untuk role yang diaudit tidak akan pernah ditemukan kelak.** Oleh karena itu, klaim akhir yang jujur: **fitur yang terlihat/dapat ditemukan dalam lingkup akses yang disediakan telah direkonsiliasi, fitur tidak teramati diberi batasan yang jelas**. Ini adalah standar kualitas profesional yang bisa dibekukan tanpa janji absolut yang tak dapat dibuktikan.

---

## 13 — LANGKAH EKSEKUSI WAJIB, JANGAN BERHENTI PADA RENCANA

1. **Read-only preflight:** pelajari workspace, ZIP V4.1, audit independen, kompatibilitas versi dan struktur; buat baseline hash; pastikan target environment produksi dan batas akses.
2. **Build candidate index:** kumpulkan seluruh route, fitur global, komponen, screenshot, DOM, kode, dan menu dari referensi yang tersedia; buat register kandidat, termasuk yang hidden/role-gated.
3. **Execute discovery passes D1–D4:** navigasi aman, observasi state, ukur target, kumpulkan bukti tambahan untuk kontrol yang masih kurang; skip aksi yang tidak terbukti aman.
4. **Reconcile D5:** bandingkan A, B, C, D; tambahkan fitur yang hilang serta dossier deferred; semua ketidaksesuaian harus diresolusikan atau dicatat sebagai blocker/out-of-scope yang sah.
5. **Rebuild guidebook crosswalk & outline:** susun struktur final seluruh modul dan aktivitas sekaligus; pastikan tidak ada fitur tiba-tiba masuk di tengah produksi; dokumentasikan pertanyaan owner.
6. **Repair annotations:** koreksi minimal 5 temuan V4.1 dan lakukan review ulang **semua** visual; render overlay preview dan periksa kelayakan teks untuk Word A4.
7. **Secure export:** sanitasi seluruh sumber (termasuk token dan PII), hitung hash, bangun indeks/manifest, hindari folder sessions.
8. **Run QA A + QA B**, perbaiki FAIL yang aman, ulangi sampai seluruh gate yang relevan benar-benar memenuhi syarat atau laporkan blocker yang tidak bisa diselesaikan.
9. **Create ZIP final + sidecar SHA256**, kemudian **jalankan QA C independen pada ZIP fisik**; perbaikan apa pun sesudah itu harus memicu rebuild + re-audit.
10. **Freeze** struktur guidebook bila seluruh kriteria `GO_WITH_DOCUMENTED_EXCEPTIONS` lulus; keluarkan ringkasan jumlah modul/fitur/aktivitas final, matriks cakupan, unresolved, role/akses, daftar deferred, dan daftar materi yang siap langsung diproduksi.
11. **Jangan berhenti hanya karena ada aksi mutatif yang diblokir** — itulah pengecualian yang sengaja diizinkan. Kerjakan seluruh pengamatan/read-only yang aman terlebih dahulu.
12. Bila terdapat ketidakpastian yang tidak bisa diperbaiki tanpa akses/otorisasi tambahan, sebutkan batas dan kebutuhan tepatnya. Jangan mengarang keberhasilan. **Lebih baik PARTIAL_GO yang jujur daripada GO palsu.**

### Ringkasan laporan akhir yang WAJIB ditampilkan

- **Final modules:** `N` (+ perubahan terhadap 9 baseline, bukti perubahannya).
- **Final features:** `N` (READ_ONLY, UI_ONLY, DEFERRED, BLOCKED, OUT_OF_SCOPE dirinci).
- **Final activities:** `N` (+ verified, visual-only, deferred).
- **Controls:** observed `N`, mapped `N`, unresolved `N`.
- **Evidence:** screenshot `N`, HTML `N`, transitions `N`, verified annotations `N`.
- **Reconciliation:** `A-C`, `B-C`, `C-D`, `D-C` jumlah unresolved dan disposisinya.
- **Production safety:** yang benar-benar dibuktikan vs hal yang tidak memiliki audit server.
- **Data integrity:** hash dan jumlah file lama diperiksa; setiap keterbatasan verifikasi.
- **Sanitization:** item ditemukan/diredaksi/dikecualikan, scan akhir.
- **QA A/B/C:** status per gate, bukti file, bukti auditor, checksum final.
- **Guidebook readiness:** bab yang bisa langsung ditulis, bab visual-only, deferred, blocker tersisa, dan keputusan GO/PARTIAL/NO-GO.

**PERINTAH PENUTUP:** Jangan menambah label PASS hanya untuk terlihat selesai. Buat **dataset V4.2 yang benar-benar lengkap dalam lingkup yang dapat diobservasi**, tertaut, aman, dan siap menjadi root guidebook tanpa perlu menambahkan fitur yang telah diketahui di tengah proses. Jika fitur tidak dapat diuji tanpa merusak produksi, **catat keberadaan dan posisinya dengan benar, lalu defer eksekusinya**. Hasilkan artefak final, jalankan audit ZIP terakhir, dan berikan hanya klaim yang benar-benar didukung bukti.
