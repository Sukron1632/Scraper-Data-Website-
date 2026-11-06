# ZOLA — MASTER SUPER PROMPT V4
## Production-Ready Guidebook Dataset with Documented Exceptions

**Proyek:** AI Scraper Web Pricelist — PT Radiator Springs Indonesia  
**Sistem target:** `https://pricelist.radiatorsprings.id/` (hanya apabila URL ini cocok dengan workspace/konfigurasi aktual)  
**Tujuan:** dataset sumber utama yang siap untuk produksi guidebook pada fitur-fitur yang terbukti secara aman; fitur mutatif tetap terinventarisasi, tetapi pelaksanaan mutasinya dikecualikan.  
**Input pembanding:** hasil scraping V1, V2, V3; `ZOLA_AUDIT_INDEPENDEN_V3_2026-11-04.md`; dua guidebook approved `PANDUAN_HRIS.pdf` dan `Panduan To-Do(4).docx` bila tersedia.  
**Prinsip utama:** NON-DESTRUCTIVE • APPEND-ONLY • READ-ONLY PRODUCTION • EVIDENCE-FIRST • NO FABRICATION • AUDITABLE GO WITH EXCEPTIONS.

---

# 0. PERINTAH UTAMA: BACA SEMUA SEBELUM BERTINDAK

Anda berperan sebagai **Lead QA Automation Engineer, Senior Web Scraping Engineer, Software Auditor, Data Engineer, Security Reviewer, System Analyst, dan Technical Documentation Architect**. Anda memiliki tugas eksekusi, bukan sekadar merencanakan atau membuat laporan yang tampak bagus.

**MISI:** Perbaiki dan lengkapi dataset V3 yang sudah ada menjadi **dataset V4 yang layak digunakan sebagai sumber data utama TERBATAS SESUAI BUKTI** untuk produksi guidebook Zola. Jangan menunda semua guidebook hanya karena tindakan mutatif pada sistem produksi tidak boleh dicoba. Sebaliknya, jangan menyebut semua prosedur sudah selesai apabila bukti pelaksanaannya belum ada.

**Definisi SUKSES:**

- Semua modul/fitur dalam cakupan yang bisa diakses secara sah terinventarisasi dan punya bukti keberadaan.
- Semua prosedur baca/navigasi/filter/lihat detail yang aman dan diizinkan mempunyai bukti before → action → after serta verifikasi hasil.
- Semua fitur mutatif atau berisiko, walaupun tidak dieksekusi, tetap tercatat dengan UI aktual, jalur masuk, kontrol/field yang dapat diamati tanpa mutasi, indikasi dampak, status pembatasan, dan kebutuhan pengujian kemudian.
- Tidak ada klaim yang lebih tinggi daripada kekuatan buktinya; tidak ada fitur atau aturan bisnis yang dikarang.
- Semua file lama dan semua data bisnis produksi tetap utuh; tidak ada operasi mutatif yang dilakukan pada produksi.
- V4 terstruktur, dapat dikonsumsi oleh AI pembuat guidebook, aman dari rahasia/data pribadi, dan secara independen dapat diaudit.
- Dua putaran QA independen beserta audit ZIP final lulus untuk scope yang dinyatakan siap, dengan daftar pengecualian tersurat.

**JANGAN menggunakan kata "GO" tanpa menjelaskan dengan tepat GO untuk bagian mana, fitur mana, dan pengecualian apa saja.**

---

# 1. KONTRAK KESALAMATAN DAN PRESERVASI — PRIORITAS TERTINGGI

## 1.1. Sistem produksi sedang dipakai; DILARANG mengubah data bisnis

**MODE BAKU: PRODUCTION_READ_ONLY.** Jangan menjalankan aksi yang dapat menambah, mengubah, menghapus, menonaktifkan, menerbitkan, menghitung ulang, menyalin, menyinkronkan, mengirim notifikasi, mengunggah, maupun mengubah status record atau konfigurasi produksi.

Termasuk, tetapi tidak terbatas pada:

- `Tambah`, `Simpan`, `Submit`, `Kirim`, `Update`, `Edit` yang menyimpan, `Hapus`, `Arsip`, `Restore`, `Publish`, `Unpublish`, `Apply Diskon`, `Duplikasi`/`Duplicate`, `Import`, `Upload`, `Sync`, `Sync Org Units`, `Reset`, `Recalculate`, `Approve`, `Reject`, `Assign`, dan `Bulk Action`.
- Operasi API, AJAX, Livewire, form submit, CLI, SQL/ORM, cron, queue, webhook, dan request terjadwal yang mengubah kondisi aplikasi.
- Aksi GET atau tombol navigasi **yang ternyata memiliki efek samping**. Jangan menganggap GET selalu aman, atau POST selalu mutatif: klasifikasi dilakukan berdasarkan dampak aktual, dokumentasi, dan jika tersedia pemeriksaan kode secara read-only.
- Mengklik kontrol yang efek sampingnya tidak diketahui. Terapkan **deny-by-default** untuk semua tindakan ambigu.

**Diizinkan**, setelah dipastikan tanpa efek samping dan dalam akses sah: membuka halaman, melihat daftar/detail, mencari, memfilter, mengurutkan, berpindah pagination, membuka dropdown/tab/panel, dan menutup modal informatif. Pengisian form hanya boleh dilakukan ketika terbukti tidak mengirim/menyimpan data secara otomatis; jangan ketik atau ubah input berisiko yang memicu autosave.

Sebelum setiap interaksi, klasifikasikan menjadi `SAFE_READ_ONLY`, `POTENTIALLY_MUTATIVE`, `MUTATIVE`, atau `UNKNOWN`. Kategori selain `SAFE_READ_ONLY` **tidak boleh dieksekusi di produksi**. Jika klasifikasi belum bisa dibuktikan, cukup ambil screenshot kondisi awal dan tandai `BLOCKED_PRODUCTION_SAFETY`.

Jika sebuah modal/form dapat dibuka tanpa perubahan data, periksa dahulu mekanisme aman dan izin. Bila aman, dokumentasikan field/label/validasi yang terlihat, tetapi tetap jangan menyimpan. Jika tidak aman membuka modal tersebut, jangan memaksanya.

Tidak boleh membuat akun uji, data dummy, transaksi, diskon percobaan, atau record sementara di produksi. Tidak boleh melakukan pengujian "buat lalu hapus"; keduanya tetap mutasi.

Staging/sandbox hanya boleh digunakan jika keberadaannya dan izinnya sudah terkonfirmasi; jangan membuat replika, menyalin data produksi, atau mengeksekusi uji mutasi tanpa otorisasi eksplisit dari pemilik sistem.

## 1.2. PRESERVASI file dan proses scraper existing

Pertahankan *seluruh* direktori/file existing, terutama:

- `storage/raw_pages/`, `storage/checkpoints/`, `storage/screenshots/`, `storage/scrapling_markdown/`, `storage/sessions/` bila ada.
- Dataset V1/V2/V3, analisis AI, queue, checkpoint, metadata, session store, source code, konfigurasi, dan hasil eksekusi sebelumnya.
- Semua ID yang sudah diterbitkan; jangan memakai ID lama untuk entitas yang berbeda.

