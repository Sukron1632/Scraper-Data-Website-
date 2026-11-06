# BLUEPRINT KERANGKA RESMI GUIDEBOOK ZOLA (V4.2)
> **Web Pricelist PT Radiator Springs Indonesia**  
> *Baseline Freeze & Release Authority*

---

## 1. STRUKTUR BAB & ALUR KERJA NON-IT

Panduan ini disusun secara berorientasi alur pengguna (user workflow-driven), bukan berdasarkan urutan route teknis:

- **Bab 1 (SEC-01): Memulai dan Mengenal Sistem Web Pricelist**
  - Tinjauan antarmuka, ringkasan statistik metrik katalog produk, status program diskon, dan pintasan akses brosur digital.
  - *Aktivitas Terverifikasi:* `ACT-DASH-001`.

- **Bab 2 (SEC-02): Tanya Harga & Konsultasi Keluhan Pelanggan**
  - Panduan membuka form konsultasi global via floating button, memilih 3 varian produk (SPD Mobil, GRS Motor, Produk Lainnya Non-Kendaraan), memahami field wajib, dan pembatalan aman.
  - *Aktivitas Terverifikasi:* `ACT-CONSULT-001`, `ACT-CONSULT-002`.
  - *Catatan Pengecualian:* Aksi Kirim ke WhatsApp berstatus `MUTATIVE_DEFERRED` demi keamanan data live.

- **Bab 3 (SEC-03): Mencari dan Memeriksa Harga Produk**
  - SOP pencarian kata kunci real-time Livewire, penanganan pop-up onboarding Driver.js, filter merek resmi, konfigurasi kolom harga kasir, dan penjelajahan katalog 10 brand resmi.
  - *Aktivitas Terverifikasi:* `ACT-SEARCH-001`, `ACT-SEARCH-002`, `ACT-SEARCH-003`, `ACT-SEARCH-004`, `ACT-SEARCH-005`, `ACT-BRAND-001`.
  - *Catatan Pengecualian:* Tombol Tambah Merk dan Tambah Tipe berstatus `MUTATIVE_DEFERRED`.

- **Bab 4 (SEC-04): Meninjau Brosur Digital Resmi**
  - Navigasi daftar katalog brosur dan pemeriksaan rincian SKU produk yang tertaut pada brosur.
  - *Aktivitas Terverifikasi:* `ACT-BROSUR-001`, `ACT-BROSUR-002`.
  - *Catatan Pengecualian:* Aksi Upload Brosur Baru berstatus `MUTATIVE_DEFERRED`.

- **Bab 5 (SEC-05): Memantau Program Diskon dan Promosi**
  - Pemantauan program potongan harga aktif, persentase diskon, dan sisa masa berlaku promo.
  - *Aktivitas Terverifikasi:* `ACT-DISKON-001`.
  - *Catatan Pengecualian:* Aksi Tambah Diskon, Apply Diskon, dan Arsip berstatus `MUTATIVE_DEFERRED`.

- **Bab 6 (SEC-06): Manajemen Duplikat & Pembaruan Harga Massal**
  - Paginasi data duplikat PREV/NEXT dan antarmuka penandaan produk untuk edit harga.
  - *Aktivitas Terverifikasi:* `ACT-DUP-001`, `ACT-EDIT-001`.
  - *Catatan Pengecualian:* Eksekusi duplikasi dan penyimpanan perubahan harga berstatus `MUTATIVE_DEFERRED`.

- **Bab 7 (SEC-07): Administrasi Pengguna dan Hak Akses**
  - Tinjauan daftar akun karyawan aktif dan hak akses terdaftar dengan sanitasi data pribadi (PII).
  - *Aktivitas Terverifikasi:* `ACT-USER-001`.
  - *Catatan Pengecualian:* Sinkronisasi karyawan (Sync User) berstatus `MUTATIVE_DEFERRED`.

---

## 2. ATURAN PENULISAN UNTUK AI PENYUSUN GUIDEBOOK
1. Gunakan visual-first standard Zola: Dominan Oranye (`#E65100`), Charcoal (`#263238`), dan Putih.
2. Setiap langkah WAJIB menyertakan exact UI label yang tertera pada screenshot beranotasi.
3. DILARANG menyisipkan instruksi klik Simpan/Apply/Kirim untuk fitur berstatus `MUTATIVE_DEFERRED`.
