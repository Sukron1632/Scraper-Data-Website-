const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function computeFileSha256(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

class BaselineManagerV42 {
  constructor(runDir) {
    this.runDir = runDir;
    this.projectRoot = path.join(__dirname, '../../');
    this.reportsDir = path.join(runDir, 'reports');
    if (!fs.existsSync(this.reportsDir)) fs.mkdirSync(this.reportsDir, { recursive: true });

    this.beforeManifestPath = path.join(this.reportsDir, 'baseline_before_manifest.json');
    this.beforeShaPath = path.join(this.reportsDir, 'baseline_before.sha256');
    this.preservationReportPath = path.join(this.reportsDir, 'baseline_integrity.json');

    this.protectedDirs = [
      'storage/raw_pages',
      'storage/checkpoints',
      'storage/screenshots',
      'storage/sessions',
      'storage/guidebook_enrichment/runs/run_20261104_054443',
      'storage/guidebook_enrichment/runs/run_v3_20261104_062959',
      'storage/guidebook_runs/v4_20261104_070553',
      'storage/guidebook_runs/zola_guidebook_pricelist_v4_1_v4_1_20261104_080135'
    ];
  }

  generateBeforeBaseline() {
    console.log('[BaselineManager V4.2] Menghitung SHA-256 seluruh file baseline historis (V1, V2, V3, V4, V4.1)...');
    const manifest = {
      generated_at_utc: new Date().toISOString(),
      generator: 'BaselineManagerV42',
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

    console.log(`[BaselineManager V4.2] Baseline tersimpan (${manifest.total_protected_files} file terlindungi):`);
    console.log(`  -> ${this.beforeManifestPath}`);
    return manifest;
  }

  verifyPostExecutionIntegrity() {
    console.log('[BaselineManager V4.2] Memverifikasi integritas file baseline historis pasca-eksekusi...');
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
    console.log(`[BaselineManager V4.2] Hasil Verifikasi: ${report.matched} cocok, ${report.modified} termodifikasi, ${report.missing} hilang. Status: ${report.integrity_status}`);
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

module.exports = { BaselineManagerV42, computeFileSha256 };