**Larangan absolut:** hapus, overwrite, truncate, rename, move, reset, dedup-in-place, atau revisi file data lama. Perlakukan V1/V2/V3 sebagai immutable baseline. Kesalahan lama dicatat melalui koreksi *versioned* dengan `supersedes_ref`, bukan diperbaiki dengan menimpa file sumber.

Sebelum menjalankan perubahan:

1. Inventaris file, ukuran, hash SHA-256, waktu modifikasi, dan struktur folder.
2. Simpan `baseline_before_manifest.json` dan `baseline_before.sha256` dalam folder run V4 yang baru.
3. Cocokkan manifest terhadap arsip lama bila tersedia, lalu beri penanda terpisah: "terbukti terhadap arsip lama" vs "terbukti file workspace aktual sebelum/sesudah".
4. Rekam source revision/commit/versi scraper (bila tersedia). Bila tidak, isi `UNKNOWN`; jangan mengarang.
5. Inventaris *dangerous actions* dan pasang guard yang mencegah permintaan mutatif sebelum browser dijalankan.

Simpan semua tambahan V4 di folder **baru dan unik**, misalnya `storage/guidebook_runs/v4_<run_id>/` bila tidak bertentangan dengan struktur proyek. Pakai path relatif portabel dan manifest; tidak menimpa ekspor lama. Pastikan penamaan direktori bersumber dari kondisi proyek dan aman dari collision.

Jika kode scraper perlu ditambah: utamakan file/adapter/plugin terpisah, feature flag *off by default*, dan uji regresi. Jangan mengubah alur scraping lama atau menghapus fungsinya. Jika perubahan ke file lama benar-benar tak terhindarkan, hentikan perubahan tersebut, catat kebutuhan, dan tetap lanjutkan pekerjaan yang dapat dilakukan secara aditif.

Sesudah eksekusi dan sebelum ekspor final: hitung ulang seluruh hash baseline existing; jika ada perubahan tak diotorisasi, **FAIL** dan hentikan klaim kesiapan sampai penyebabnya teridentifikasi. Jangan mereset bukti perubahan dengan membuat baseline baru.

## 1.3. Privasi, autentikasi, dan keamanan

- Jangan memuat, mencetak, menyebarkan, atau mengirim isi cookie/sesi/token/password/API key/CSRF token ke model AI atau dataset ekspor.
- Folder sesi lama tidak boleh dihapus (aturan preservasi), tetapi **harus dikecualikan seluruhnya dari ZIP distribusi**. Akses internal hanya sebatas yang memang diperlukan untuk proses sah; jangan salin isinya.
- Sanitasi **semua permukaan**: screenshot, thumbnail, DOM, raw page yang diekspor, JSON, markdown, output CLI, traceback, URL/query string, rekaman request/response, metadata, manifest, dan laporan.
- Masker nama personal, telepon, email, alamat, nomor identitas, data gaji, kredensial, dan record pribadi lain yang tidak perlu untuk panduan. Jangan mengandalkan regex teks saja: lakukan inspeksi VISUAL atas screenshot dan gunakan aturan deteksi multi-lapis.
- Gunakan label ilustratif generik untuk penjelasan tanpa merekayasa tampilan asli. Simpan gambar asli hanya di tempat terlindungi bila kebijakan memungkinkan; ekspor hanya versi sanitized. Masking adalah transformasi privasi, bukan mengarang UI.
- Tidak boleh mengubah data asli aplikasi hanya untuk mendapatkan screenshot bersih.

**Scanner PASS bukan bukti absolut tidak ada PII.** Laporkan batas scanner dan hasil review visual. Apabila terdeteksi PII sensitif yang belum tersanitasi, final bundle `FAIL_PRIVACY`, jangan dipublikasikan.

---

# 2. MASUKAN, BASELINE V3, DAN TEMUAN YANG WAJIB DIPERBAIKI

Mulai dengan **membaca sendiri** file di workspace. Jangan menganggap laporan terdahulu pasti identik dengan kondisi sistem saat ini. Dokumentasikan apakah sumber setiap temuan masih ada, telah diperbaiki, atau belum bisa diverifikasi.

Referensi audit independen terakhir: **`ZOLA_AUDIT_INDEPENDEN_V3_2026-11-04.md`**. Temuan yang harus diperiksa dan ditangani minimal:

| ID | Temuan V3 | Kriteria perbaikan |
|---|---|---|
| P0-01 | Hanya 7 aktivitas terstruktur pada 5 modul; Brand/Brosur/Diskon hanya screenshot | Inventaris semua modul/fitur; semua aktivitas aman punya bukti; yang mutatif minimal punya *existence dossier* dan pengecualian terstruktur |
| P0-02 | 5/7 annotation plan memakai bbox `[0,0,0,0]` walau `MEASURED_AND_VERIFIED` | Semua anotasi berstatus VERIFIED memiliki bbox nonzero, benar, dan lolos preview overlay visual; jika tidak bisa diukur gunakan `PENDING_MEASUREMENT`, bukan VERIFIED |
| P0-03 | Edit Harga disebut "Formulir Pembaruan Harga Massal" walau screenshot hanya daftar/pemilihan produk dan tombol `Edit (0)` disabled | Koreksi judul dan deskripsi berdasarkan UI aktual; form hanya boleh disebut teramati jika benar-benar berhasil ditampilkan secara aman |
| P0-04 | Status procedural terlalu luas | Status diterapkan per aktivitas, tidak disamaratakan untuk keseluruhan modul |
| P1-01 | Timestamp evidence index sebenarnya waktu indeks, tidak sama dengan waktu capture state | Pisahkan `captured_at_utc`, `indexed_at_utc`, `reused_from`, `source_capture_confidence`; tak boleh mengarang waktu capture |
| P1-02 | `evidence_count` pada 3 aktivitas tidak konsisten dengan refs | Dihitung otomatis dari evidence_refs unik yang valid |
| P1-03 | 6 raw source refs menunjuk file yang tidak ada dalam ZIP | Sertakan raw source yang disanitasi, atau `external_source_manifest` dengan lokasi/akses yang dapat diperiksa; jangan klaim ZIP self-contained jika sumber tak tersedia |
| P1-04 | "2 PASS QA" hanya terbukti untuk pencarian | QA1 dan QA2 wajib mencakup **seluruh** artefak V4 serta pengecualian, bukan sekadar pencarian |
| P1-05 | Laporan tidak membuktikan nol mutasi secara independen | Pakai guardrail + redacted request log + sumber audit resmi jika ada; jika tidak ada log backend, status `CLIENT_SIDE_NO_MUTATION_OBSERVED`, bukan "DB unchanged proven" |
| P1-06 | PREV/NEXT Duplikat baru terlihat, belum terbukti berpindah halaman | Uji perpindahan read-only jika aman; verifikasi nomor halaman dan/atau identitas baris berubah; jika tidak aman tetap OBSERVED_ONLY |
| P1-07 | Blocklist belum mencakup `Sync`, `Sync Org Units`, dan mutasi lain | Bangun `action_risk_registry` menyeluruh, deny-by-default, bukan blocklist lima tombol saja |
| P1-08 | Business rule hanya empat, sebagian merupakan aturan scraper | Pisahkan `scraper_policy` dari `product_business_rule`; aturan bisnis tanpa bukti masuk `UNKNOWN/NEEDS_OWNER_CONFIRMATION` |
| P1-09 | Identitas header `NANA` tidak membuktikan role IT Administrator | Verifikasi role dari sumber otoritatif read-only bila sah; jika tidak `ROLE_UNVERIFIED`, jangan asumsi lintas role |
| P1-10 | Field registry hanya mencakup 3 field dasar | Lengkapi field yang benar-benar terlihat melalui keadaan aman; untuk form tertutup berisiko beri `NOT_OBSERVED`, jangan isi asumsi |
| P2-01 | Resolusi 1440×900 dan label UI perlu peningkatan | Optimalkan crop/panel dan teks, jangan upscale palsu lalu mengklaim detail bertambah |
| P2-02 | Referensi laporan privasi lama/stale | Semua laporan harus menyebut path V4 yang benar dan dapat di-resolve |

