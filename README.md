# 📘 Antigravity Guidebook Engine & Safe Crawler
### Lingkungan Otomasi Ekstraksi Data & Orkestrasi Dual Gemini untuk Buku Panduan Karyawan

Lingkungan kerja mandiri (*standalone*) ini dibangun khusus untuk mengambil data dan alur antarmuka dari **sistem operasional yang sedang berjalan live**, tanpa mengganggu kinerja server dan tanpa risiko mengubah atau merusak data perusahaan. Data yang diambil dianalisis dan disusun menjadi **Buku Panduan Operasional (Guidebook / SOP)** dari **perspektif karyawan biasa (non-teknis)** agar mudah dipelajari dari awal hingga karyawan mahir secara mandiri.

---

## 🚀 Fitur Utama & Arsitektur

1. **Playwright & Scrapling Dual-Engine Architecture**:
   - **Playwright MCP & Chromium Automation**: Terhubung dengan MCP Playwright global di `~/.gemini/config/mcp_config.json` untuk visual screenshot & interaksi browser.
   - **Scrapling Engine (D4Vinci)**: Terinstal dengan paket `scrapling[ai]` untuk pengambilan data massal (*mass data extraction*) yang sangat cepat, cerdas melewati anti-bot (StealthyFetcher), dan otomatis mengubah isi halaman menjadi Markdown bersih (*page.markdown*) yang sangat menghemat token AI.
   - **Built-in Scrapling MCP Server**: Terdaftar aktif di `~/.gemini/config/mcp_config.json` sehingga asisten AI dapat langsung menggunakan tool pengambilan dan ekstraksi data cerdas dari Scrapling secara native.
   
2. **Strict Read-Only Guardrails (Anti Rusak & Anti Mutasi Data)**:
   - **Intersepsi Jaringan**: Memblokir seluruh request HTTP `POST`, `PUT`, `DELETE`, `PATCH` pada sistem live (hanya login awal yang diizinkan jika dikonfigurasi).
   - **Intersepsi DOM Browser**: Menonaktifkan tombol submit form dan tombol berbahaya (*simpan, update, ubah, hapus, destroy, bayar, batalkan, create*) secara otomatis agar tidak dapat dieksekusi.
   - **Safe Action Filter**: Membatasi klik hanya pada navigasi menu, tab, pagination, dan tombol lihat detail/baca saja.

3. **Server Load Throttling (Ramah Server Operasional)**:
   - **Rate Limiting Delay**: Jeda waktu aman (2.000 ms – 4.000 ms) di setiap perpindahan halaman.
   - **Strict Concurrency = 1**: Berjalan berurutan secara serial agar beban server produksi tetap sangat ringan.
   - **Exponential Backoff**: Otomatis mundur dan menunggu jeda panjang jika server mendeteksi status HTTP 429 atau 503.

4. **Dual Gemini Token Orchestration (Gemini 3.8 Flash High Accuracy)**:
   - Menggunakan `@google/genai` resmi dengan orkestrasi 2 token API:
     - **Token 1 (Explorer & Vision Analyst)**: Menganalisis screenshot visual, hierarki antarmuka, arti kolom tabel, dan fungsi kolom input.
     - **Token 2 (Guidebook Synthesizer & Auditor)**: Menyusun narasi SOP ramah karyawan biasa, menyusun kamus istilah awam, dan melakukan audit silang dokumen.
     - **Automatic Failover**: Jika salah satu token kehabisan kuota atau terkena limitasi rate, token kedua otomatis mengambil alih tanpa menghentikan proses.

5. **Perspektif Karyawan Biasa**:
   - Ditulis bukan dalam bahasa programmer/teknis, melainkan bahasa operasional sehari-hari.
   - Menyediakan kamus istilah awam, urutan langkah 1-2-3 yang jelas, tips menghindari human error, dan teknik menghafal alur agar lama-kelamaan tidak perlu melihat buku panduan lagi.

6. **Ekspor Fleksibel & Audit Silang**:
   - **Langsung ke Word (.docx)**: Menghasilkan file Word resmi berformat rapi lengkap dengan tangkapan layar.
   - **Paket AI Website**: Menyediakan prompt dan file JSON siap pakai untuk ditempelkan ke AI web pembuat dokumen Word (Gamma, ChatGPT, Claude, Microsoft 365 Copilot).
   - **Cross-Audit Module**: Membandingkan dokumen hasil AI Web dengan fakta asli sistem untuk mendeteksi halusinasi, tombol salah sebut, atau menu yang terlewat.

---

## 📂 Struktur Direktori Proyek

