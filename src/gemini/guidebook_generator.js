const fs = require('fs');
const path = require('path');

function getDescriptiveTitle(pageData) {
  if (pageData.displayTitle) return pageData.displayTitle;
  const url = pageData.currentUrl || '';
  if (url.includes('/dashboard')) return 'Dashboard Utama & Ringkasan Sistem';
  if (url.includes('/search')) return 'Pencarian Harga & Simulasi Produk (Search)';
  if (url.includes('/harga?brand=')) {
    const brand = url.split('brand=')[1]?.split('&')[0];
    const bc = (pageData.breadcrumbs && pageData.breadcrumbs[0]) || brand;
    return `Katalog Harga Brand - ${bc.toUpperCase()}`;
  }
  if (url.includes('/admin/brosur/')) {
    const id = url.split('/admin/brosur/')[1];
    return `Detail Brosur & Produk Terdaftar (ID ${id})`;
  }
  if (url.includes('/admin/brosur')) return 'Manajemen Brosur & Brosur Digital';
  if (url.includes('/admin/diskon')) return 'Manajemen Diskon & Promo Harga';
  if (url.includes('/admin/user')) return 'Manajemen Pengguna & Hak Akses Akun';
  if (url.includes('/admin/duplicate')) return 'Pemeriksaan & Konfirmasi Duplikasi Massal';

  if (pageData.breadcrumbs && pageData.breadcrumbs.length > 0) {
    return pageData.breadcrumbs.join(' - ');
  }
  return pageData.pageTitle || 'Modul Operasional';
}

class GuidebookGenerator {
  constructor(orchestrator) {
    this.orchestrator = orchestrator;
    this.markdownDir = path.join(__dirname, '../../output/guidebook/markdown');
    this.aiExportDir = path.join(__dirname, '../../output/guidebook/ai_doc_export');
    this.referencesDir = path.join(__dirname, '../../references');

    if (!fs.existsSync(this.markdownDir)) fs.mkdirSync(this.markdownDir, { recursive: true });
    if (!fs.existsSync(this.aiExportDir)) fs.mkdirSync(this.aiExportDir, { recursive: true });
  }

  loadReferenceData() {
    let glossaryText = '';
    const glossaryPath = path.join(this.referencesDir, 'glossary_istilah.json');
    if (fs.existsSync(glossaryPath)) {
      try {
        const glossary = JSON.parse(fs.readFileSync(glossaryPath, 'utf8'));
        glossaryText = `\nKAMUS ISTILAH INTERNAL PERUSAHAAN (Wajib disesuaikan):\n` +
          (glossary.istilah || []).map(i => `- ${i.istilahSistem} -> Panggilan Karyawan: "${i.istilahKaryawan}" (${i.penjelasan})`).join('\n');
      } catch (err) {}
    }

    let sampleStyleGuide = '';
    const sampleDir = path.join(this.referencesDir, 'sample_guidebook');
    if (fs.existsSync(sampleDir)) {
      // Check for markdown, txt, or docx
      const sampleFiles = fs.readdirSync(sampleDir).filter(f => f.endsWith('.md') || f.endsWith('.txt') || f.endsWith('.docx'));
      if (sampleFiles.length > 0) {
        sampleStyleGuide = `
STANDAR ACUAN RESMI PERUSAHAAN (BENCHMARK: PANDUAN PENGGUNA PT RADIATOR SPRINGS INDONESIA):
Struktur wajib mengikuti pola visual-first:
1. PANDUAN OPERASIONAL / BAGIAN XX (Nama Modul)
   - Deskripsi fungsi modul secara padat & to-the-point
   - APA YANG AKAN ANDA PELAJARI (Daftar fitur 01, 02, 03 ringkas)
   - TIPS MEMBACA: "Ikuti nomor anotasi untuk mengenali bagian dari fitur dan tindakan yang tersedia pada setiap halaman."
2. Sub-bagian: [Nama Fitur] -> [Nama Kegiatan]
   - Header Gambar: "Gambar X – [Judul Kegiatan]"
   - PETA NOMOR ANOTASI GAMBAR [01], [02], [03] (Nomor Penanda, Elemen, Aksi, Fungsi Singkat)
   - LANGKAH LANGSUNG (Direct Step-by-Step mengacu ke nomor anotasi [XX])
   - SPESIFIKASI & PANDUAN PENGAMBILAN GAMBAR (Kondisi capture, focal point, apa yang harus diperhatikan)
   - HASIL TINDAKAN (Indikator visual bahwa proses berhasil)
`;
      }
    }

    return { glossaryText, sampleStyleGuide };
  }