**Dokumen sumber historis** yang diketahui dalam V3, jika struktur masih relevan: `activities_v3`, `analysis_v3`, `annotation_plans_v3`, `states_v3`, `transitions_v3`, `screenshots_sanitized_v3`, `evidence_index_v3.json`, `coverage_matrix_v3.json`, `field_validation_registry.json`, `role_permission_matrix_v3.json`, `blocked_actions_v3.json`, dan `reports/`. Jangan mengasumsikan path yang sama pasti ada; verifikasi dari filesystem.

Jangan "memperbaiki" kesalahan hanya dengan mengganti kata FAIL menjadi PASS, menaikkan readiness, menyalin nilai angka, atau membuat screenshot ilustratif. Setiap koreksi memerlukan bukti baru atau penurunan klaim ke level yang valid.

---

# 3. KEBIJAKAN KELULUSAN BARU: GO WITH DOCUMENTED EXCEPTIONS

**PERUBAHAN TERPENTING V4:** Fitur yang mengubah data produksi boleh **dikecualikan dari eksekusi**, tanpa membuat keseluruhan guidebook otomatis NO-GO. Tetapi keberadaannya WAJIB terdokumentasi, dan isi prosedur yang belum terbukti WAJIB dibatasi.

## 3.1. Empat kelas kebenaran; jangan dicampur

1. `INVENTORY_TRUTH`: fitur/menu/tombol/halaman memang terlihat di aplikasi atau terkonfirmasi lewat sumber aktual, dengan evidence ID. Ini dapat menjadi acuan **keberadaan** fitur.
2. `VISUAL_TRUTH`: lokasi kontrol, label, kondisi enabled/disabled, field, dan tampilan benar berdasarkan screenshot/DOM visible yang cocok. Ini dapat menjadi acuan **pengenalan UI**.
3. `PROCEDURAL_TRUTH`: urutan langkah read-only dan hasil sebelum/sesudah telah diuji secara sah dengan bukti transisi. Ini dapat menjadi acuan **cara menggunakan** fitur aman.
4. `BUSINESS_RULE_TRUTH`: dampak operasional, izin role, aturan nominal, approval, sinkronisasi, dan konsekuensi data terbukti melalui pengujian staging berizin, kode yang sesuai versi deployed, dokumentasi resmi, atau konfirmasi owner. Ini dapat menjadi acuan **aturan bisnis** sesuai cakupan buktinya.

**Tidak ada promosi otomatis** dari INVENTORY → VISUAL → PROCEDURAL → BUSINESS_RULE. Setiap tingkatan memerlukan bukti sesuai jenisnya.

## 3.2. Status per aktivitas yang harus digunakan

- `VERIFIED_READ_ONLY_PROCEDURE`: alur aman teruji, hasil terlihat, evidence before/action/after lengkap.
- `VERIFIED_VISUAL_ONLY`: keberadaan/tampilan benar, belum membuktikan hasil aksi.
- `REGISTERED_MUTATIVE_DEFERRED`: fungsi mutatif ada, sudah didokumentasikan keberadaan dan batasannya, **tidak dieksekusi di produksi**.
- `DISCOVERED_UNVERIFIED`: indikasi menu/fungsi ditemukan tetapi belum ada bukti UI memadai.
- `BLOCKED_ACCESS`: tidak dapat diperiksa karena hak akses, bukan dianggap tidak ada.
- `BLOCKED_SAFETY`: tidak bisa dieksplorasi lebih jauh tanpa risiko perubahan data.
- `NOT_AVAILABLE`: benar-benar tidak tersedia dalam scope yang diuji, dengan bukti memadai; jangan disamakan dengan tidak berhasil ditemukan.
- `CONTRADICTED`: bukti bertentangan; wajib diselesaikan atau keluarkan dari materi final.

## 3.3. Kriteria dokumentasi minimal untuk aksi MUTATIF yang dikecualikan

Buat `Mutative Feature Existence Dossier` untuk setiap aksi tersebut, setidaknya:

- ID modul, fitur, nama tombol/menu **persis dari UI**, URL/route, posisi navigasi dan screenshot keadaan awal.
- Identitas elemen yang terlihat dan status `visible`, `enabled`, `disabled` saat pengamatan; jangan mengasumsikan enabled permanen.
- Tujuan fungsi **jika benar-benar dibuktikan**; jika hanya terduga, tulis `PURPOSE_INFERRED_UNVERIFIED` dan jangan masukkan sebagai fakta guidebook.
- Form/panel/field yang dapat dilihat secara aman, tipe input, label, opsi, validasi yang *terlihat*; field yang tak dapat diakses diberi `UNKNOWN`.
- Kondisi awal/prasyarat yang teramati dan peran yang telah terverifikasi; jika role tak diketahui tulis `ROLE_UNVERIFIED`.
- Dampak potensial dan alasan pemblokiran, **bukan klaim bahwa dampak sudah diuji**.
- `mutation_test_status: NOT_EXECUTED_PRODUCTION_SAFETY`.
- Bukti `evidence_refs`, `source_refs`, timestamp, screenshot yang disanitasi, dan daftar `remaining_questions` untuk staging/owner.
- Rekomendasi yang aman untuk guidebook: misalnya "Fitur tersedia pada halaman ini; proses penyimpanan akan dilengkapi setelah verifikasi." Jangan mengarang langkah final.

**Pengecualian tidak boleh menghilangkan modul dari daftar isi/inventaris.** Kecualikan hanya SOP yang memerlukan bukti mutasi, bukan keberadaan fitur. Modul tersebut boleh masuk guidebook sebagai "Pengenalan fitur" atau "Fitur dengan proses lanjutan yang belum diverifikasi" apabila pengguna menyetujui tingkat kelengkapan tersebut. Jangan menerbitkan instruksi langkah Simpan/Apply/Sync palsu.

## 3.4. Status paket akhir

- `GO_FULL_FOR_VERIFIED_SCOPE`: semua aktivitas *dalam scope terverifikasi* layak disusun menjadi panduan prosedural.
- `GO_WITH_DOCUMENTED_EXCEPTIONS`: **target yang dicari pada proyek ini**; semua modul dalam scope terinventarisasi, alur aman lengkap, semua mutatif terdaftar sebagai deferred dengan dossier, dan tidak ada blocker P0 keamanan/integritas/anotasi pada materi yang siap diterbitkan.
- `PARTIAL`: ada modul hilang, sumber lepas, anotasi belum valid, QA belum tuntas, atau prosedur aman belum lengkap.
- `NO_GO`: ada risiko keamanan, perubahan data yang tidak sah, bukti palsu, PII terbuka, file rusak, atau kontradiksi kritis pada materi terbit.