```text
e:\Radiator Springs\pricelist/
├── .env.example                       # Template konfigurasi environment & kredensial
├── .env                              # File konfigurasi aktif (masukkan URL & kredensial di sini)
├── package.json                       # Dependensi dan script CLI
├── config/
│   ├── safety_guardrails.json         # Aturan ketat proteksi Read-Only & kata kunci terlarang
│   └── crawler_config.json           # Pengaturan jeda waktu (throttling), resolusi, dan batas crawl
├── src/
│   ├── auth/
│   │   └── session_manager.js        # Manajemen sesi multi-role (Staff Operasional & IT Admin)
│   ├── crawler/
│   │   ├── guardrails.js             # Filter keamanan jaringan dan pencegah klik mutasi
│   │   ├── safe_crawler.js           # Mesin crawler ramah server dengan screenshot & checkpoint
│   │   └── dom_parser.js             # Ekstraksi komponen form, tabel, menu, dan teks halaman
│   ├── gemini/
│   │   ├── token_manager.js          # Orkestrator 2 Token Gemini dengan failover otomatis
│   │   ├── analyzer.js               # Analis visual screenshot & DOM (Worker 1)
│   │   ├── guidebook_generator.js    # Penulis SOP panduan karyawan (Worker 2)
│   │   └── auditor.js                # Modul audit silang draf AI Web terhadap sistem asli
│   ├── exporters/
│   │   └── docx_exporter.js          # Pembuat file Microsoft Word (.docx) langsung
│   └── index.js                      # Controller CLI utama
├── storage/
│   ├── sessions/                     # File cache login/cookies agar tidak login berulang
│   ├── screenshots/                  # Gambar tangkapan layar beresolusi tinggi
│   ├── raw_pages/                    # Data JSON mentah struktur setiap halaman yang dicrawl
│   └── checkpoints/                  # File resume jika proses crawl sempat dihentikan
└── output/
    ├── guidebook/
    │   ├── markdown/                 # Bab-bab panduan dalam format Markdown per modul
    │   ├── docx/                     # Dokumen Word (.docx) hasil kompilasi
    │   └── ai_doc_export/            # File JSON & prompt siap tempel untuk AI Web
    └── audit/                        # Laporan hasil audit silang jika draf AI Web dikoreksi
```

---

## ⚙️ Cara Pengaturan (Setup)

### 1. Isi Kredensial dan Token di `.env`
Buka file `.env` di folder proyek ini dan sesuaikan nilainya:

```env
# URL Sistem Operasional Live
BASE_URL=https://sistem-anda.internal.com

# 2 Token API Gemini (Untuk Akurasi Tinggi & Load Balancing)
GEMINI_API_KEY_1=AIzaSy_TOKEN_PERTAMA_ANDA
GEMINI_API_KEY_2=AIzaSy_TOKEN_KEDUA_ANDA

# Kredensial Pengguna Karyawan Biasa
AUTH_EMPLOYEE_USERNAME=staff_kasir_atau_admin
AUTH_EMPLOYEE_PASSWORD=password_karyawan

# Kredensial Tim IT (Opsional)
AUTH_IT_USERNAME=it_support
AUTH_IT_PASSWORD=password_it

# Role aktif yang digunakan saat crawl: 'employee' atau 'it'
ACTIVE_CRAWL_ROLE=employee

# Pengaman Ketat (Wajib 'true' untuk sistem live)
SAFE_MODE=true

# Jeda Kecepatan Crawl (ms) agar server tidak terbebani
RATE_LIMIT_DELAY_MS=2500
```

---

## 🛠️ Panduan Menjalankan Perintah (Commands)

| Perintah | Deskripsi |
| :--- | :--- |
| `npm run crawl` | Menjalankan crawler aman Playwright (*read-only*), mengambil screenshot & DOM halaman. |
| `npm run crawl:scrapling` | Ekstraksi data massal super cepat & hemat token menggunakan Scrapling Fetcher. |
| `npm run crawl:scrapling:stealth` | Ekstraksi Scrapling dengan mode anti-bot siluman (*StealthyFetcher*). |
| `npm run analyze` | Menganalisis screenshot visual & form dengan Token Gemini 1 (Analyst). |
| `npm run generate` | Menyusun bab-bab buku panduan SOP karyawan dengan Token Gemini 2 (Synthesizer). |
| `npm run export:docx` | Mengubah hasil panduan langsung menjadi file Microsoft Word (.docx) bergambar. |
| `npm run pipeline` | Menjalankan seluruh proses otomatis dari hulu ke hilir (Crawl $\rightarrow$ Analyze $\rightarrow$ Generate $\rightarrow$ Word). |
| `npm run audit` | Melakukan audit silang draf dari AI Web terhadap fakta sistem sebenarnya. |
| `npm run browser:inspect` | Membuka browser Chromium interaktif dengan penjagaan guardrail anti-rusak. |
| `npm run mcp:scrapling` | Menjalankan built-in MCP server Scrapling secara langsung via terminal. |

---

## 🔄 Alur Integrasi AI Website & Audit Silang

1. **Kirim Data ke AI Website**:
   - Setelah menjalankan crawl dan generate, buka folder: `output/guidebook/ai_doc_export/`.
   - File `COPY_PASTE_KE_AI_WEBSITE.txt` berisi prompt rapi yang dapat Anda tempelkan langsung ke website AI pembuat dokumen Word.
   - File `export_for_ai_doc.json` berisi data terstruktur jika website AI tersebut menerima upload JSON/API.

2. **Audit Silang Jika AI Web Ada yang Kurang**:
   - Jika hasil Word dari website AI dirasa ada langkah yang kurang, tombol salah sebut, atau halusinasi:
     1. Tempelkan teks dari AI Web tersebut ke dalam file `output/audit/DRAFT_TO_AUDIT.txt` (atau arahkan dengan parameter `--doc`).
     2. Jalankan perintah:
        ```bash
        npm run audit
        ```
     3. Sistem akan membandingkan teks tersebut dengan data nyata sistem dan mengeluarkan laporan lengkap di `output/audit/LAPORAN_AUDIT_<tanggal>.md`, lengkap dengan **rekomendasi teks perbaikan siap pakai**.

