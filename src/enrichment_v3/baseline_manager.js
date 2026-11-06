const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function computeFileSha256(filePath) {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

class BaselineManager {
  constructor(runDir) {
    this.runDir = runDir;
    this.projectRoot = path.join(__dirname, '../../');
  }

  generateBaseline() {
    console.log('[BaselineManager V3] Membangun manifest baseline SHA-256 seluruh file lama...');
    if (!fs.existsSync(this.runDir)) fs.mkdirSync(this.runDir, { recursive: true });

    const targetDirs = [
      'storage/raw_pages',
      'storage/checkpoints',
      'storage/screenshots',
      'storage/sessions'
    ];

    const entries = [];
    const hashLines = [];

    for (const relDir of targetDirs) {
      const absDir = path.join(this.projectRoot, relDir);
      if (!fs.existsSync(absDir)) continue;

      const files = fs.readdirSync(absDir);
      for (const f of files) {
        const fullPath = path.join(absDir, f);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) continue;

        const relPath = path.relative(this.projectRoot, fullPath).replace(/\\/g, '/');
        const hash = computeFileSha256(fullPath);
        const isSession = relPath.startsWith('storage/sessions');

        entries.push({
          relative_path: relPath,
          size_bytes: stat.size,
          last_modified_utc: stat.mtime.toISOString(),
          sha256: hash,
          is_session: isSession
        });

        // Use two spaces as standard POSIX sha256sum format
        hashLines.push(`${hash}  ${relPath}`);
      }
    }

    entries.sort((a, b) => a.relative_path.localeCompare(b.relative_path));
    hashLines.sort();

    const manifestObj = {
      manifest_version: "3.0",
      generated_at_utc: new Date().toISOString(),
      total_baseline_files: entries.length,
      file_count_by_folder: {
        raw_pages: entries.filter(e => e.relative_path.startsWith('storage/raw_pages')).length,
        checkpoints: entries.filter(e => e.relative_path.startsWith('storage/checkpoints')).length,
        screenshots: entries.filter(e => e.relative_path.startsWith('storage/screenshots')).length,
        sessions: entries.filter(e => e.relative_path.startsWith('storage/sessions')).length
      },
      audit_integrity_guarantee: "Nilai hash SHA-256 ini diuji sebelum dan sesudah run V3. Toleransi perubahan pada file historis = 0.",
      files: entries
    };

    fs.writeFileSync(path.join(this.runDir, 'baseline_workspace_manifest.json'), JSON.stringify(manifestObj, null, 2), 'utf8');
    fs.writeFileSync(path.join(this.runDir, 'baseline_hashes_v3.sha256'), hashLines.join('\n') + '\n', 'utf8');

    console.log(`[BaselineManager V3] Baseline manifest tersimpan (${entries.length} file terproteksi):`);
    console.log(`  -> baseline_workspace_manifest.json`);
    console.log(`  -> baseline_hashes_v3.sha256`);

    return manifestObj;
  }

  verifyIntegrity() {
    console.log('[BaselineManager V3] Memverifikasi integritas hash file lama pasca-eksekusi...');
    const hashesFile = path.join(this.runDir, 'baseline_hashes_v3.sha256');
    const lines = fs.readFileSync(hashesFile, 'utf8').trim().split('\n');

    let matched = 0;
    let modified = 0;
    const failures = [];

    for (const line of lines) {
      if (!line.trim()) continue;
      const firstSpace = line.indexOf(' ');
      const expectedHash = line.slice(0, firstSpace).trim();
      const relPath = line.slice(firstSpace).trim();
      const absPath = path.join(this.projectRoot, relPath);

      if (!fs.existsSync(absPath)) {
        modified++;
        failures.push({ file: relPath, reason: 'FILE_MISSING' });
        continue;
      }

      const curHash = computeFileSha256(absPath);
      if (curHash === expectedHash) {
        matched++;
      } else {
        modified++;
        failures.push({ file: relPath, expected: expectedHash, actual: curHash, reason: 'HASH_MISMATCH' });
      }
    }

    const pass = modified === 0;
    console.log(`[BaselineManager V3] Hasil Verifikasi Integritas: ${matched} cocok, ${modified} berubah. Status: ${pass ? 'PASS (100% PRESERVED)' : 'FAIL'}`);

    return {
      pass,
      total_checked: lines.length,
      matched,
      modified,
      failures
    };
  }
}

module.exports = { BaselineManager, computeFileSha256 };

