# ZOLA — FINAL MASTER PROMPT V4.1
## Finalisasi Pemetaan Sistem Pricelist & Dataset Production-Ready Guidebook, dengan Pengecualian Tindakan Mutatif

**PERAN ANDA:** Lead System Analyst, Senior Browser Automation / Scraping Engineer, QA Engineer, Data Quality Auditor, Security Reviewer, dan Technical Writer khusus dokumentasi pengguna aplikasi perusahaan.

**TUJUAN UTAMA:** Finalisasikan dan lengkapi dataset scraping **Web Pricelist PT Radiator Springs Indonesia** agar bisa **langsung dipakai menyusun KERANGKA, ISI MODUL, URUTAN AKTIVITAS, dan RENCANA ANOTASI guidebook Zola**. Fitur yang memerlukan penyimpanan, pengiriman, sinkronisasi, upload, penghapusan, pengarsipan, atau perubahan data bisnis **diperbolehkan ditunda eksekusinya**, tetapi **keberadaan, akses, tampilan dasar, dan batasan verifikasinya HARUS tetap diinventarisasi**. Jangan mengada-ada hasil tindakan tersebut.

**LANDASAN KERJA:** Baca source code dan workspace scraper yang tersedia, seluruh dataset versi sebelumnya (V1–V4), laporan audit independen, serta dua guidebook yang sudah disetujui (*Panduan HRIS* dan *Panduan To-Do*), jika tersedia di workspace. Jika referensi tertentu tidak tersedia, laporkan `REFERENCE_NOT_AVAILABLE`; jangan mengklaim telah membacanya. Gunakan **dataset V4 sebagai baseline**, bukan sebagai sumber yang otomatis benar. Lakukan investigasi dari bukti aktual.

---

## 0. ATURAN ABSOLUT: SISTEM PRODUKSI TIDAK BOLEH BERUBAH

1. **DILARANG melakukan operasi mutatif pada aplikasi Pricelist produksi:** create, update, delete, bulk edit, submit, kirim konsultasi, upload, publish, apply/arsip diskon, duplikasi harga, sinkronisasi karyawan/organisasi, reset, perubahan pengaturan, dan tindakan lain yang berpotensi mengubah data/status/berkas/antrean atau mengirim notifikasi bisnis.
2. Jangan menyamakan `GET` dengan aman secara otomatis. **Periksa terlebih dahulu** apakah rute, klik, Livewire/AJAX, event JS, atau akses file berpotensi menimbulkan efek samping. Gunakan allowlist operasi yang benar-benar dapat dibuktikan hanya membaca; selain itu `BLOCKED_PENDING_SAFETY_CHECK`.
3. Tidak boleh menekan **Kirim, Simpan, Hapus, Apply, Arsip, Duplikat, Sync, Sync Org Units, Publish, Upload** maupun kontrol lain dengan efek mutatif. Jangan memaksa tombol disabled menjadi aktif, memodifikasi JavaScript klien agar lolos validasi, membypass role, atau memanipulasi request.
4. Untuk formulir mutatif, boleh **mengamati modal, berganti pilihan yang hanya memengaruhi UI lokal, melakukan scroll, membaca label/placeholder/opsi, dan menutup modal**, setelah memastikan aksi tersebut tidak menyebabkan penulisan backend. **Jangan isi data pribadi asli, jangan memilih/mengunggah file, jangan submit**, dan jangan menguji validasi server melalui pengiriman.
5. **Preservasi absolut:** jangan menghapus, menimpa, memindahkan, me-rename, mengedit, atau reset dataset V1–V4, `raw_pages`, `analysis`, `screenshots`, `sessions`, `checkpoints`, antrean, konfigurasi, atau file historis. Jangan reset progress crawler. Simpan hasil V4.1 **append-only** dalam lokasi baru yang memiliki run ID unik; data lama dibaca saja.
6. Tidak boleh membocorkan `cookies`, `session`, `csrf-token`, `_token`, `Authorization`, Bearer, API key, password, signed URL, email personal, nomor telepon, dan data rahasia/PII lain ke dataset distribusi, log/prompt AI, laporan, atau preview. Redaksi pada **salinan ekspor**, tidak pada sumber asli. Apabila menemukan token yang sudah terdistribusi, laporkan temuan dan sarankan rotasi/revokasi melalui pemilik sistem; jangan mencoba menggunakan token.
7. Jangan mengubah source code aplikasi Pricelist, database bisnis, cache server, akun pengguna, permission, maupun layanan produksi. Perubahan minimal pada **tool scraper** hanya boleh dilakukan jika aman, diperlukan, kompatibel, dan sudah dibuktikan tidak mengubah output/baseline lama; utamakan adapter/extension.
8. Jika keselamatan aksi belum bisa dipastikan, **hentikan aksi tersebut, bukan seluruh proyek**. Catat alasannya, ambil bukti statis yang aman, lalu teruskan seluruh pekerjaan lainnya.
9. Jangan mengklaim `ZERO_MUTATION_VERIFIED` berdasarkan log klien agregat saja. Bedakan `CLIENT_SIDE_NO_MUTATION_OBSERVED` dengan `SERVER_SIDE_AUDIT_VERIFIED`; yang kedua hanya boleh dipakai bila benar-benar memiliki bukti audit server yang diotorisasi.

**PRIORITAS: KEAMANAN PRODUKSI > INTEGRITAS DATA LAMA > AKURASI BUKTI > KELENGKAPAN > KECEPATAN.**

---

## 1. KONDISI AWAL V4 YANG WAJIB DIPERBAIKI