  /**
   * Generates a module guide for a single page/feature.
   */
  async generateModuleChapter(pageData, analysisResult) {
    const descriptiveTitle = getDescriptiveTitle(pageData);
    pageData.displayTitle = descriptiveTitle;
    const safeSlug = `${String(pageData.pageIndex).padStart(2, '0')}_${descriptiveTitle.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase().replace(/_+/g, '_')}`;
    const chapterPath = path.join(this.markdownDir, `${safeSlug}.md`);

    // Reuse existing chapter if already generated and non-empty
    if (fs.existsSync(chapterPath)) {
      const existing = fs.readFileSync(chapterPath, 'utf8');
      if (existing.length > 500) {
        console.log(`[GuidebookGenerator] Reusing existing verified chapter for: "${descriptiveTitle}"`);
        return {
          title: descriptiveTitle,
          url: pageData.currentUrl,
          screenshotFile: pageData.screenshotFile,
          chapterPath,
          content: existing
        };
      }
    }

    console.log(`[GuidebookGenerator] Generating employee guide chapter for: "${descriptiveTitle}"`);
    const { glossaryText, sampleStyleGuide } = this.loadReferenceData();

    const prompt = `
Kamu adalah Penulis Buku Panduan Resmi Perusahaan (SOP & User Guide Specialist).
Susunlah BAB PANDUAN PRAKTIS untuk modul/halaman ini, khusus dirancang untuk KARYAWAN BIASA (Staff Operasional, kasir, admin gudang, customer service, dll) yang baru pertama kali menggunakan sistem atau sedang belajar sistem baru ini.

INFORMASI SISTEM:
Judul Modul: ${descriptiveTitle}
URL: ${pageData.currentUrl}
Gambar Tangkapan Layar: ${pageData.screenshotFile}
Hasil Analisis UI:
${analysisResult.analysis}
${glossaryText}
${sampleStyleGuide}

STRUKTUR STANDAR BUKU PANDUAN VISUAL-FIRST (SESUAI BENCHMARK PERUSAHAAN):
Prinsip Utama: Karyawan operasional LEBIH SUKA MELIHAT GAMBAR BERANOTASI daripada membaca teks panjang.
Teks harus sangat DIRECT, TO-THE-POINT, dan menjadi SUMBER KEBENARAN OPERASIONAL (Single Source of Truth).

Format Markdown yang Wajib Diikuti:
# PANDUAN OPERASIONAL / BAGIAN ${String(pageData.pageIndex).padStart(2, '0')}
## ${descriptiveTitle}
(Tulis 1 paragraf ringkas pembuka: fungsi utama modul dan siapa karyawan yang menggunakannya.)

### APA YANG AKAN ANDA PELAJARI
01 [Fitur Utama 1] - Penjelasan 1 kalimat
02 [Fitur Utama 2] - Penjelasan 1 kalimat

> **TIPS MEMBACA:** Ikuti nomor anotasi [01], [02], [03] untuk mengenali bagian dari fitur dan tindakan yang tersedia pada setiap halaman.

---

### Prosedur Kerja ${descriptiveTitle}
#### Gambar ${pageData.pageIndex} – ${descriptiveTitle}
![Tangkapan Layar](${pageData.screenshotFile})

#### 📌 Peta Anotasi Layar (Daftar Nomor Penanda)
| No Penanda | Bagian / Elemen Layar | Tindakan | Fungsi Operasional |
| :---: | :--- | :--- | :--- |
| **[01]** | (Nama tombol/kolom) | (Klik / Ketik / Pilih) | (Fungsi praktis bagi karyawan) |
| **[02]** | (Nama tombol/kolom) | (Klik / Ketik / Pilih) | (Fungsi praktis bagi karyawan) |
| **[03]** | (Nama tombol/kolom) | (Klik / Ketik / Pilih) | (Fungsi praktis bagi karyawan) |

#### 📝 Alur Langkah Langsung (Direct Step-by-Step SOP)
1. **Langkah 1:** (Instruksi langsung mengacu ke nomor penanda [01])
2. **Langkah 2:** (Instruksi langsung mengacu ke nomor penanda [02])
3. **Langkah 3:** (Instruksi langsung mengacu ke nomor penanda [03])

#### 📸 Panduan Pengambilan Gambar & Hal yang Harus Diperhatikan (Capture Spec)
- **Momen Capture Terbaik:** (Jelaskan kapan screenshot ini harus diambil)
- **Fokus Area Anotasi:** (Bagian layar mana yang wajib dilingkari/diberi kotak merah)
- **Hal yang Harus Diperhatikan:** (Tips penting saat mengambil gambar)
- **Hasil Tindakan (Expected Result):** (Apa yang terjadi di layar setelah langkah ini selesai)

#### ⚠️ Hal yang Boleh & TIDAK Boleh Dilakukan
- ✅ **Boleh:** (Tindakan yang aman)
- ❌ **Dilarang:** (Tindakan yang dilarang agar data sistem live tidak rusak)
`;

    const systemInstruction = `Kamu adalah instruktur dokumentasi SOP operasional visual tingkat tinggi di PT RADIATOR SPRINGS INDONESIA. Tuliskan panduan yang sangat direct, minim teks bertele-tele, fokus pada peta anotasi visual nomor [01], [02], [03], dan dapat langsung dijadikan acuan mutlak (Single Source of Truth) oleh pembuat ilustrasi maupun karyawan di lapangan.`;

    const result = await this.orchestrator.executeWithFailover({
      contents: [prompt],
      systemInstruction
    }, 'synthesizer');

    // Save individual markdown chapter
    fs.writeFileSync(chapterPath, result.text, 'utf8');

    return {
      title: descriptiveTitle,
      url: pageData.currentUrl,
      screenshotFile: pageData.screenshotFile,
      chapterPath,
      content: result.text
    };
  }