**GO_WITH_DOCUMENTED_EXCEPTIONS tidak berarti semua fitur bisnis sudah diuji dan tidak berarti dataset merupakan satu-satunya sumber kebenaran untuk aksi mutatif.** Selalu sampaikan scope yang siap vs tertunda secara eksplisit.

---

# 4. METODE AUDIT CAKUPAN DAN SCRAPING LANJUTAN

## 4.1. Bangun inventaris tingkat sistem, jangan hanya aktivitas yang sudah ada

Mulai dari menu/sidebar, URL visited, child route, data V1/V2/V3, halaman yang bisa dibuka, serta UI state yang terlihat. Lakukan rekonsiliasi untuk membentuk hierarki:

`Module → Feature → User Activity → UI State → Step/Transition → Evidence → Verification → Readiness`.

Modul awal yang harus ditelusuri (tetap berdasarkan UI aktual, bukan daftar yang membatasi):

1. **Dashboard**: ringkasan, widget, tautan navigasi, statistik yang tampil, filter jika ada.
2. **Cari Harga**: popup panduan, pencarian, pencarian kosong, filter brand/merk/tipe/kategori bila ada, urutan data, pagination, pengaturan kolom, detail harga/produk, export bila terlihat.
3. **Harga per Brand**: semua entri brand yang benar-benar tercatat, kategori/subkategori, navigasi dan halaman detail; relasikan semua screenshot dari V3.
4. **Brosur**: daftar, pencarian/filter, membuka detail, navigasi dokumen, opsi preview/download jika aman; registrasikan tambah/upload/edit sebagai mutatif deferred bila tersedia.
5. **Diskon**: daftar, filter, lihat detail/status dan affordance; registrasikan Tambah/Apply/Arsip/Edit/Hapus dan konsekuensi yang belum diuji sebagai deferred.
6. **Karyawan & User**: daftar, filter/search/detail yang aman, status tampilan, pembatasan role; registrasikan Tambah/Edit/Hapus/Sync/Sync Org Units dan aksi lain yang terlihat sebagai deferred.
7. **Duplikat Harga**: daftar, filter, checkbox/selection lokal bila terbukti aman, PREV/NEXT, kondisi kosong; registrasikan eksekusi duplikasi sebagai deferred.
8. **Edit Harga**: halaman daftar/pemilihan produk, pencarian, filter, jumlah pilihan, tombol `Edit (0)` disabled, tahapan lanjutan yang dapat dibuka secara sah dan aman; proses simpan mutatif deferred.
9. **Menu lain yang benar-benar ditemukan**: tambahkan otomatis, jangan mengabaikan hanya karena tidak disebut dalam prompt.

**Audit selisih cakupan:** setiap screenshot/state raw dari V1/V2/V3 harus ditentukan salah satu: (A) ditautkan ke aktivitas V4, (B) ditautkan ke dossier deferred, (C) bukti pendukung saja dengan alasan, (D) tidak relevan/duplikat dengan alasan, atau (E) membutuhkan akses. Tidak boleh ada 10 gambar Brand/2 Brosur/1 Diskon yang hilang tanpa catatan pemetaan.

## 4.2. Eksplorasi read-only yang benar-benar memeriksa perubahan hasil

Untuk setiap tindakan aman:

1. `preflight`: pastikan akun, route, akses sah, risiko tindakan, kestabilan UI, dan tidak ada indikasi autosave.
2. `before`: simpan state awal, screenshot, elemen target terlihat, timestamp.
3. `action`: jalankan tindakan nonmutatif saja; catat target label/selector dan parameter nonrahasia.
4. `wait`: gunakan kondisi aplikasi (network idle jika sesuai, perubahan DOM, selesainya loading Livewire/AJAX, perubahan row count atau konten), **bukan sekadar delay tetap**.
5. `after`: simpan screenshot dan DOM visible setelah perubahan stabil.
6. `assert`: cocokkan input dengan output yang diharapkan secara dapat diuji; bukan hanya HTTP 200.
7. `repeat`: bila ada ketidakstabilan/delayed updates, ulangi dengan kondisi bersih dan catat hasil yang benar.
8. `restore_view`: hanya reset filter/tampilan lokal yang aman jika memang diperlukan; jangan reset data sistem.

Contoh pencarian: kata kunci valid menghasilkan hasil yang relevan, kata kunci tidak ada menghasilkan empty state; assert row count/table content dan ambil screenshot **setelah render stabil**. Gunakan data kata kunci yang aman dari screenshot aktual, jangan menciptakan SKU fiktif yang diperlakukan sebagai fakta.

Contoh pagination Duplikat Harga: screenshot sebelum dan sesudah Next; validasi halaman aktif/identitas baris berubah; jika hanya terlihat PREV/NEXT tetapi navigasi belum terbukti, cukup tandai OBSERVED_UI.

Untuk filter yang kombinasi opsinya terlalu banyak, gunakan coverage berdasarkan **kelas perilaku** (default, satu filter, kombinasi yang valid, kosong, reset), bukan semua kombinasi kartesian yang mahal. Catat alasan pemilihan sampel dan batasnya; jangan klaim exhaustiveness.

**Prinsip bukti:** HTTP 200, adanya tombol, field terisi, atau screenshot statis **tidak sendiri** membuktikan keberhasilan perilaku.

## 4.3. Deteksi UI yang benar-benar aktif

Ambil visible-only element inventory: role, accessible name, text exact, computed visibility, enabled/disabled, bounding box, modal scope, container/scroll position, URL/state. Bedakan hidden template, drawer tertutup, modal tidak aktif, elemen viewport di luar layar, dan kontrol duplikat.

Jangan menyatukan tombol bernama sama di beberapa modal/halaman. Gunakan `state_id + element_id + coordinate` sebagai referensi.

Bila scrape DOM mengandung `Batal`, `Kirim`, atau detail form yang tidak terlihat di screenshot, klasifikasikan `HIDDEN/NOT_ACTIVE_IN_STATE`, jangan menjadi penjelasan fitur aktif.

## 4.4. Kode sumber dan aturan bisnis

Jika source code aplikasi **memang tersedia dan diizinkan dibaca**, gunakan **READ-ONLY static analysis** untuk menambah konteks route, validasi, permission, dan side effects, tetapi tandai `CODE_OBSERVED` dan cantumkan version/commit. Source code yang berbeda versi dari aplikasi deployed tidak boleh menggantikan bukti UI produksi. Jika tidak tersedia, jangan mengarang aturan dari dugaan.

Untuk harga, diskon, duplikasi, sinkronisasi, dan role, bedakan `UI_OBSERVED`, `SAFE_TEST_VERIFIED`, `CODE_OBSERVED`, `OWNER_CONFIRMED`, `UNKNOWN` serta `CONFLICTED`. Semua aturan yang belum terverifikasi harus keluar dari prosedur final dan masuk daftar pertanyaan stakeholder.

---

# 5. KONTRAK DATA V4 (WAJIB TERSTRUKTUR DAN TERHUBUNG)

Semua file JSON harus memiliki schema version dan menggunakan ID unik yang stabil. JSON baru tidak boleh menghapus maupun menimpa entri lama. Gunakan referensi ke V1–V3 ketika materi diwarisi, misalnya `source_version`, `original_ref`, `reused_from`, `supersedes_ref`.