Audit independen terhadap `guidebook_dataset_v4_sanitized_v4_20261104_070553.zip` menyimpulkan belum lulus rilis final. Verifikasi ulang setiap temuan pada keadaan aktual:

- Baseline V4 memuat **8 modul / 16 entri fitur / 10 activity cards**, 25 screenshot, 25 sumber HTML, 10 preview anotasi, dan 6 dossier fitur mutatif; angka ini **baseline, bukan batas maksimum cakupan sistem**.
- **Modul/fitur “Tanya Harga & Konsultasi Keluhan” terlewat dari module_inventory, feature_inventory, guidebook_structure, activity cards, annotation plans, serta deferred dossier**. Namun, jejak lama menunjukkan komponen tersebut ada pada DOM sebagai modal bersama (*shared/global modal*); pemicu UI antara lain tombol dengan label `Tanya Harga` dan event `open-tanya-harga`. DOM global saja tidak membuktikan bahwa modal terbuka dan tersedia di setiap role/halaman: verifikasi secara visual dan aman.
- Pada screenshot terbaru dari pemilik sistem, modal bertitel **`TANYA HARGA & KONSULTASI KELUHAN`** memiliki tiga jenis produk: `SPD Speedometer (MOBIL)`, `GRS Speedometer (MOTOR)`, dan `Produk Lainnya (NON-KENDARAAN)`. Screenshot SPD memperlihatkan **Merk Kendaraan, Tipe Kendaraan, Transmisi, Tahun Kendaraan, Detail Pertanyaan / Keluhan, Foto Lampiran**, serta tombol **Batal/Kirim**. HTML juga mengandung label **Nama Produk** yang kemungkinan kondisional; **jangan menyimpulkan kondisi tampilnya sebelum diverifikasi**.
- **25/25 HTML distribusi V4 masih memuat nilai CSRF** di `meta[name="csrf-token"]` serta `input[name="_token"]`; klaim privacy PASS tidak sah.
- **QA kedua seluruh dataset dan audit ZIP final tidak ditemukan**, meskipun laporan mengklaim seluruh gate PASS.
- **134/153 nama entri ZIP mengandung backslash**, sedangkan indeks mengacu path dengan `/`; `README_START_HERE.md` menunjuk `manifest.json` yang belum ada.
- **Preview anotasi V4 salah secara makna** pada beberapa kasus: `ACT-DUP-001` menyorot pencarian, bukan PREV/NEXT; `ACT-EDIT-001` menyorot pencarian, bukan checkbox/Edit(0); `ACT-BRAND-001` menyorot pencarian, bukan pemilihan brand; `ACT-SEARCH-003` memakai gambar filtered padahal menjelaskan empty state; `ACT-BROSUR-001` menjelaskan detail tetapi menyorot daftar.
- **`FEAT-SEARCH-03` (Filter Brand & Kategori) mempunyai `activities: []`** meski termasuk alur read-only. Cakupan navigasi kategori, daftar Brosur, dan aktivitas aman lainnya belum diselesaikan menyeluruh.
- Transisi `TRANS-6` sudah mempunyai state sebelum/sesudah paginasi Duplikat, tetapi activity step belum menunjuk state akhir yang benar.
- ID fitur pada inventaris tidak konsisten dengan dossier mutatif (`FEAT-USER-MUT` vs `FEAT-USER-SYNC`, dsb.).
- Metadata laporan QA, jumlah evidence, timestamp, status role, klasifikasi elemen tersembunyi, dan beberapa klaim aturan bisnis masih harus diuji silang.

**PENTING:** Perbaiki **akar penyebab**, bukan sekadar mengubah teks status menjadi PASS.

---

## 2. DISCOVERY FINAL: JANGAN ADA MODUL/FITUR YANG TERLEWAT KARENA TIDAK ADA ROUTE

Lakukan penelusuran sistematis pada semua halaman dan state yang telah diketahui, ditambah seluruh pintu masuk UI yang tersedia secara aman:

1. Petakan sidebar, navbar, tab, breadcrumb, dropdown, submenu, card, quick action, floating action button, tombol dalam tabel, ikon, context menu, dialog, drawer, modal, popover, shortcut, dan setiap event pemicu fitur.
2. **Cari fitur lintas halaman**, terutama yang tidak mempunyai URL sendiri: konsultasi, bantuan, feedback, pengaturan, profil, download/export, peringatan, notifikasi, popup onboarding, dialog konfirmasi, dan aksi dari ikon. Jangan menganggap isi DOM yang `hidden` otomatis merupakan fitur aktif; buka secara aman dan periksa visibilitas nyata.
3. Bandingkan tiga sumber: **DOM/HTML, screenshot/state aktual, serta inventaris dan source code yang tersedia**. Buat register `discovered_in_dom`, `visually_confirmed`, `safe_interaction_tested`, dan `source_code_inspected`; jangan mencampurkan tingkat kepastian.
4. Bagi fitur menjadi `ROUTE_MODULE`, `GLOBAL_MODAL`, `SHARED_COMPONENT`, `MODULE_FEATURE`, atau `ADMIN_ACTION`. Satu modal bersama boleh menjadi **bab/modul fungsional guidebook** walaupun bukan item sidebar atau route mandiri. Jangan menduplikasi fitur yang sama menjadi banyak modul hanya karena muncul di banyak halaman.
5. Buat **entry-point matrix** untuk setiap modul/fitur global: asal layar, nama pemicu persis, kondisi tampilan, route asal, role yang benar-benar teruji, akibat klik yang diamati, dan evidence screenshot sebelum/sesudah.
6. Bagi semua pekerjaan menjadi `READ_ONLY_SAFE`, `UI_ONLY_SAFE`, `POTENTIALLY_MUTATIVE`, `MUTATIVE_DEFERRED`, `ROLE_BLOCKED`, atau `UNVERIFIED`. Tindakan yang belum diperiksa tidak boleh otomatis dianggap aman.
7. Pastikan setiap fitur memiliki minimal satu `FeatureRecord` dan setiap **fitur nonmutatif yang diakses** memiliki aktivitas/dokumentasi terstruktur. Fitur yang tidak dapat diakses harus mempunyai `BlockedRecord` dengan alasan dan bukti; tidak boleh hilang diam-diam.
8. Telusuri tampilan empty, loading, error/disabled, pagination, filter, pencarian, tipe produk, dan state alternatif lain yang relevan. Jangan membuat aktivitas tambahan yang hanya mengulang informasi tanpa nilai panduan.
9. Untuk setiap halaman brand, pastikan apakah yang terlihat adalah **pilihan kategori, subkategori, atau tabel harga sesungguhnya**. Jangan menyebut seluruh 10 brand mempunyai tabel produk bila yang baru terlihat hanyalah kategori.
10. Lakukan **reconciliation final**: apa yang ada di DOM tetapi tidak ada di inventaris; apa yang ada di inventaris tetapi tidak memiliki bukti; apa yang ada di screenshot tetapi tidak masuk activity; apa yang tertulis di SOP tetapi belum diamati.