  /**
   * Compiles all chapters into a master guidebook and AI web export format.
   */
  async compileMasterGuidebook(chapters, systemOverview = {}) {
    console.log(`[GuidebookGenerator] Compiling Master Guidebook (${chapters.length} chapters)...`);

    let masterMarkdown = `# BUKU PANDUAN OPERASIONAL SISTEM (USER GUIDEBOOK)\n`;
    masterMarkdown += `> **Panduan Lengkap Langkah Demi Langkah untuk Karyawan Operasional**\n`;
    masterMarkdown += `> Versi Dokumen: 1.0 | Tanggal: ${new Date().toLocaleDateString('id-ID')} | Status: Terverifikasi Aman\n\n`;

    masterMarkdown += `## KATA PENGANTAR\n`;
    masterMarkdown += `Buku panduan ini dibuat khusus untuk memandu rekan-rekan karyawan dalam memahami dan menjalankan alur operasional sistem yang sedang dikembangkan. Buku ini ditulis dari sudut pandang kerja nyata sehari-hari, agar rekan-rekan dapat dengan mudah mengoperasikan sistem dengan benar sejak hari pertama, hingga lama-kelamaan menjadi mahir dan terbiasa tanpa memerlukan buku panduan lagi.\n\n`;

    masterMarkdown += `## DAFTAR ISI MODUL\n`;
    chapters.forEach((ch, idx) => {
      masterMarkdown += `${idx + 1}. [${ch.title}](#bab-${idx + 1}-${ch.title.toLowerCase().replace(/[^a-z0-9]/g, '-')})\n`;
    });
    masterMarkdown += `\n---\n\n`;

    chapters.forEach((ch, idx) => {
      masterMarkdown += `<div id="bab-${idx + 1}-${ch.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}"></div>\n\n`;
      masterMarkdown += `${ch.content}\n\n`;
      masterMarkdown += `---\n\n`;
    });

    const masterPath = path.join(this.markdownDir, 'BUKU_PANDUAN_LENGKAP.md');
    fs.writeFileSync(masterPath, masterMarkdown, 'utf8');

    // Create AI Web Document Builder Export Package
    const aiExportData = {
      title: 'Buku Panduan Operasional Sistem (Karyawan Biasa)',
      generatedAt: new Date().toISOString(),
      promptForAiWeb: `Buatkan dokumen Word (.docx) formal, profesional, dan estetik berdasarkan data panduan operasional berikut. Susun dengan daftar isi otomatis, heading bergaya modern, tabel terstruktur, kotak peringatan (callout boxes), dan nomor langkah yang jelas. Format dokumen ini ditujukan untuk dibaca dan dipraktikkan langsung oleh karyawan baru di lapangan.`,
      tableOfContents: chapters.map(c => c.title),
      chapters: chapters.map(c => ({
        moduleTitle: c.title,
        url: c.url,
        screenshot: c.screenshotFile,
        markdownContent: c.content
      }))
    };

    const aiExportFile = path.join(this.aiExportDir, 'export_for_ai_doc.json');
    fs.writeFileSync(aiExportFile, JSON.stringify(aiExportData, null, 2), 'utf8');

    // Also write a ready-to-copy text prompt for ChatGPT / Claude / Gamma / Office 365 Copilot
    const copyPastePromptFile = path.join(this.aiExportDir, 'COPY_PASTE_KE_AI_WEBSITE.txt');
    const copyPasteText = `Halo AI, tolong ubah draf materi panduan berikut menjadi dokumen Microsoft Word (.docx) yang sangat rapi dan siap cetak untuk karyawan perusahaan:\n\n` +
      `INSTRUKSI DESAIN WORD:\n` +
      `1. Berikan cover page modern dengan judul "Buku Panduan Operasional Karyawan".\n` +
      `2. Buat Daftar Isi (Table of Contents).\n` +
      `3. Format setiap langkah menjadi nomor urut tebal (Step 1, Step 2).\n` +
      `4. Ubah daftar istilah dan troubleshooting menjadi tabel bergaris halus yang rapi.\n` +
      `5. Sisipkan kotak tips dan peringatan (Callout Box) dengan warna latar lembut.\n\n` +
      `--- MATERI PANDUAN LENGKAP ---\n\n` + masterMarkdown;
    fs.writeFileSync(copyPastePromptFile, copyPasteText, 'utf8');

    console.log(`[GuidebookGenerator] Master Guidebook created at: ${masterPath}`);
    console.log(`[GuidebookGenerator] AI Web export files saved at: ${this.aiExportDir}`);

    return {
      masterPath,
      aiExportFile,
      copyPastePromptFile,
      masterMarkdown
    };
  }
}

module.exports = { GuidebookGenerator };

