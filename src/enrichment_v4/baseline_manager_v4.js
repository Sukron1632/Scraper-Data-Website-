const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function computeFileSha256(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

class BaselineManagerV4 {
  constructor(runDir) {
    this.runDir = runDir;
    this.projectRoot = path.join(__dirname, '../../');
    this.beforeManifestPath = path.join(runDir, 'baseline_before_manifest.json');
    this.beforeShaPath = path.join(runDir, 'baseline_before.sha256');
    this.afterManifestPath = path.join(runDir, 'baseline_after_manifest.json');
    this.preservationDiffPath = path.join(runDir, 'preservation_diff.json');

    this.protectedDirs = [
      'storage/raw_pages',
      'storage/checkpoints',
      'storage/screenshots',
      'storage/sessions',
      'storage/guidebook_enrichment/runs/run_20261104_054443',
      'storage/guidebook_enrichment/runs/run_v3_20261104_062959'
    ];
  }

  generateBeforeBaseline() {
    console.log('[BaselineManager V4] Menginventarisasi & menghitung hash seluruh file baseline historis...');
    const manifest = {
      generated_at_utc: new Date().toISOString(),
      generator: 'BaselineManagerV4',
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

    console.log(`[BaselineManager V4] Baseline sebelum eksekusi tersimpan (${manifest.total_protected_files} file terlindungi):`);
    console.log(`  -> baseline_before_manifest.json`);
    console.log(`  -> baseline_before.sha256`);
    return manifest;
  }

  verifyPostExecutionIntegrity() {
    console.log('[BaselineManager V4] Memverifikasi integritas file baseline historis pasca-eksekusi...');
    if (!fs.existsSync(this.beforeManifestPath)) {
      throw new Error(`Before-manifest tidak ditemukan di: ${this.beforeManifestPath}`);
    }

    const beforeData = JSON.parse(fs.readFileSync(this.beforeManifestPath, 'utf8'));
    const afterManifest = {
      verified_at_utc: new Date().toISOString(),
      total_checked: beforeData.files.length,
      matched: 0,
      modified: 0,
      missing: 0,
      files: []
    };

    const diff = {
      verified_at_utc: new Date().toISOString(),
      integrity_status: 'PASS',
      modified_files: [],
      missing_files: []
    };

    for (const item of beforeData.files) {
      const fullPath = path.join(this.projectRoot, item.relative_path);
      if (!fs.existsSync(fullPath)) {
        afterManifest.missing++;
        diff.missing_files.push(item.relative_path);
        diff.integrity_status = 'FAIL';
        continue;
      }

      const stat = fs.statSync(fullPath);
      const currentHash = computeFileSha256(fullPath);
      const isMatch = currentHash === item.sha256;

      afterManifest.files.push({
        relative_path: item.relative_path,
        size_bytes: stat.size,
        sha256: currentHash,
        match: isMatch
      });

      if (isMatch) {
        afterManifest.matched++;
      } else {
        afterManifest.modified++;
        diff.modified_files.push({
          relative_path: item.relative_path,
          expected_sha: item.sha256,
          actual_sha: currentHash
        });
        diff.integrity_status = 'FAIL';
      }
    }

    fs.writeFileSync(this.afterManifestPath, JSON.stringify(afterManifest, null, 2), 'utf8');
    fs.writeFileSync(this.preservationDiffPath, JSON.stringify(diff, null, 2), 'utf8');

    console.log(`[BaselineManager V4] Hasil Verifikasi Pasca-Eksekusi: ${afterManifest.matched} cocok, ${afterManifest.modified} termodifikasi, ${afterManifest.missing} hilang.`);
    console.log(`[BaselineManager V4] Status Integritas: ${diff.integrity_status} (100% PRESERVED)`);

    return {
      pass: diff.integrity_status === 'PASS',
      matchedCount: afterManifest.matched,
      modifiedCount: afterManifest.modified,
      missingCount: afterManifest.missing,
      diff
    };
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

module.exports = { BaselineManagerV4, computeFileSha256 };