**Kriteria cakupan:** tidak ada orphan feature, orphan evidence, aktivitas tanpa sumber, dan **tidak ada celah yang diketahui tetapi tidak memiliki status**. Tidak perlu mengklaim semua fitur tersembunyi yang tidak bisa diakses sudah ditemukan; dokumentasikan batasan discovery secara jujur.

---

## 3. MODUL WAJIB TAMBAHAN: “TANYA HARGA & KONSULTASI KELUHAN”

### 3.1 Posisi dalam arsitektur dan guidebook

Fitur ini **BELUM MASUK dengan benar dalam inventaris V4**. Masukkan sebagai satu **modul fungsional/section mandiri** dengan nama UI tepat `Tanya Harga & Konsultasi Keluhan`, klasifikasi teknis `GLOBAL_MODAL` / `SHARED_COMPONENT` jika pemeriksaan mengonfirmasi. Pertahankan 8 modul lama dan tambahkan modul baru, misalnya `MOD-009` **hanya jika ID belum terpakai**; jangan mengganti ID lama. Jika ditemukan modul baru lain saat discovery, tambahkan dengan ID baru. Di guidebook, fitur dapat ditempatkan setelah pembacaan katalog/Cari Harga sebagai bab aktivitas **“Mengajukan Pertanyaan Harga dan Konsultasi Keluhan”**, bukan harus dibuat menu sidebar palsu.

### 3.2 Pemetaan akses dan state yang wajib

Cari dan verifikasi secara aman lokasi pemicu `Tanya Harga` dari sidebar/ikon mengambang/halaman terkait. Ambil **screenshot pemicu**, **screenshot modal terbuka**, **screenshot modal setelah pilihan kategori lain**, dan **screenshot modal ditutup**. Jika pemicu tidak ada pada suatu role/halaman, catat `NOT_VISIBLE_AT_THIS_ENTRY_POINT`, bukan mengarang akses. Jangan mengubah sesi login atau role untuk memaksa akses.

### 3.3 Tiga varian jenis produk — WAJIB diperiksa satu per satu

- **SPD Speedometer (MOBIL)**: verifikasi pilihan aktif dan field yang benar-benar muncul, termasuk Merk Kendaraan, Tipe Kendaraan, Transmisi, Tahun Kendaraan, Detail Pertanyaan/Keluhan, Foto Lampiran.
- **GRS Speedometer (MOTOR)**: ganti pilihan hanya bila perubahan tersebut murni UI dan tidak mengirim data; ambil screenshot dan inventaris field/opsi yang benar-benar tampil. **Jangan anggap field sama dengan SPD** tanpa bukti.
- **Produk Lainnya (NON-KENDARAAN)**: lakukan pemeriksaan kondisi field, khususnya kemungkinan `Nama Produk` yang terdeteksi di HTML; ukur perubahan tampilan dan label required yang benar. Jangan mendefinisikan form berdasarkan DOM tersembunyi saja.

Untuk tiap varian, catat **label persis, tipe field, placeholder, apakah wajib (`*`) pada tampilan aktual, default, pilihan yang tersedia, dependensi antarfield, apakah pilihan manual boleh, dan pesan bantuan yang tampak**. Saat memakai data uji lokal, jangan pakai data pelanggan/karyawan sebenarnya, jangan submit, dan jangan unggah foto.

### 3.4 Interaksi aman yang perlu didokumentasikan

- Cara membuka modal melalui pemicu UI yang terkonfirmasi.
- Cara memilih salah satu dari tiga jenis produk.
- Cara memahami field yang tampak dan tanda wajib.
- Cara membaca pilihan Merk dan Tipe, termasuk `Pilih atau tulis manual...` jika terverifikasi.
- Cara menggunakan input Transmisi dan Tahun Kendaraan, jika terlihat pada varian terkait.
- Cara mengisi **secara konseptual** Detail Pertanyaan/Keluhan dan cara memasukkan lampiran **hanya sebagai penjelasan tampilan** (`Drag & Drop`, `Paste (Ctrl+V)`, `Pilih File`) jika terlihat; **jangan benar-benar mengunggah file ke server**.
- Cara scroll dalam modal, menutup dengan `X` atau `Batal` setelah dipastikan tidak menulis apa pun.
- Tombol `Kirim` harus tampil sebagai **`MUTATIVE_DEFERRED`**: keberadaannya dibuktikan, tetapi **tidak diklik**, tidak diklaim berhasil mengirim, tidak mengarang tujuan pesan, penerima, notifikasi, nomor tiket, waktu balasan, atau validasi server.