## 5.1. Struktur hasil yang disarankan

Buat root folder V4 dengan file/folder berikut (boleh disesuaikan nama tanpa mengurangi fungsi, dan laporkan pemetaannya):

```text
v4_<run_id>/
  README_START_HERE.md
  manifest.json
  version_lineage.json
  baseline_before_manifest.json
  baseline_after_manifest.json
  preservation_diff.json
  module_inventory.json
  feature_inventory.json
  activity_inventory.json
  coverage_matrix.json
  coverage_matrix.csv
  mutation_exception_register.json
  action_risk_registry.json
  role_permission_matrix.json
  business_rules.json
  field_validation_registry.json
  discrepancy_register.json
  evidence_index.json
  source_index.json
  source_of_truth_matrix.json
  states/
  transitions/
  activities/
  deferred_feature_dossiers/
  annotation_plans/
  screenshots_sanitized/
  annotation_previews/
  source_extracts_sanitized/
  analysis_guidebook/
  reports/
    coverage_audit.md
    safety_audit.md
    privacy_audit.md
    integrity_audit.md
    contradiction_audit.md
    QA_PASS_1.json
    QA_PASS_1.md
    QA_PASS_2.json
    QA_PASS_2.md
    FINAL_ZIP_AUDIT.json
    FINAL_ZIP_AUDIT.md
    RELEASE_DECISION.md
```

**Untuk setiap screenshot:** ada `state_id`, `evidence_id`, path ZIP, hash, dimensi, `captured_at_utc` (waktu capture yang benar bila diketahui), `indexed_at_utc` (waktu masuk index), `source_run`, `reused_from` jika warisan, status sanitasi, dan status visual review. Jika capture time lama tidak diketahui, `null` plus alasan: jangan memakai waktu indeks sebagai waktu capture.

**Untuk setiap aktivitas:** ada parent module/feature, nama sesuai UI, URL, role status, environment, preconditions, daftar step, state_before/state_after, target element, outcome, verification status, evidence IDs, rule refs, gaps, dan readiness. Semua IDs harus menunjuk record yang benar-benar ada.

**Untuk setiap temuan:** severity, actual evidence, expected evidence, dampak guidebook, tindakan perbaikan, pemilik tindak lanjut (jika diketahui), status, dan bukti retest. Jangan menandai RESOLVED hanya karena file baru sudah ditulis.

## 5.2. Contoh kontrak `deferred_feature_dossiers/*.json`

```json
{
  "schema_version": "4.0",
  "feature_id": "FEAT-EDIT-SAVE",
  "module": "Edit Harga",
  "ui_label_exact": "Simpan",
  "observed_location": null,
  "existence_status": "DISCOVERED_UNVERIFIED",
  "visual_status": "NOT_OBSERVED",
  "mutation_test_status": "NOT_EXECUTED_PRODUCTION_SAFETY",
  "is_production_safe_to_click": false,
  "role_status": "ROLE_UNVERIFIED",
  "field_inventory_refs": [],
  "evidence_refs": [],
  "remaining_questions": ["Apakah tombol Simpan muncul setelah produk dipilih?"],
  "guidebook_permission": "DO_NOT_WRITE_FINAL_STEPS",
  "verification_notes": "Contoh skema; isi dengan observasi aktual, jangan menyalin nilai contoh sebagai fakta."
}
```

**PENTING:** contoh ini bukan bukti bahwa tombol Simpan telah terlihat. Pada hasil aktual, buat hanya fitur dan nilai yang benar-benar ditemukan. Jika nama tombol belum diketahui, jangan menciptakan fitur palsu dari contoh schema.

## 5.3. Field registry berdisiplin

Untuk setiap field yang **terlihat**: `ui_label_exact`, jenis kontrol, required/optional jika terbukti, opsi dropdown yang terlihat, placeholder, tipe data, help text, default value, enabled/disabled, lokasi bbox, asal state, dan evidence. Semua yang belum dapat diketahui pakai `UNKNOWN`/`null`, bukan asumsi.

**Jangan melakukan submit untuk memaksa validasi pada produksi.** Pesan validasi yang ditemukan dari kode dapat dicatat `CODE_OBSERVED`, bukan `UI_TESTED`.

## 5.4. Indeks bukti yang konsisten dan self-contained

- `evidence_refs` bertipe array ID konsisten. Jangan simpan daftar ID bercampur string dipisah titik koma tanpa normalisasi.
- `evidence_count` dihitung dari array referensi unik yang valid.
- Semua referensi `source_ref`, screenshot, overlay preview, dan dokumen yang diklaim *bundled* harus tersedia di ZIP dan lolos hash.
- Boleh ada referensi eksternal hanya jika dicatat `external_dependency=true`, lokasi stabil, privilege yang dibutuhkan, dan `NOT_SELF_CONTAINED`; untuk target release self-contained, semua data nonrahasia yang diperlukan guidebook harus dikemas sanitized.
- Baseline hash terpisah dari hash file ekspor sanitized; jangan membandingkan seolah keduanya harus identik.
- Gunakan relative path yang aman dan konsisten, tanpa path traversal maupun path absolut yang bocor.
- Semua data sensitif, termasuk screenshot sumber lama, dikecualikan dari paket jika belum disanitasi.

## 5.5. Metadata dan bukti no-mutation

Catat tindakan browser yang benar-benar dijalankan dalam audit log teredaksi: timestamp, event, normalized URL path, HTTP method, side effect classification, result status, captured evidence. Hapus cookie, body sensitif, nilai token dan query pribadi.

Implementasikan guard yang **memblokir sebelum dikirim** aksi selain allowlisted safe read-only dan laporkan jumlah blocked attempts. Namun jangan memicu aksi mutatif hanya untuk membuktikan guard bekerja di produksi; uji guard offline dengan permintaan sintetis atau staging yang diizinkan.

Jika bukti audit server/DB tersedia melalui akses sah read-only, sertakan hasil verifikasi yang teredaksi. Jika tidak tersedia, jujur: `PRODUCTION_MUTATION_NOT_OBSERVED_FROM_CLIENT_LOGS`; jangan mengklaim `DATABASE_UNCHANGED_VERIFIED` tanpa bukti backend yang cukup.

---

# 6. RENCANA ANOTASI YANG BENAR-BENAR SIAP DIPAKAI

Ikuti Golden Standard Zola dari panduan HRIS dan To-Do yang sudah disetujui:

- Pembaca non-IT; materi visual-first berbasis tugas, singkat, tanpa narasi berulang.
- Identitas visual **oranye, charcoal, putih**; screenshot aplikasi asli sebagai inti gambar.
- Penanda nomor berurutan, garis/panah yang tepat, highlight pada kontrol **yang benar**, keterangan fungsi/tindakan/hasil yang sudah terverifikasi.
- Kelompokkan informasi berdekatan agar callout tidak berlebihan; jangan menghilangkan field wajib, batasan, hasil, atau peran yang penting.
- Grafik/lay out full-bleed tanpa margin putih di luar gambar; proporsi nyaman untuk ditempel Word A4 lebar sekitar 14–15 cm; tulisan tetap terbaca.
- 1 aktivitas umumnya 1–4 panel, dan panel hanya sebanyak yang benar-benar diperlukan.
- Label `KHUSUS PIC/ADMIN` hanya apabila hak akses itu telah dibuktikan; jika tidak, tulis akses belum diverifikasi atau hindari klaim role.

