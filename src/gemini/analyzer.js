const fs = require('fs');

class PageAnalyzer {
  constructor(orchestrator) {
    this.orchestrator = orchestrator;
  }

  /**
   * Analyzes a crawled page combining screenshot (vision) and DOM structure.
   */
  async analyzePage(pageData) {
    console.log(`[PageAnalyzer] Analyzing UI for: "${pageData.pageTitle}" (${pageData.currentUrl})`);

    const contents = [];

    // Attach screenshot if exists
    if (pageData.screenshotPath && fs.existsSync(pageData.screenshotPath)) {
      const imgBuffer = fs.readFileSync(pageData.screenshotPath);
      const base64Img = imgBuffer.toString('base64');
      contents.push({
        inlineData: {
          mimeType: 'image/png',
          data: base64Img
        }
      });
    }

    const domContext = `
Halaman: ${pageData.pageTitle}
URL: ${pageData.currentUrl}
Breadcrumbs: ${pageData.breadcrumbs.join(' > ') || '-'}
Headings: ${pageData.headings.map(h => `${h.tag.toUpperCase()}: ${h.text}`).join(' | ')}
Daftar Menu Tersedia: ${pageData.navigationLinks.map(n => n.text).join(', ') || '-'}
Form Fields (Kolom Input): ${JSON.stringify(pageData.formFields, null, 2)}
Tabel & Data: ${JSON.stringify(pageData.tables, null, 2)}
Tombol Aksi: ${pageData.actionButtons.join(', ') || '-'}
Role Pengguna: ${pageData.role || 'Karyawan Operasional'}
`;

    contents.push(`
Analisis halaman ini dengan cermat. Kamu adalah AI Spesialis Sistem yang sedang meneliti antarmuka aplikasi operasional untuk menyusun Standard Operating Procedure (SOP) dan Buku Panduan (Guidebook) bagi KARYAWAN BIASA (Staff Operasional non-teknis).

Konteks Halaman:
${domContext}

TUGAS ANALISIS MENDALAM (STANDAR VISUAL-FIRST GUIDEBOOK):
1. PEMETAAN TITIK ANOTASI VISUAL ([01], [02], [03], dst):
   - Buat daftar nomor penanda anotasi untuk setiap tombol, kolom input, filter, atau informasi penting pada tangkapan layar ini.
   - Untuk setiap nomor [XX], tentukan:
     * Nama Elemen UI & Posisi Relatif di Layar
     * Tindakan Karyawan (Klik / Ketik / Pilih / Periksa)
     * Fungsi Singkat & Jelas (maksimal 1-2 kalimat langsung ke intinya)

2. PANDUAN PENGAMBILAN GAMBAR (SCREENSHOT CAPTURE SPEC):
   - Momen yang tepat saat mengambil screenshot (kondisi layar: apakah saat form masih kosong, saat dropdown terbuka, atau saat data sudah terisi?).
   - Fokus Area (Bagian mana yang harus menjadi fokus utama kotak anotasi).
   - Hal yang Harus Diperhatikan saat Capture (misal: pastikan data sensitif NIK/harga tidak bocor, pastikan tombol aksi tidak terpotong).

3. ALUR LANGKAH OPERASIONAL LANGSUNG (DIRECT STEP-BY-STEP):
   - Tuliskan langkah operasional yang sangat to-the-point tanpa basa-basi:
     Contoh: "1. Klik tombol [01] Tambah di kanan atas. 2. Isi kolom [02] Nama Barang. 3. Klik [03] Simpan."

4. HASIL TINDAKAN (EXPECTED RESULT):
   - Apa indikator visual bahwa tindakan berhasil (misal: muncul notifikasi hijau, data langsung masuk ke baris pertama tabel).

5. HAL YANG HARUS DIPERHATIKAN / LARANGAN (DO'S & DON'TS):
   - Peringatan krusial agar tidak salah pencet pada sistem live.
`);

    const systemInstruction = `Kamu adalah analis sistem ahli yang berfokus pada pengalaman pengguna (UX) dan penyusunan SOP ramah karyawan biasa. Berikan penjelasan yang sangat jelas, ramah, dan aplikatif.`;

    const result = await this.orchestrator.executeWithFailover({
      contents,
      systemInstruction
    }, 'analyst');

    return {
      pageIndex: pageData.pageIndex,
      pageTitle: pageData.pageTitle,
      url: pageData.currentUrl,
      screenshotFile: pageData.screenshotFile,
      analysis: result.text,
      usedClient: result.usedClient
    };
  }
}

module.exports = { PageAnalyzer };