### 3.5 Contoh struktur aktivitas minimum (sesuaikan temuan, jangan paksa alur yang tidak ada)

- `Membuka Form Tanya Harga & Konsultasi Keluhan` — `READ_ONLY/UI_ONLY` jika terbukti aman.
- `Memilih Jenis Produk dan Melihat Perubahan Form` — satu aktivitas dengan tiga panel varian, atau aktivitas terpisah jika lebih mudah dibaca.
- `Memahami Isian Kendaraan atau Produk, Detail Keluhan, dan Lampiran` — daftar field berdasarkan varian dengan screenshot dan anotasi terukur.
- `Membatalkan dan Menutup Form` — diuji hanya jika tidak menghasilkan mutasi.
- `Mengirim Pertanyaan/Keluhan` — **deferred**; ada dossier beserta screenshot tombol, field wajib, pertanyaan ke owner tentang alur setelah kirim.

### 3.6 Dossier khusus yang wajib dibuat

Buat dossier `FEAT-CONSULT-SUBMIT` (atau ID canonical baru yang setara) berisi: nama tombol, kondisi tampil, bukti, field/input teramati, potensi upload file, risiko PII dan notifikasi, alasan tidak diuji, hal yang belum diketahui, tempat uji staging, serta teks yang **boleh/tidak boleh ditulis** pada guidebook.

**Kriteria penerimaan modul konsultasi:** keberadaan dan pintu masuk terbukti; tiga varian tersimpan sebagai state nyata; perubahan field antarvarian dipetakan; field terlihat/tersembunyi dibedakan; tombol Batal/Kirim serta lampiran dipetakan; anotasi benar; `Kirim` tetap tidak diuji di produksi. Jika suatu varian tidak bisa dibuka dengan aman, beri `BLOCKED_WITH_EVIDENCE`, bukan klaim selesai palsu.

---

## 4. PENYEMPURNAAN DELAPAN MODUL YANG SUDAH ADA

**Dashboard** — cocokkan nama seluruh widget, angka, filter, dan shortcut dengan screenshot aktual; jangan menyatakan arti bisnis yang tidak terbukti. Satu activity boleh mencakup beberapa kelompok kartu ringkasan bila dapat dibaca dengan jelas.

**Cari Harga** — tuntaskan pencarian kata kunci, perubahan hasil setelah loading selesai, empty state yang **benar-benar kosong**, filter Brand/Kategori dan filter lain yang aman, pengaturan kolom, limit/per halaman, navigasi tabel, serta aksi baca/unduh jika benar-benar tersedia. Catat perbedaan opsi filter yang hanya teramati dan yang sudah berfungsi. `FEAT-SEARCH-03` **tidak boleh tetap tanpa aktivitas** jika aman diuji.

**Harga per Brand** — pertahankan 10 nama brand yang sudah teridentifikasi; dokumentasikan langkah memilih brand, membuka kategori/subkategori, melihat daftar produk apabila tersedia, dan kembali. Ambil screenshot per tahap, jangan mengarang ada tabel harga ketika UI baru menampilkan kategori. Hindari 10 prosedur duplikatif jika alurnya sama; gunakan satu prosedur utama dan daftar variasi yang relevan.

**Brosur** — pisahkan **Daftar Brosur** dari **Membuka Detail Brosur**. Hubungkan screenshot list → klik aman → detail; jelaskan elemen produk yang terlihat. Tambah/Upload dan tindakan pemutakhiran tetap deferred. Jangan menamai seluruh halaman berdasarkan satu ID brosur contoh.

**Diskon** — inventaris daftar, kolom, status, filter/pencarian dan rincian yang aman; tampilkan keberadaan `Apply Diskon`, `Arsipkan`, dan Tambah/Edit jika ada. Tidak mengeksekusi tindakan yang mengubah promo. Jangan menyimpulkan dampak diskon pada harga kasir tanpa bukti bisnis.

**Karyawan & User** — data daftar, pencarian, filter dan role label yang benar-benar terlihat; sanitasi PII pada screenshot dan DOM. `Sync`, `Sync Org Units`, Tambah, Edit, Hapus, dan aksi data lainnya deferred, masing-masing dicatat sebagai fitur atau subaksi dengan canonical mapping.

**Duplikat Harga** — perbaiki activity pagination menggunakan state `STATE_DUPLICATE_001_PAGINATION` sebagai before dan `STATE_DUPLICATE_002_PAGE2` sebagai after; anotasi harus menunjuk PREV/NEXT yang sebenarnya, bukan kolom pencarian. Eksekusi duplikasi deferred.

**Edit Harga** — dokumentasikan daftar/checkbox produk dan kondisi tombol `Edit (0)` yang disabled saat tidak memilih; jika perubahan checkbox secara lokal **sudah dipastikan tidak memutasi backend**, boleh tangkap variasi state tombol, tetapi jangan mengasumsikan aman. Menampilkan form setelah Edit hanya jika klik sudah diverifikasi read-only dan tidak melakukan mutasi; menyimpan perubahan harga tetap deferred. Jangan menyebut form edit sebagai telah dilihat jika yang ditangkap hanya daftar produk.

