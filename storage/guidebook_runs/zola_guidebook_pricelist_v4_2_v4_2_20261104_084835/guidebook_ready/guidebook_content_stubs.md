# RANGKUMAN KONTEN INSTRUKSI PER AKTIVITAS (V4.2)

### ACT-DASH-001: Memantau Metrik Katalog Produk dan Shortcut Brosur Digital
- **Tujuan:** Ringkasan total statistik produk, status promo aktif, dan tombol akses cepat brosur terpantau jelas di layar.
- **Role Teramati:** Staff / IT Administrator (NANA)
- **Langkah-langkah Terverifikasi:**
  1. Perhatikan kartu metrik statistik pada bagian atas halaman Dashboard. (Label UI: `Statistik Katalog`)
  2. Gunakan widget kartu brosur di bawahnya untuk melihat atau mengunduh brosur versi HD. (Label UI: `Open (HD) / Download`)
- **Batasan Penulisan:** Dilarang mengklaim efek mutatif yang belum diuji di staging.


### ACT-SEARCH-001: Menutup Pop-up Panduan Interaktif saat Pertama Masuk
- **Tujuan:** Pop-up panduan Driver.js tertutup dan antarmuka pencarian siap digunakan secara leluasa.
- **Role Teramati:** Staff / IT Administrator (NANA)
- **Langkah-langkah Terverifikasi:**
  1. Saat pop-up Driver.js muncul, klik tombol 'Lewati Panduan' atau 'Tutup'. (Label UI: `Lewati Panduan`)
  2. Verifikasi pop-up tertutup dan kotak pencarian menjadi fokus. (Label UI: `Cari produk...`)
- **Batasan Penulisan:** Dilarang mengklaim efek mutatif yang belum diuji di staging.


### ACT-SEARCH-002: Mencari Produk Spesifik Menggunakan Kata Kunci
- **Tujuan:** Tabel menampilkan daftar baris produk yang sesuai kata kunci secara real-time.
- **Role Teramati:** Staff / IT Administrator (NANA)
- **Langkah-langkah Terverifikasi:**
  1. Ketik kata kunci produk (misal: 'speedometer') pada kolom pencarian. (Label UI: `Cari produk...`)
  2. Tunggu pembaruan otomatis tabel Livewire tanpa menekan tombol enter. (Label UI: `Daftar Produk`)
- **Batasan Penulisan:** Dilarang mengklaim efek mutatif yang belum diuji di staging.


### ACT-SEARCH-003: Melihat Tampilan saat Produk Tidak Ditemukan (Empty State)
- **Tujuan:** Tabel menyajikan pesan informatif bahwa produk dengan kata kunci tersebut tidak tersedia.
- **Role Teramati:** Staff / IT Administrator (NANA)
- **Langkah-langkah Terverifikasi:**
  1. Ketik kata kunci yang tidak terdapat dalam katalog. (Label UI: `Cari produk...`)
  2. Konfirmasi munculnya pesan 'Data tidak ditemukan' dan bersihkan kembali input pencarian. (Label UI: `Data tidak ditemukan`)
- **Batasan Penulisan:** Dilarang mengklaim efek mutatif yang belum diuji di staging.


### ACT-SEARCH-004: Memilih Brand Tertentu untuk Menyaring Hasil Pencarian
- **Tujuan:** Daftar produk pada tabel hanya memuat item dari brand yang dipilih.
- **Role Teramati:** Staff / IT Administrator (NANA)
- **Langkah-langkah Terverifikasi:**
  1. Klik dropdown pemilih brand di bawah bilah pencarian. (Label UI: `Semua Brand`)
  2. Pilih salah satu merek resmi (misal: 'Boostlab'). (Label UI: `Boostlab`)
- **Batasan Penulisan:** Dilarang mengklaim efek mutatif yang belum diuji di staging.


### ACT-SEARCH-005: Mengatur Jumlah Baris Tampilan dan Konfigurasi Kolom Harga
- **Tujuan:** Tabel menyesuaikan kapasitas baris (10/25/50/100) dan menampilkan kolom harga yang dicentang.
- **Role Teramati:** Staff / IT Administrator (NANA)
- **Langkah-langkah Terverifikasi:**
  1. Pilih batas baris per halaman pada dropdown limit di kanan atas tabel. (Label UI: `10 / 25 / 50 / 100`)
  2. Aktifkan atau nonaktifkan toggle kolom harga sesuai kebutuhan analisis kasir. (Label UI: `✓ Harga End User / ✓ Harga Bengkel`)
- **Batasan Penulisan:** Dilarang mengklaim efek mutatif yang belum diuji di staging.


### ACT-BRAND-001: Memilih Merek Resmi pada Katalog Produk Spesifik
- **Tujuan:** Layar memuat katalog produk lengkap yang terbagi atas kategori dan tipe kendaraan.
- **Role Teramati:** Staff / IT Administrator (NANA)
- **Langkah-langkah Terverifikasi:**
  1. Pilih merek resmi dari menu daftar brand (misal: 'SPD Speedometer'). (Label UI: `SPD Speedometer`)
  2. Telusuri kategori aftermarket dan model kendaraan yang tersedia. (Label UI: `Katalog Brand`)
- **Batasan Penulisan:** Dilarang mengklaim efek mutatif yang belum diuji di staging.