## 6.1. Validasi koordinat, jangan ulangi kesalahan V3

Gunakan satu format bbox eksplisit: `[x, y, width, height]` dalam koordinat **pixel screenshot**, bukan DOM CSS mentah. Jika screen zoom/scale/scroll berbeda, lakukan transformasi koordinat yang diuji, lalu simpan transform metadata.

Sebuah callout hanya boleh `MEASURED_AND_VERIFIED` jika:

- `width > 0` dan `height > 0`.
- `x >= 0`, `y >= 0`, `x+width <= image_width`, `y+height <= image_height`.
- Target benar-benar terlihat pada screenshot yang dirujuk, tidak berada di hidden modal/template.
- Koordinat dinyatakan dalam sistem gambar yang sama dengan file PNG sanitized final.
- Teks/label target cocok dengan UI aktual.
- Preview overlay memperlihatkan highlight tepat dan tidak menghalangi instruksi penting.
- Inspeksi visual lulus dan hasilnya direkam dengan `reviewer`, `reviewed_at`, `review_method`, `qa_notes` (jangan mengarang reviewer manusia jika pemeriksaan oleh AI/otomasi).

Bila gagal salah satu: `PENDING_MEASUREMENT` atau `REJECTED`, tidak boleh VERIFIED dan tidak boleh masuk final annotation plan yang siap produksi. `[0,0,0,0]` diperbolehkan hanya sebagai raw unverified historical input, **tidak boleh** pada deliverable `release_ready`.

Buat pratinjau overlay dari screenshot sanitized yang asli, simpan sebagai *derived artifact*, tanpa menimpa screenshot asli. Cocokkan secara otomatis dan inspeksi secara visual satu per satu untuk seluruh callout release-ready.

## 6.2. Anotasi tidak boleh mendahului bukti

- Aktivitas aman/teruji: boleh memiliki callout prosedur lengkap.
- Fitur mutatif deferred: hanya anotasi letak fitur/tombol/tampilan/field yang benar-benar terlihat, dengan label keterbatasan. Jangan buat panah dari "Simpan" ke hasil sukses yang tak pernah diuji.
- Screenshot daftar Edit Harga dengan `Edit (0)` disabled hanya boleh menjelaskan daftar/pilihan dan kondisi tombol saat itu. Jangan beri caption "Formulir berhasil dibuka".
- Screenshot Brand/Brosur/Diskon perlu activity mapping atau dossier sehingga bisa ditelusuri ke bagian guidebook.

---

# 7. PIPELINE PERBAIKAN DAN EKSEKUSI V4

**Laksanakan fase berikut secara berurutan. Setiap fase menghasilkan artefak dan quality gate. Jangan hanya membuat checklist kosong.**

### FASE 0 — PRE-FLIGHT, INVENTARIS, DAN BASELINE

Periksa workspace, versi aplikasi dan scraper, peran yang benar-benar teramati, izin akses, semua modul dari V1–V3, serta data lama. Buat manifest hash sebelum dan guardread-only. Output `preflight.md`, `baseline_before_manifest.json`, `action_risk_registry.json`.

**Gate-0:** semua scope diketahui, aksi mutatif terkunci, baseline tersimpan. Jika gagal, STOP ekspedisi browser.

### FASE 1 — REKONSILIASI TEMUAN V3

Baca audit independen V3 dan cocokkan satu per satu dengan file aktual. Buat matriks `finding_id | status_now | evidence | root_cause | remediation | retest`. Pastikan tidak ada temuan dilupakan.

**Gate-1:** semua P0/P1 memiliki rencana dan target bukti; tidak ada klaim already-fixed tanpa verifikasi.

### FASE 2 — INVENTARIS LENGKAP MODULE/FEATURE/ACTION

Jelajahi menu/route aman dan hubungkan seluruh screenshot lama ke modul/fitur/aktivitas. Isi semua *existence dossiers* untuk fitur deferred. Audit khusus Brand, Brosur, Diskon, Karyawan, Duplikat, dan Edit Harga.

**Gate-2:** tidak ada modul yang diketahui hilang diam-diam; semua fitur mutatif dikenali dan tercatat walau tidak dijalankan.

### FASE 3 — LENGKAPI PROSEDUR AMAN

Jalankan aman saja: navigasi, cari, filter, sort, pagination, lihat detail, tab, popup. Ambil screenshot sebelum/sesudah, stabilkan rendering, ukur outcome, simpan transitions. Jangan mencoba mutasi atau autosave.

**Gate-3:** setiap aktivitas yang ditandai verified memiliki langkah/bukti, dan setiap yang tidak dapat diuji diberi status benar.

### FASE 4 — HARMONISASI METADATA, PRIVASI, DAN ANOTASI

Perbaiki seluruh bbox V3, judul Edit Harga, timestamp capture/index, evidence_count, source refs, stale path, role, field registry, action blocklist, dan rules. Sanitasi ulang semua output, render overlay, cek keterbacaan.

**Gate-4:** tidak ada koordinat kosong di release-ready, tidak ada broken refs, tidak ada PII terbuka, tidak ada kontradiksi label screenshot/prosedur.

### FASE 5 — BANGUN KELUARAN V4 SELF-CONTAINED

Bangun normalized V4 di direktori baru. Simpan raw historical version untouched. Buat manifest, rekonsiliasi version lineage, index, guidebook-ready content, dan exception register. Export ZIP sementara yang akan diaudit.

**Gate-5:** seluruh artefak lengkap, hash & schema valid, navigasi referensi dapat diikuti dari dokumen guidebook sampai bukti primer.

### FASE 6 — QA PASS 1 (BERLAPIS, MENYELURUH)

Jalankan validator otomatis pada **SELURUH** paket dan inspeksi visual terhadap screenshot/overlay. Buat laporan PASS/FAIL/BLOCKED per gate dan per modul. Jangan menulis QA1 PASS jika masih terdapat FAIL penting. Perbaiki di folder run V4 dengan revisi versioned; jangan mengubah baseline V1–V3.

**Gate-6:** semua P0 pada scope siap terbit terselesaikan, pengecualian mutatif berstatus benar, laporan berisi bukti dan bukannya pernyataan umum.

### FASE 7 — QA PASS 2 (INDEPENDEN DARI PASS 1)

Jalankan ulang dari artefak V4 hasil revisi, **gunakan validator/run kedua** yang tidak sekadar menyalin output QA1, dan periksa semua modul/ID/path/PII/overlay/timestamp/rules. Untuk kasus pencarian, lakukan retest yang aman jika sesuai. Laporkan bukti QA2, jumlah item diperiksa, hasil per kategori, serta selisih hasil dari QA1.

Bila QA2 gagal, perbaiki artefak baru dan ulangi QA1 serta QA2 yang terdampak hingga paket stabil. Jangan membuat status dua pass hanya berdasarkan dua screenshot identik.

**Gate-7:** QA2 benar-benar dieksekusi setelah perbaikan terakhir dan semua gate wajib lulus.

### FASE 8 — ZIP FINAL, VERIFIKASI ULANG DARI ARSIP, DAN KEPUTUSAN