**Fitur tambahan yang ditemukan** — inventarisasi dengan status yang sama; jangan diabaikan hanya karena tidak berada dalam 8 modul lama.

---

## 5. DESAIN SOURCE OF TRUTH: SATU REFERENSI UNTUK SETIAP KLAIM

Setiap klaim konten guidebook harus memiliki hubungan eksplisit:

`MODULE → FEATURE → ACTIVITY → STEP → UI_STATE → EVIDENCE → VERIFICATION_STATUS → ANNOTATION`.

Gunakan canonical ID stabil, mapping alias versi lama, dan referensi file relatif POSIX. Jangan mengubah ID V1–V4; buat ID tambahan di V4.1 serta `legacy_id_mapping`.

### 5.1 Status bukti

- `DOM_DISCOVERED`: muncul dalam HTML/DOM tetapi belum terkonfirmasi terlihat.
- `UI_OBSERVED`: benar-benar terlihat dalam screenshot.
- `UI_INTERACTION_VERIFIED`: perpindahan state aman terbukti.
- `READ_ONLY_BEHAVIOR_VERIFIED`: hasil filter/navigasi terbukti dari sebelum dan sesudah.
- `CODE_INSPECTED`: didukung source code yang dibaca, bukan otomatis diuji.
- `OWNER_CONFIRMED`: mendapat konfirmasi pemilik proses yang terdokumentasi.
- `MUTATIVE_DEFERRED`: ada fitur tetapi eksekusinya sengaja tidak diuji.
- `BLOCKED`: terhalang role/akses/risiko, dengan alasan eksplisit.
- `CONTRADICTED`: klaim dan bukti bertentangan; tidak boleh masuk materi siap produksi.

### 5.2 Tier kesiapan penulisan

- `READY_FOR_STRUCTURE`: nama modul/fitur dan keberadaannya cukup kuat untuk daftar isi.
- `READY_FOR_VISUAL_GUIDE`: layar nyata, label, posisi dan fungsi elemen yang benar-benar teramati sudah cukup untuk panduan visual terbatas.
- `READY_FOR_PROCEDURAL_GUIDE`: langkah nonmutatif diuji aman, before/after benar, hasilnya tervalidasi, dan anotasi lolos review.
- `DEFERRED_DOCUMENTED`: fitur mutatif ada, bukti dasar lengkap, tetapi langkah submit/hasil tidak disertakan.
- `BLOCKED_WITH_EVIDENCE`: belum bisa diproduksi; kebutuhan penyelesaian jelas dan bukti dasar tersedia.

Jangan pernah menaikkan tier karena jumlah file bertambah, status QA ditulis ulang, atau fitur mempunyai kode HTML. Klaim “siap” harus berasal dari bukti yang dapat dibuka dan diperiksa ulang.

### 5.3 Field dan state registry minimum

Setiap form, filter, dan dropdown memiliki `field_id`, `feature_id`, `activity_id`, `exact_label`, `control_type`, `placeholder`, `required_indicator_observed`, `visible_when`, `dependencies`, `options_observed`, `read_only_test_status`, `validation_observed`, `evidence_ids`, dan `unknowns`. **Jangan menyebut mandatory backend hanya karena ada tanda `*` di UI**; tandai sebagai `UI_REQUIRED_INDICATOR` sampai ada bukti aturan validasi.

Setiap evidence minimal berisi: canonical ID, screenshot/HTML URI lokal relatif, SHA-256, timestamp konsisten (capture vs export dibedakan), route asal, role yang diklaim dan bukti role, viewport, state before/after, action pemicu, status sanitasi, serta provenance. Tidak ada evidence yang hanya menunjuk file hilang.

---

## 6. ANOTASI GUIDEBOOK ZOLA: WAJIB BENAR SECARA SEMANTIK

Ikuti standar visual HRIS dan To-Do yang sudah disetujui: screenshot asli, tema oranye–charcoal–putih, nomor penanda berurutan, highlight tepat, panah dan keterangan pendek yang mudah dipahami non-IT; ideal 1–4 panel per aktivitas, tanpa narasi panjang yang mengulang gambar. Artwork anotasi nantinya **full-bleed** tanpa margin luar putih, proporsional dan terbaca bila ditempel pada Word A4 sekitar 14–15 cm lebar.

**Untuk setiap anotasi wajib:**

- Referensi screenshot state yang benar, elemen target yang **benar-benar visible**, `bbox_px=[x,y,w,h]` terukur dengan `x,y>=0`, `w,h>0`, seluruh kotak berada di dalam canvas; tidak boleh placeholder `[0,0,0,0]`.
- Screenshot anotasi harus konsisten dengan teks. Jika disebut hasil kosong, gunakan **STATE EMPTY**, bukan gambar filtered.
- Jika menjelaskan langkah masuk ke detail, tampilkan **pemicu di panel BEFORE** dan isi **detail di panel AFTER**; jangan memakai screenshot list untuk mengklaim detail.
- Validasi geometri **dan semantik**: overlay target harus mengarah pada kontrol yang dimaksud, bukan hanya persegi panjang di posisi legal. Reviewer harus melihat pratinjau resolusi memadai.
- Jika bagian yang dijelaskan terlalu banyak, gabungkan elemen sejenis dalam satu nomor; tetap cakup lokasi, tindakan, syarat penting, dan hasil. Jangan menjejali gambar dengan teks kecil.
- Nama menu/tombol/field sama persis dengan UI; jangan mengarang tombol, role, pesan berhasil, atau screenshot sintetis.
- Simpan `annotation_plan.json` dan `annotation_preview.png` dalam path baru, dengan status `REVIEWED_SEMANTICALLY` hanya setelah benar-benar diperiksa. Penulis guidebook boleh membuat visual final berdasarkan plan yang sudah lolos, bukan otomatis dari kotak mentah.

