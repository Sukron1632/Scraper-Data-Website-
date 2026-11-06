const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function computeFileSha256(filePath) {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

class BaselineBuilder {
  constructor(runDir) {
    this.runDir = runDir;
    this.projectRoot = path.join(__dirname, '../../');
    this.storageRoot = path.join(this.projectRoot, 'storage');
  }

  buildBaseline() {
    console.log('[BaselineBuilder] Membangun manifest baseline SHA-256 untuk seluruh file lama...');
    if (!fs.existsSync(this.runDir)) {
      fs.mkdirSync(this.runDir, { recursive: true });
    }

    const targets = [
      'storage/raw_pages',
      'storage/checkpoints',
      'storage/screenshots',
      'storage/sessions'
    ];

    const manifestEntries = [];
    const hashLines = [];

    let totalFiles = 0;
    const stats = {
      rawPagesCount: 0,
      checkpointsCount: 0,
      screenshotsCount: 0,
      sessionsCount: 0
    };

    for (const relDir of targets) {
      const absDir = path.join(this.projectRoot, relDir);
      if (!fs.existsSync(absDir)) continue;

      const files = fs.readdirSync(absDir);
      for (const file of files) {
        const absPath = path.join(absDir, file);
        const stat = fs.statSync(absPath);
        if (stat.isDirectory()) continue;

        const relPath = path.relative(this.projectRoot, absPath).replace(/\\/g, '/');
        const hash = computeFileSha256(absPath);
        const isSession = relPath.startsWith('storage/sessions');

        manifestEntries.push({
          relative_path: relPath,
          size_bytes: stat.size,
          last_modified: stat.mtime.toISOString(),
          sha256: hash,
          is_session_or_sensitive: isSession
        });

        hashLines.push(`${hash}  ${relPath}`);
        totalFiles++;

        if (relPath.startsWith('storage/raw_pages') && file.endsWith('.json')) stats.rawPagesCount++;
        else if (relPath.startsWith('storage/checkpoints') && file.endsWith('.json')) stats.checkpointsCount++;
        else if (relPath.startsWith('storage/screenshots') && file.endsWith('.png')) stats.screenshotsCount++;
        else if (relPath.startsWith('storage/sessions') && file.endsWith('.json')) stats.sessionsCount++;
      }
    }

    // Sort alphabetically by relative_path for determinism
    manifestEntries.sort((a, b) => a.relative_path.localeCompare(b.relative_path));
    hashLines.sort();

    const baselineData = {
      generated_at_utc: new Date().toISOString(),
      project_root: this.projectRoot.replace(/\\/g, '/'),
      total_files: totalFiles,
      summary_statistics: stats,
      audit_comparison_against_prompt_b: {
        raw_pages_expected: 19,
        raw_pages_actual: stats.rawPagesCount,
        raw_pages_match: stats.rawPagesCount === 19,
        screenshots_expected: 25,
        screenshots_actual: stats.screenshotsCount,
        screenshots_match: stats.screenshotsCount === 25,
        analysis_checkpoints_expected: 19,
        analysis_checkpoints_actual: stats.checkpointsCount - 1, // excluding checkpoint.json
        edit_harga_visited_but_missing_evidence: true,
        user_identity_nana_vs_role_it_admin: "Screenshots show account NANA; metadata recorded IT Administrator. Identity-role unverified."
      },
      manifest: manifestEntries
    };

    const manifestPath = path.join(this.runDir, 'baseline_manifest.json');
    const hashesPath = path.join(this.runDir, 'baseline_hashes.sha256');

    fs.writeFileSync(manifestPath, JSON.stringify(baselineData, null, 2), 'utf8');
    fs.writeFileSync(hashesPath, hashLines.join('\n') + '\n', 'utf8');

    console.log(`[BaselineBuilder] Baseline manifest tersimpan (${totalFiles} file):`);
    console.log(`  -> ${manifestPath}`);
    console.log(`  -> ${hashesPath}`);

    return baselineData;
  }
}

module.exports = { BaselineBuilder, computeFileSha256 };