### ACT-BROSUR-001: Melihat Rincian Pemetaan Produk dalam Brosur Digital
- **Tujuan:** Tabel rincian brosur menampilkan kode SKU dan daftar produk yang tertaut pada brosur ID 1103.
- **Role Teramati:** Staff / IT Administrator (NANA)
- **Langkah-langkah Terverifikasi:**
  1. Klik tombol atau tautan rincian pada salah satu brosur di daftar. (Label UI: `Detail Brosur`)
  2. Periksa tabel pemetaan produk dan nomor halaman brosur. (Label UI: `Tabel Pemetaan Produk`)
- **Batasan Penulisan:** Dilarang mengklaim efek mutatif yang belum diuji di staging.


### ACT-BROSUR-002: Menavigasi dan Meninjau Daftar Katalog Brosur Digital
- **Tujuan:** Daftar seluruh brosur digital resmi perusahaan tampil lengkap dengan thumbnail dan tanggal terbit.
- **Role Teramati:** Staff / IT Administrator (NANA)
- **Langkah-langkah Terverifikasi:**
  1. Buka menu Brosur pada bilah navigasi utama. (Label UI: `Brosur`)
  2. Tinjau daftar brosur aktif dan gunakan fitur pencarian brosur jika diperlukan. (Label UI: `Daftar Brosur`)
- **Batasan Penulisan:** Dilarang mengklaim efek mutatif yang belum diuji di staging.


### ACT-DISKON-001: Memeriksa Status dan Masa Berlaku Program Diskon Aktif
- **Tujuan:** Pengguna dapat memantau nama diskon, persentase potongan, periode berlaku, dan sisa waktu promo.
- **Role Teramati:** Staff / IT Administrator (NANA)
- **Langkah-langkah Terverifikasi:**
  1. Tinjau kolom persentase dan tanggal berlaku pada tabel program diskon. (Label UI: `Nilai Diskon / Sisa Waktu`)
- **Batasan Penulisan:** Dilarang mengklaim efek mutatif yang belum diuji di staging.


### ACT-USER-001: Meninjau Daftar Akun Pengguna dan Status Hak Akses
- **Tujuan:** Tabel menampilkan nama akun, role, dan tanggal pendaftaran dengan data sensitif tersanitasi.
- **Role Teramati:** Staff / IT Administrator (NANA)
- **Langkah-langkah Terverifikasi:**
  1. Buka modul User & Karyawan dan periksa daftar nama serta hak akses yang terdaftar. (Label UI: `Daftar Akun`)
- **Batasan Penulisan:** Dilarang mengklaim efek mutatif yang belum diuji di staging.


### ACT-DUP-001: Menavigasi Halaman Data Duplikat Menggunakan Tombol NEXT
- **Tujuan:** Tabel duplikat memuat baris data halaman berikutnya dengan nomor halaman terbarui.
- **Role Teramati:** Staff / IT Administrator (NANA)
- **Langkah-langkah Terverifikasi:**
  1. Gulir ke kontrol navigasi paginasi di atas atau bawah tabel. (Label UI: `PREV / NEXT`)
  2. Klik tombol 'NEXT' untuk berpindah ke halaman data berikutnya. (Label UI: `NEXT`)
- **Batasan Penulisan:** Dilarang mengklaim efek mutatif yang belum diuji di staging.


### ACT-EDIT-001: Memeriksa Status Tombol Edit (0) Disabled pada Seleksi Produk
- **Tujuan:** Tombol 'Edit (0)' teramati dalam keadaan nonaktif (disabled) hingga produk dicentang.
- **Role Teramati:** Staff / IT Administrator (NANA)
- **Langkah-langkah Terverifikasi:**
  1. Perhatikan tombol 'Edit (0)' di kanan atas tabel sebelum ada produk yang dipilih. (Label UI: `Edit (0)`)
  2. Perhatikan kotak centang (checkbox) pada baris produk yang menjadi syarat aktivasi tombol. (Label UI: `Pilih Produk`)
- **Batasan Penulisan:** Dilarang mengklaim efek mutatif yang belum diuji di staging.


### ACT-CONSULT-001: Membuka Form Konsultasi & Memilih Varian Produk (Mobil, Motor, Non-Kendaraan)
- **Tujuan:** Jendela pop-up konsultasi terbuka dan formulir menyesuaikan field isian berdasarkan opsi jenis produk yang diklik.
- **Role Teramati:** Staff / IT Administrator (NANA)
- **Langkah-langkah Terverifikasi:**
  1. Klik tombol mengambang 'Tanya Harga' di pojok kanan bawah. (Label UI: `Tanya Harga`)
  2. Pilih salah satu varian jenis produk: SPD Mobil, GRS Motor, atau Produk Lainnya Non-Kendaraan. (Label UI: `Pilihan Jenis Produk`)
- **Batasan Penulisan:** Dilarang mengklaim efek mutatif yang belum diuji di staging.


### ACT-CONSULT-002: Membatalkan Form Konsultasi via Tombol Batal
- **Tujuan:** Jendela pop-up konsultasi tertutup seketika tanpa ada data yang terkirim ke WhatsApp.
- **Role Teramati:** Staff / IT Administrator (NANA)
- **Langkah-langkah Terverifikasi:**
  1. Klik tombol 'Batal' di pojok kanan bawah jendela formulir konsultasi. (Label UI: `Batal`)
  2. Konfirmasi jendela tertutup dan antarmuka kembali ke kondisi awal. (Label UI: `Modal Tertutup`)
- **Batasan Penulisan:** Dilarang mengklaim efek mutatif yang belum diuji di staging.