Koreksi wajib untuk lima temuan V4: `ACT-DUP-001`, `ACT-EDIT-001`, `ACT-BRAND-001`, `ACT-SEARCH-003`, `ACT-BROSUR-001`. Periksa ulang **seluruh** anotasi termasuk modul Tanya Harga, bukan hanya lima tersebut.

---

## 7. SANITASI, DATA PRIVASI, DAN PACKAGING PORTABEL

1. Buat **salinan ekspor sanitized baru**, jangan mengubah raw source/ZIP historis.
2. Bersihkan token CSRF baik dalam `<meta name="csrf-token">`, `<input name="_token">`, atribut/data-* JSON inline, request headers, form hidden, atau serialisasi JS; bersihkan credential, cookie, identifier sesi, signed URL, dan data pribadi lain. **Jangan mengekspor sumber autentikasi** seperti `storage/sessions/`.
3. Sanitasi screenshot secara visual: nama, nomor telepon, email, identitas karyawan/pelanggan, alamat, dan informasi internal yang tidak perlu. Pertahankan bentuk antarmuka, susunan tombol, label, field, dan konteks panduan.
4. Semua salinan source HTML harus tetap berguna untuk menganalisis **struktur UI dan label**, tetapi nilai rahasia diganti dengan placeholder nonfungsional. Jangan mengirim seluruh HTML mentah ke LLM tanpa sanitasi.
5. Hitung ulang SHA-256 setelah sanitasi, perbarui `source_index`/`evidence_index`, dan larang referensi ke file raw yang tidak disertakan.
6. ZIP final harus berisi nama entri **POSIX `/`**, tanpa `\\` separator, absolute path, `..`, symlink yang berbahaya, zip-slip, atau nama duplikat; sertakan `manifest.json`, `README_START_HERE.md`, schema, version lineage, dan hash artefak.
7. Ekstrak ZIP final ke lokasi temporary **baru**, kemudian validasi keberadaan semua file, kesamaan hash, kesesuaian seluruh ID, keterbacaan gambar, validitas JSON/CSV/MD, serta scanner privasi ulang pada **file hasil ekstraksi**, bukan hanya workspace sumber.
8. Jangan menyatakan `PRIVACY_PASS` bila masih ada token nyata yang belum direduksi. Hindari false positive dalam scanner: catat jenis kecocokan dan klasifikasi manual ketika perlu, tanpa menampilkan nilai rahasia.

---

## 8. PENGUJIAN DAN ANTI-FALSE-PASS — TIGA TAHAP TERPISAH

### PASS A — Build-time QA terhadap semua berkas kerja V4.1

Periksa minimal: konsistensi manifest/versi, preservation baseline V1–V4, JSON schema, canonical IDs, semua modul dan global modal ditemukan, tidak ada feature orphan, activity coverage read-only, deferred dossier, before/after screenshot, screenshot freshness, role limitations, state transitions, field registry, business rules, anotasi geometri dan semantik, privacy scanner, dan kesesuaian copywriting.

### PASS B — Independent QA lengkap, setelah koreksi PASS A

Lakukan pemeriksaan ulang **mandiri** dengan skrip atau reviewer berbeda dari generator jika tersedia; jangan semata menggunakan status PASS A sebagai input. Lakukan sampling visual yang wajib mencakup seluruh modul, seluruh aktivitas kritis, semua varian formulir Tanya Harga, empty state, pagination, dan setiap anotasi yang pernah gagal. Jika tidak dapat menggunakan reviewer terpisah, gunakan prosedur pemeriksaan berbeda dan nyatakan keterbatasannya.

### PASS C — Final ZIP Re-Open Audit

Bangun ZIP setelah PASS B. **Buka kembali ZIP final dari disk, ekstrak ke folder baru, jalankan validasi manifest/hash/path/refs/PII/JSON/coverage serta buka preview visual yang dibundel.** File ZIP yang diperiksa harus persis file ZIP yang akan diserahkan. Jika ada perbaikan setelah PASS C, **ulang PASS A, PASS B, dan PASS C** pada versi final terbaru.

### Aturan gate kelulusan (semua yang relevan wajib PASS)

`G01` produksi tidak dimutasi oleh pengujian; bukti/keterbatasan disampaikan jujur.  
`G02` baseline data lama tidak diubah menurut pemeriksaan manifest dan akses workspace yang tersedia.  
`G03` privasi dan token pada ZIP sanitized lulus.  
`G04` seluruh modul/fitur yang ditemukan terinventarisasi termasuk GLOBAL MODAL Tanya Harga.  
`G05` seluruh aktivitas read-only yang aman dalam cakupan mempunyai bukti/status eksplisit.  
`G06` seluruh tindakan mutatif punya dossier dasar + status DEFERRED, tidak dieksekusi.  
`G07` seluruh screenshot/HTML/evidence IDs ada, hash cocok, dan path portable.  
`G08` before/after sesuai aksi dan tidak salah state; data dinamis telah settle.  
`G09` field/form varian konsultasi lengkap sesuai UI yang diuji.  
`G10` seluruh bbox anotasi lolos review visual semantik, bukan geometri saja.  
`G11` canonical ID mapping, nama label, dan business rule provenance konsisten.  
`G12` seluruh dokumen writer-ready tersedia tanpa klaim fiktif.  
`G13` PASS A dan PASS B lengkap, hasil mentah dan daftar kegagalan tercatat.  
`G14` ZIP final re-open PASS C, manifest final dan pemeriksaan keamanan lulus.  
`G15` tidak ada P0/P1 keselamatan, sanitasi, referensi, cakupan read-only, atau anotasi penting yang masih belum ditangani; pengecualian mutatif terdokumentasi.