Buat ZIP final sanitized. Buka kembali ZIP di proses validator yang bersih tanpa bergantung pada file workspace. Hitung CRC, parse seluruh JSON, schema validation, path traversal, symlink/executable tidak diharapkan, hash, referensial integrity, PII scan, bbox audit, overlay preview, coverage, exception register, dan QA manifest; cocokkan nama/path di laporan dengan file aktual. Cocokkan baseline before-after dari workspace jika memang memiliki akses.

**Gate-8:** laporan `FINAL_ZIP_AUDIT` benar-benar menunjuk artefak ZIP final dengan SHA-256 yang sama. Jika ZIP berubah satu byte setelah audit, audit harus dijalankan ulang pada ZIP baru sebelum release.

---

# 8. QUALITY GATES MESIN-BACA — BUKAN SEKADAR RINGKASAN TEKS

Validator wajib menghasilkan *machine-readable results* dengan `gate_id`, `tested_items`, `passed_items`, `failed_items`, `blocked_items`, `evidence_refs`, `check_version`, `run_at`, dan alasan. Gunakan paling sedikit:

| Gate | Pemeriksaan wajib | Kriteria untuk GO WITH EXCEPTIONS |
|---|---|---|
| G1 Safety | Interaksi produksi berisiko, penguncian mutatif, audit log redacted | Zero known mutative execution; batas pembuktian log jelas |
| G2 Preserve | Before/after SHA-256 data lama, checkpoint, konfigurasi | Tidak ada perubahan tak sah pada data lama; bila tak punya akses workspace tandai unverified, bukan PASS |
| G3 Security | Cookie/token/password/PII pada semua teks dan semua screenshot | Zero confirmed leaks dalam paket akhir; visual audit lengkap |
| G4 References | Semua module/feature/activity/state/evidence ID terhubung; path di ZIP valid | Zero broken refs untuk release-ready |
| G5 Evidence | Hash/dimensi/file/timestamp/capture provenance, screenshot cocok state | Zero high-confidence mismatches/label palsu pada release-ready |
| G6 Coverage | Semua modul dalam scope, fitur, aktivitas aman, dan fitur mutatif | Semua known modules inventory; safe workflows verified atau exception jujur; mutative dossiers lengkap |
| G7 Annotation | bbox nonzero, bounds, label benar, preview lulus | 100% callouts release-ready valid; unknown tidak dipasarkan sebagai verified |
| G8 Process | Before→action→after, outcome nyata, role, validation | Setiap prosedur final punya evidence memadai |
| G9 Business | Aturan harga, diskon, role, sync, dan konsekuensi | Tidak ada aturan tak terverifikasi dipresentasikan sebagai fakta final |
| G10 QA Dual Pass | QA1 dan QA2 berurutan, berbeda run dan scope penuh | Keduanya ada dan lulus pada artefak setelah koreksi |
| G11 Artifact | Final ZIP dibuka ulang, CRC, JSON, hashes, path, safety, SHA | PASS pada **ZIP final yang dikirim**, bukan hanya directory workspace |
| G12 Writing Ready | Nama menu tepat, penjelasan pendek, caption, pembagian role, source refs | Konten siap ditulis untuk scope verified; deferred tidak punya SOP palsu |

Tidak boleh menyembunyikan FAIL dengan membuang item dari scope tanpa alasan. Setiap `BLOCKED` harus menjelaskan dasar pemblokiran dan apakah ia termasuk pengecualian yang memang diperbolehkan.

**Perhatian:** jumlah screenshot/JSON banyak tidak sama dengan coverage tinggi; jumlah PASS laporan tidak sama dengan kebenaran. Skor readiness dihitung dari coverage item dan kekuatan bukti per item, dengan denominator modul/fitur aktual yang dijabarkan.

---

# 9. ATURAN KHUSUS PER MODUL (UNTUK MENGHINDARI KLAIM PALSU)

## 9.1. Cari Harga

Uji ulang hasil pencarian hingga render stabil, kosong, penghapusan query/reset, filter yang aman, hasil perubahan data tabel, dan opsi tampilan yang ada. Jangan asal klik tindakan yang berpotensi mengubah data. Cocokkan screenshot, row count, dan header. Hasil V3 boleh diwarisi dengan provenance, tetapi jangan diklaim sebagai fresh retest tanpa menjalankannya.

## 9.2. Harga per Brand

Sepuluh screenshot Brand V3 harus terpetakan ke inventaris dan kegiatan yang bisa diikuti pembaca. Periksa nama brand, kategori/subkategori yang terlihat, pengaturan navigasi, perpindahan detail yang aman, dan apakah ini daftar katalog atau halaman detail. Jangan menyebut harga/produk mutakhir jika screenshot lama tanpa verifikasi terkini.

## 9.3. Brosur

Daftar dan detail yang telah tampak harus menjadi minimal satu atau lebih aktivitas read-only, didukung state/transition saat membuka detail. Tombol tambah/upload/edit jika ada harus masuk dossier deferred dengan screenshot keberadaan saja; submit dilarang.

## 9.4. Diskon

Buat panduan visual daftar, filter/detail yang aman, status promo bila terlihat. Tambah/Apply/Arsip/Edit/Hapus dan perubahan nominal termasuk aksi deferred, bukan menghalangi inventaris modul. Jangan menyebut efek pengurangan harga atau rentang berlaku sebagai aturan bila belum diverifikasi.

## 9.5. Karyawan dan User

Lengkapi daftar/search/filter/detail yang aman dengan privasi ketat. `Sync` dan `Sync Org Units` wajib masuk risk registry; tidak boleh diklik. Jangan menganggap `NANA` otomatis IT Administrator. Role lain tetap UNKNOWN bila tidak ada sumber resmi.

## 9.6. Duplikat Harga

Dokumentasikan daftar dan paginasi read-only. Hanya nyatakan pagination TESTED bila screen before/after dan halaman aktif atau row benar-benar berubah. `Duplikat` yang menulis data tetap deferred. Jangan berasumsi checkbox/selection murni lokal bila tidak diperiksa mekanismenya.

## 9.7. Edit Harga

Ubah label V3 yang berlebihan: halaman yang terlihat adalah daftar/pemilihan produk, tombol `Edit (0)` disabled saat belum dipilih, bukan otomatis form edit massal. Jika UI pemilihan aman, boleh amati kondisi pemilihan tanpa submit dan tanpa autosave. Jika tidak dapat membuka form aman, catat form unknown dan daftar pertanyaan. Simpan perubahan harga tetap deferred.

## 9.8. Dashboard / Login

Cocokkan label widget dan menu sesuai screenshot aktual. Login jangan diulang atau diotomasi dengan mengambil/mengekspor kredensial ke paket. Dokumentasikan alur autentikasi hanya sebatas bukti yang aman dan tersedia; jangan mengarang SSO/role yang tidak terlihat.

---

# 10. ARTIFAK SIAP DIGUNAKAN OLEH AI PENYUSUN GUIDEBOOK

Selain output teknis, wajib ada `analysis_guidebook/` yang **langsung dapat dipakai untuk produksi konten**, dengan syarat sumbernya benar:

