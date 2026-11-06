const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function computeFileSha256(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

class BaselineManagerV41 {
  constructor(runDir) {
    this.runDir = runDir;
    this.projectRoot = path.join(__dirname, '../../');
    this.baselineIntegrityDir = path.join(runDir, 'baseline_integrity');
    if (!fs.existsSync(this.baselineIntegrityDir)) fs.mkdirSync(this.baselineIntegrityDir, { recursive: true });

    this.beforeManifestPath = path.join(this.baselineIntegrityDir, 'baseline_before_manifest.json');
    this.beforeShaPath = path.join(this.baselineIntegrityDir, 'baseline_before.sha256');
    this.preservationReportPath = path.join(this.baselineIntegrityDir, 'preservation_report.json');
    this.versionLineagePath = path.join(this.baselineIntegrityDir, 'version_lineage.json');

    this.protectedDirs = [
      'storage/raw_pages',
      'storage/checkpoints',
      'storage/screenshots',
      'storage/sessions',
      'storage/guidebook_enrichment/runs/run_20261104_054443',
      'storage/guidebook_enrichment/runs/run_v3_20261104_062959',
      'storage/guidebook_runs/v4_20261104_070553'
    ];
  }

  generateBeforeBaseline() {
    console.log('[BaselineManager V4.1] Menghitung SHA-256 seluruh 443+ file baseline historis (V1, V2, V3, V4)...');
    const manifest = {
      generated_at_utc: new Date().toISOString(),
      generator: 'BaselineManagerV41',
      total_protected_files: 0,
      files: []
    };

    const shaLines = [];

    for (const relDir of this.protectedDirs) {
      const fullDir = path.join(this.projectRoot, relDir);
      if (!fs.existsSync(fullDir)) continue;

      const files = this._getFilesRecursive(fullDir);
      for (const fullFile of files) {
        const relPath = path.relative(this.projectRoot, fullFile).replace(/\\/g, '/');
        const stat = fs.statSync(fullFile);
        const hash = computeFileSha256(fullFile);

        manifest.files.push({
          relative_path: relPath,
          size_bytes: stat.size,
          modified_time: stat.mtime.toISOString(),
          sha256: hash
        });

        shaLines.push(`${hash}  ${relPath}`);
      }
    }

    manifest.total_protected_files = manifest.files.length;
    fs.writeFileSync(this.beforeManifestPath, JSON.stringify(manifest, null, 2), 'utf8');
    fs.writeFileSync(this.beforeShaPath, shaLines.join('\n'), 'utf8');

    // Also write version lineage
    const lineage = {
      dataset_version: "4.1",
      generator: "ZolaMasterSuperPromptV41",
      created_at_utc: new Date().toISOString(),
      lineage_milestones: [
        { version: "1.0", focus: "Crawling massal awal & raw HTML dump" },
        { version: "2.0", focus: "Enrichment awal (terkendala Livewire POST interceptor)" },
        { version: "3.0", focus: "Remediasi V3 (Livewire guardrail, 70 baseline files, 2-pass search test)" },
        { version: "4.0", focus: "Dataset terstruktur V4 (8 modul, visual overlay, 283 baseline files)" },
        { version: "4.1", focus: "Finalisasi Master V4.1: Penambahan modul global Tanya Harga & Konsultasi Keluhan (3 varian), sanitasi CSRF total, perbaikan semantik anotasi, dan audit POSIX ZIP 3-Pass." }
      ]
    };
    fs.writeFileSync(this.versionLineagePath, JSON.stringify(lineage, null, 2), 'utf8');

    console.log(`[BaselineManager V4.1] Baseline tersimpan (${manifest.total_protected_files} file terlindungi):`);
    console.log(`  -> ${this.beforeManifestPath}`);
    return manifest;
  }

  verifyPostExecutionIntegrity() {
    console.log('[BaselineManager V4.1] Memverifikasi integritas file baseline historis pasca-eksekusi...');
    if (!fs.existsSync(this.beforeManifestPath)) {
      throw new Error(`Before-manifest tidak ditemukan di: ${this.beforeManifestPath}`);
    }

    const beforeData = JSON.parse(fs.readFileSync(this.beforeManifestPath, 'utf8'));
    const report = {
      verified_at_utc: new Date().toISOString(),
      total_checked: beforeData.files.length,
      matched: 0,
      modified: 0,
      missing: 0,
      integrity_status: 'PASS',
      modified_files: [],
      missing_files: []
    };

    for (const item of beforeData.files) {
      const fullPath = path.join(this.projectRoot, item.relative_path);
      if (!fs.existsSync(fullPath)) {
        report.missing++;
        report.missing_files.push(item.relative_path);
        report.integrity_status = 'FAIL';
        continue;
      }

      const currentHash = computeFileSha256(fullPath);
      if (currentHash === item.sha256) {
        report.matched++;
      } else {
        report.modified++;
        report.modified_files.push({
          relative_path: item.relative_path,
          expected_sha: item.sha256,
          actual_sha: currentHash
        });
        report.integrity_status = 'FAIL';
      }
    }

    fs.writeFileSync(this.preservationReportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`[BaselineManager V4.1] Hasil Verifikasi: ${report.matched} cocok, ${report.modified} termodifikasi, ${report.missing} hilang. Status: ${report.integrity_status}`);
    return report;
  }

  _getFilesRecursive(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const full = path.join(dir, file);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        results = results.concat(this._getFilesRecursive(full));
      } else {
        results.push(full);
      }
    }
    return results;
  }
}

module.exports = { BaselineManagerV41, computeFileSha256 };