**Statistik gate dihitung oleh validator dari bukti, bukan angka yang diketik manual.** Bila `tested_items=2` dan `passed_items=1`, status **FAIL**, tidak boleh PASS. Kegagalan keras apa pun menghasilkan `NO_GO`, dan tidak dapat dikecualikan hanya dengan catatan.

---

## 9. PAKET OUTPUT WAJIB YANG SIAP DIBACA AI PENULIS GUIDEBOOK

Buat **satu folder baru append-only** dan **satu ZIP sanitized final**. Minimal berisi:

```text
zola_guidebook_pricelist_v4_1_<run_id>/
  README_START_HERE.md
  manifest.json
  baseline_integrity/
    preservation_report.json
    version_lineage.json
  discovery/
    module_inventory.json
    feature_inventory.json
    entrypoint_matrix.json
    global_components.json
    unmatched_ui_register.json
    role_permission_matrix.json
    canonical_id_mapping.json
  guidebook_ready/
    guidebook_outline.json
    guidebook_outline.md
    section_openers.md
    guidebook_activity_cards.json
    guidebook_visual_only_cards.json
    deferred_feature_dossiers.json
    guidebook_writer_rules.md
    feature_to_activity_coverage.json
    guidebook_readiness_by_module.json
    owner_questions_prioritized.md
  forms/
    form_registry.json
    field_validation_registry.json
    consultation_variants_matrix.json
  activities/
  states/
  transitions/
  screenshots_sanitized/
  source_extracts_sanitized/
  annotation_plans/
  annotation_previews/
  evidence_index.json
  source_index.json
  business_rules.json
  discrepancy_register.json
  coverage_matrix.json
  reports/
    QA_PASS_A.json
    QA_PASS_B.json
    FINAL_ZIP_REOPEN_AUDIT.json
    privacy_audit.json
    semantic_annotation_review.json
    mutation_safety_report.json
    release_decision.json
    final_completion_report.md
```

Struktur boleh berkembang sesuai arsitektur existing, tetapi **fungsi, isi, dan relasi minimum ini wajib tersedia**. Jangan menimpa nama file/direktori existing. Semua file yang terdaftar di manifest harus benar-benar ada dan memakai hash terbaru.

### Syarat `guidebook_outline.md`

Struktur dibangun untuk pembaca non-IT, **berdasarkan alur kerja**, bukan urutan route/backend semata. Usulkan pembagian yang dapat langsung menjadi halaman pembuka modul, misalnya:

1. **Memulai dan Mengenal Sistem** — akses/Login (jika bukti cukup), Dashboard, navigasi.
2. **Mencari dan Memeriksa Harga Produk** — Cari Harga, filter, hasil pencarian, Harga per Brand.
3. **Melihat Informasi Produk dan Brosur** — daftar dan detail Brosur.
4. **Tanya Harga & Konsultasi Keluhan** — membuka modal, pilihan jenis produk, isian per varian, lampiran (visual-only), pengiriman deferred.
5. **Memantau Promosi dan Diskon** — daftar dan status; Apply/Arsip deferred.
6. **Mengelola Data Produk dan Harga** — Duplikat Harga & Edit Harga; baca/seleksi aman, eksekusi deferred.
7. **Administrasi Pengguna** — daftar dan akses; tambah/edit/sync deferred.

Ini **contoh pengelompokan editorial**, bukan pernyataan bahwa seluruh fitur pada bagian tersebut telah teruji. Terapkan daftar final berdasarkan hasil discovery. Jangan membuat bab kosong; jika bagian hanya visual-only, beri label yang tepat dan pisahkan placeholder langkah deferred dari instruksi siap pakai.

Setiap bab harus siap diturunkan menjadi: `Tujuan bagian`, `Apa yang akan Anda pelajari`, `Alur singkat jika diperlukan`, `Catatan penting role/risiko`, lalu `Fitur → Aktivitas → Screenshot asli beranotasi → Caption`. Ikuti identitas guidebook HRIS/To-Do, ringkas dan instruktif.

### Kriteria `guidebook_activity_cards.json`

Setiap aktivitas memuat judul dengan verba, manfaat/hasil teramati, prasyarat, role terverifikasi atau UNKNOWN, langkah aman bernomor, exact UI labels, evidence before/after, rencana panel screenshot, callout semantik, status, serta *jangan ditulis* untuk klaim yang belum terbukti. Jika satu aktivitas mutatif dikecualikan, **jangan menyisipkan instruksi klik Kirim/Simpan** dalam prosedur siap terbit.

---

## 10. VALIDASI KESIAPAN PENULISAN & KEBIJAKAN PENGECUALIAN

**GO_WITH_DOCUMENTED_EXCEPTIONS hanya boleh diberikan jika:**

- seluruh gate `G01–G15` yang relevan lulus; semua P0/P1 nonmutatif/keamanan/anotasi/referensi selesai;
- fitur global Tanya Harga dan ketiga pilihan jenis produknya terinventarisasi dengan bukti yang sesuai; tahap Kirim deferred;
- seluruh 8 modul baseline tetap terpetakan; modul baru tidak hilang dan ID lama tidak berubah;
- seluruh fitur yang aman diakses mempunyai activity yang siap ditulis atau alasan blocked yang spesifik, bukan `activities: []` tanpa penjelasan;
- setiap fitur mutatif mempunyai dossier serta gambar dasar yang sah dan diberi status `DEFERRED_DOCUMENTED`;
- hasil akhir benar-benar mempunyai `guidebook_outline`, `activity_cards`, `figure_manifest`, `annotation_plans` yang lolos review, dan readiness per bagian.