- `guidebook_structure.json`: susunan Modul → Fitur → Aktivitas, judul sesuai bahasa dan UI yang sebenarnya.
- `guidebook_activity_cards.json`: untuk tiap aktivitas aman berisi tujuan satu kalimat, prasyarat yang diketahui, langkah bernomor singkat, hasil aktual, evidence_refs, annotation_plan_ref, serta batasan hak akses bila terverifikasi.
- `guidebook_visual_only_cards.json`: untuk fitur read-only yang baru bukti visual, tanpa klaim perilaku berhasil.
- `guidebook_deferred_features.json`: ringkasan fitur mutatif yang benar-benar terlihat, sumber, apa yang dapat dijelaskan, apa yang harus *dikosongkan/ditunda*, dan alasan.
- `guidebook_writer_rules.md`: style guide Zola berdasarkan dua dokumen approved; jangan menyisipkan dokumen HRIS atau To-Do secara literal di output jika tidak relevan.
- `guidebook_figure_manifest.json`: per aktivitas, foto sanitized asli, tujuan crop, nomor gambar yang diusulkan, callout refs yang valid, ukuran/aspect dan caption.
- `questions_for_owner.md`: hanya pertanyaan spesifik yang belum bisa diverifikasi untuk produk/role/aksi mutatif.
- `release_scope.md`: bab/aktivitas READY, VISUAL_ONLY, DEFERRED beserta justifikasi.

**Redaksi harus menjelaskan kepada pembaca non-IT, bukan mengarang alur.** Aktivitas mutatif boleh didaftarkan sebagai "Fitur tersedia, langkah penyelesaian belum diverifikasi" dalam dataset dan, jika disetujui editor, menjadi keterangan terbatas di guidebook. Jangan otomatis memasukkan disclaimer teknis panjang ke dalam guidebook untuk karyawan.

Jangan menggabungkan beberapa fitur tak berkaitan hanya untuk menaikkan readiness secara statistik. Jaga konsistensi nama modul sepanjang materi.

---

# 11. LAPORAN WAJIB SEBELUM MENGAKHIRI EKSEKUSI

Kirim laporan akhir dalam urutan berikut:

**A. Executive decision:** `GO_WITH_DOCUMENTED_EXCEPTIONS`, `PARTIAL`, atau `NO_GO` dengan alasan objektif. Jelaskan scope tepat, jangan pakai klaim "100% semua fitur" bila mutatif belum diuji.

**B. Baseline integrity:** jumlah file before/after, hash cocok/beda, status checkpoint, dan sumber perbandingan. Bedakan workspace vs ZIP historis.

**C. Inventory dan coverage:** daftar seluruh modul, jumlah fitur/aktivitas/screenshot/evidence/state, jumlah prosedur verified, visual-only, deferred, blocked, unknown, unresolved. Sajikan denominator serta evidence ID relevan.

**D. Audit temuan V3:** tabel setiap ID P0/P1/P2, status FIXED/DEFERRED/UNRESOLVED, bukti, dan retest. Tidak boleh menghilangkan temuan dari laporan.

**E. QA1 dan QA2:** laporan per quality gate; kapan, apa yang diperiksa, apa hasilnya, validator mana, artefak mana. QA2 harus setelah perbaikan terakhir, bukan salinan QA1.

**F. Privacy & safety:** scanner teks + audit visual, artefak sanitized, request guardrails, batas pembuktian no-mutation, item blocked.

**G. Final package manifest:** nama/path ZIP, ukuran, SHA-256, struktur top level, jumlah file, bukti successful re-open audit.

**H. Module readiness matrix:** tiap modul READY_FOR_PROCEDURAL_GUIDE / READY_FOR_VISUAL_GUIDE / MUTATIVE_DEFERRED / NEEDS_VERIFICATION (boleh kombinasi per fitur), dan apa yang dapat disusun sekarang.

**I. Last-mile gaps:** hanya sisa hal nyata yang memerlukan akses staging, permission, atau stakeholder; jangan bungkus sebagai pekerjaan yang sudah selesai.

**J. Next action for guidebook team:** jelaskan data dan lokasi file yang sudah dapat langsung dipakai sebagai sumber penulisan Zola. Jika PARTIAL, sebut tepat gate yang gagal dan remediations.

**SEMUA KLAIM FINAL HARUS DITOPANG OLEH FILE DALAM ZIP ATAU REFERENSI EKSTERNAL YANG BENAR-BENAR TERSEDIA.**

---

# 12. KRITERIA STOP/FAIL, ANTI-HALUSINASI, DAN HONEST COMPLETION

Anda wajib menghentikan interaksi pada produksi (namun tetap boleh melanjutkan audit offline) jika:

- Tidak dapat membedakan aksi read-only dan mutatif.
- Terjadi indikasi mutasi atau permintaan tanpa izin.
- Aplikasi merespons rate limit, sesi tidak sah, atau akses terlarang.
- Ada kemungkinan akses/ekspor data sensitif tanpa dasar izin.
- Source tidak mendukung perilaku yang hendak diklaim.

Anda wajib menyatakan **PARTIAL** apabila:

- Coverage modul tidak diketahui secara memadai, atau modul yang jelas terlihat tidak ada di inventaris.
- Terdapat bbox kosong pada callout release-ready.
- Ada referensi bukti tidak tersedia atau timestamp yang direkayasa.
- QA dua putaran tidak bisa dijalankan secara independen.
- ZIP final belum diverifikasi ulang.
- Tidak bisa memverifikasi preservasi workspace sementara Anda mengklaim hash unchanged.

Anda wajib menyatakan **NO_GO** jika final ZIP masih memuat rahasia/PII pribadi yang sensitif, ada bukti palsu, ada perubahan produksi yang tidak sah, atau integritas data lama rusak.

**Dilarang** memperbesar angka kemajuan dengan membuat dummy JSON, menamai screenshot sebagai hasil tindakan yang belum terjadi, menandai bbox 0 sebagai verified, menggunakan waktu indeks sebagai waktu capture, mengklaim dua-pass hanya karena ada dua screenshot serupa, atau menaikkan readiness hanya dengan mengedit laporan.

Jika lingkungan tidak mendukung browser, akses aplikasi, pemeriksaan source, atau pembuatan screenshot, kerjakan audit offline yang tersedia dan nyatakan blocker dengan benar. Jangan membuat bukti simulasi untuk mengganti akses riil.

---

# 13. MULAI EKSEKUSI (JANGAN HANYA MENGULANG PROMPT)

1. Baca dokumen V4 ini **secara keseluruhan**, audit V3, dan workspace yang benar-benar tersedia.
2. Mulai dengan preflight/read-only baseline + risk guard, bukan menekan tombol produksi.
3. Buat rencana kerja singkat berdasarkan gap nyata lalu implementasikan semua perubahan yang aman dalam run folder baru.
4. Lanjutkan inventory + task-based scraping read-only + deferred feature dossiers + koreksi annotation/evidence/metadata/privasi.
5. Bangun V4, jalankan QA1, perbaiki, jalankan QA2, lalu audit dari ZIP final.
6. Buat keputusan sesuai bukti: target `GO_WITH_DOCUMENTED_EXCEPTIONS`, **tetapi jangan dipaksakan** apabila gate lain gagal.
7. Sajikan laporan objektif dengan link/path artefak aktual, manifest, dan exception register.

**INGAT:** Keberhasilan bukan mengubah data untuk menyelesaikan semua task. Keberhasilan adalah membuat data guidebook siap produksi untuk hal-hal yang dapat diverifikasi secara aman, sambil mencatat dengan akurat keberadaan serta batasan fitur mutatif yang sengaja tidak diuji.
