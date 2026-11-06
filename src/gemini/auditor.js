const fs = require('fs');
const path = require('path');

class GuidebookAuditor {
  constructor(orchestrator) {
    this.orchestrator = orchestrator;
    this.rawPagesDir = path.join(__dirname, '../../storage/raw_pages');
    this.auditOutputDir = path.join(__dirname, '../../output/audit');

    if (!fs.existsSync(this.auditOutputDir)) {
      fs.mkdirSync(this.auditOutputDir, { recursive: true });
    }
  }

  /**
   * Audits generated Word/AI web text against ground truth crawled system data.
   */
  async auditDocument(externalDocText, moduleTarget = null) {
    console.log(`[GuidebookAuditor] Starting Cross-Audit between generated document and live system data...`);

    // Load ground truth crawled pages
    const rawFiles = fs.readdirSync(this.rawPagesDir).filter(f => f.endsWith('.json'));
    const groundTruthPages = rawFiles.map(file => {
      try {
        return JSON.parse(fs.readFileSync(path.join(this.rawPagesDir, file), 'utf8'));
      } catch {
        return null;
      }
    }).filter(Boolean);

    if (groundTruthPages.length === 0) {
      console.warn(`[GuidebookAuditor] Warning: No crawled raw pages found in ${this.rawPagesDir}. Audit will run with best-effort mode.`);
    }

    const groundTruthSummary = groundTruthPages.map(p => ({
      title: p.pageTitle,
      url: p.currentUrl,
      fields: p.formFields.map(f => f.label),
      actions: p.actionButtons,
      tables: p.tables.map(t => t.headers.join(', '))
    }));

    const auditPrompt = `
Kamu adalah Senior QA Auditor Dokumentasi Sistem & Kurikulum Pelatihan Karyawan.
Tugasmu adalah melakukan AUDIT SILANG (CROSS-AUDIT) antara Dokumen/Buku Panduan yang dihasilkan oleh AI Website eksternal dengan Data Fakta Nyata (Ground Truth) yang diambil langsung dari sistem operasional live.

DOKUMEN DARI AI WEBSITE YANG DIAUDIT:
"""
${externalDocText}
"""

DATA FAKTA NYATA DARI SISTEM (GROUND TRUTH):
"""
${JSON.stringify(groundTruthSummary, null, 2)}
"""

KRITERIA AUDIT YANG WAJIB DIANALISIS:
1. KELENGKAPAN (Completeness):
   - Apakah ada menu, halaman, atau kolom input penting yang terlewat / tidak dijelaskan oleh AI Web?
2. KETEPATAN FAKTA (Factual Accuracy):
   - Apakah nama tombol, nama menu, atau istilah yang ditulis AI Web berbeda dengan yang ada di sistem aslinya? (Sebutkan bila ada halusinasi/salah sebut).
3. KEAMANAN DATA OPERASIONAL (Safety Guardrails):
   - Apakah AI Web menyarankan karyawan mengeklik tombol berbahaya (hapus/ubah data) tanpa peringatan ganda? Ingat: ini sistem live operasional!
4. KEJELASAN UNTUK KARYAWAN BIASA (User-Friendliness):
   - Apakah penjelasannya terlalu teknis atau membingungkan? Apakah urutan langkahnya logis bagi orang awam?
5. REKOMENDASI PERBAIKAN & TEKS REVISI SIAP PAKAI:
   - Berikan teks revisi langsung (copy-paste ready) untuk bagian-bagian yang dinilai kurang atau keliru, sehingga pengguna bisa langsung mengirimkannya kembali ke AI Website atau menggantinya di Word.

FORMAT LAPORAN AUDIT:
Gunakan bahasa Indonesia profesional, sertakan skor kelayakan (0-100%), daftar temuan poin demi poin, dan blok teks perbaikan.
`;

    const systemInstruction = `Kamu adalah auditor dokumentasi teknis yang teliti dan analitis. Jangan lewatkan ketidaksesuaian sekecil apapun antara dokumen yang diaudit dengan kenyataan sistem di lapangan.`;

    const result = await this.orchestrator.executeWithFailover({
      contents: [auditPrompt],
      systemInstruction
    }, 'synthesizer');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(this.auditOutputDir, `LAPORAN_AUDIT_${timestamp}.md`);
    fs.writeFileSync(reportPath, result.text, 'utf8');

    console.log(`[GuidebookAuditor] Cross-Audit complete! Report saved to: ${reportPath}`);

    return {
      reportPath,
      reportText: result.text
    };
  }
}

module.exports = { GuidebookAuditor };