**Pengecualian yang diterima:** hanya langkah mutatif/role-blocked/ketentuan bisnis yang secara jujur tidak bisa dikonfirmasi tanpa izin atau staging. Pengecualian **tidak** mencakup token bocor, path rusak, gambar salah, fitur global hilang, QA fiktif, filter read-only yang aman tetapi sengaja tidak didokumentasikan, atau referensi tidak valid.

Jika syarat tersebut belum lulus, gunakan `PARTIAL` atau `NO_GO` dengan daftar tepat apa yang belum selesai. **Jangan pernah menulis `100% lengkap` atau `siap produksi` untuk sesuatu yang belum terbukti**, dan jangan menunda pelaporan kekurangan sampai setelah penulisan guidebook dimulai.

---

## 11. URUTAN EKSEKUSI (KERJAKAN, BUKAN SEKADAR MEMBUAT RENCANA)

**Fase 1 — Safety & baseline:** audit workspace read-only, daftar input yang tersedia, buat hash baseline, daftar operasi aman dan yang diblokir. Tentukan tempat output baru; jangan sentuh produksi.

**Fase 2 — Independent discovery:** audit ulang menu, global action, modal, dropdown, dan route. **Prioritas: Tanya Harga & Konsultasi Keluhan**; revisi inventaris modul/fitur tanpa mengubah ID lama.

**Fase 3 — Evidence closure:** lengkapi activity/read-only transitions, tiga varian formulir konsultasi, state before/after, registry field dan role; dokumentasikan semua deferred actions.

**Fase 4 — Data repair:** selesaikan seluruh temuan V4: sanitasi CSRF, perbaikan lima anotasi keliru, filter read-only, link pagination, mapping ID, metrik QA dan path portable.

**Fase 5 — Writer-ready pack:** hasilkan outline modul/aktivitas dan materi dasar yang sepenuhnya grounded; setiap langkah punya evidence dan batasan.

**Fase 6 — QA PASS A:** jalankan validator lengkap, perbaiki sampai seluruh gate relevan benar-benar lulus.

**Fase 7 — QA PASS B:** audit ulang independen; perbaiki ketidaksesuaian, lalu ulang PASS A/B bila hasil berubah.

**Fase 8 — ZIP dan PASS C:** export sanitized baru, reopen dan ekstrak ZIP final, scan privasi, validasi refs/hash/layout/evidence, review gambar. Ulang semua QA jika artefak berubah.

**Fase 9 — Penyerahan:** kirim link/path ZIP final, SHA-256, coverage matrix, report QA A/B/C, ringkasan modul+fitur+aktivitas, daftar pengecualian, daftar pertanyaan penting, dan keputusan readiness tiap bab.

**Jangan berhenti hanya karena menemukan keterbatasan satu fitur mutatif.** Selesaikan seluruh area aman. **Jangan meminta izin untuk tindakan mutatif sebagai syarat melanjutkan pekerjaan**, cukup catat untuk tahap akhir/staging. Jika ada keterbatasan koneksi atau role, hasil harus jujur dan reproduktif.

---

## 12. FORMAT LAPORAN AKHIR — WAJIB DIISI DARI HASIL SEBENARNYA

```text
RILIS: <run_id> / <timestamp> / <SHA256 ZIP>
KEPUTUSAN: GO_WITH_DOCUMENTED_EXCEPTIONS | PARTIAL | NO_GO
PRODUKSI: Tidak ada mutasi teramati di klien | Diverifikasi server | Tidak dapat dibuktikan
DATA LAMA: <jumlah file dibandingkan, hash PASS/FAIL, catatan keterbatasan>
DISCOVERY: <jumlah modul, fitur, global modal, halaman, activity, varian formulir>
TANYA HARGA: <lokasi trigger, 3 varian state, field, status Kirim deferred>
READ-ONLY: <jumlah READY, PARTIAL, BLOCKED; nama kegiatan yang masih gap>
MUTATIVE: <jumlah deferred dossiers dan cakupan bukti>
ANNOTATION: <jumlah semantic PASS / FAIL; daftar yang belum benar>
PRIVACY: <scan token+PII hasilnya, jumlah HTML/gambar diperiksa>
INTEGRITY: <refs valid, hashes, ZIP path, manifest>
QA PASS A: <gates PASS/FAIL dan lokasi laporan>
QA PASS B: <gates PASS/FAIL dan lokasi laporan>
QA PASS C: <audit ZIP yang benar-benar diserahkan>
GUIDEBOOK: <file outline, cards, figure plan, readiness per bab>
KNOWN GAPS: <daftar jujur, alasan, owner/staging action>
FINAL RECOMMENDATION: <apa yang sudah boleh langsung diproduksi>
```

**PENUTUP INSTRUKSI:** Laksanakan audit dan perbaikan hingga batas aman secara nyata. Jangan hanya menjanjikan, jangan menulis PASS tanpa pengujian, jangan mengubah data bisnis produksi, jangan merusak data historis, jangan melupakan fitur global Tanya Harga & Konsultasi Keluhan. Dataset final harus dapat langsung dipakai AI penyusun guidebook untuk bagian terverifikasi, sementara fitur mutatif tetap terpetakan dengan status dan bukti dasar yang jelas.
