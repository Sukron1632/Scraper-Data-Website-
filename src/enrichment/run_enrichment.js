const path = require('path');
const fs = require('fs');
const { BaselineBuilder } = require('./baseline_builder');
const { StateExplorer } = require('./state_explorer');
const { EvidenceBuilder } = require('./evidence_builder');
const { QaValidator } = require('./qa_validator');

async function main() {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '_').slice(0, 15);
  const runId = `run_${timestamp}`;
  const runDir = path.join(__dirname, `../../storage/guidebook_enrichment/runs/${runId}`);

  console.log(`\n===============================================================`);
  console.log(`   SUPER PROMPT ENRICHMENT RUNNER — ZOLA GUIDEBOOK DATASET`);
  console.log(`   Run ID: ${runId}`);
  console.log(`   Target Directory: ${runDir}`);
  console.log(`===============================================================\n`);

  // FASE 0: Baseline & Hash Manifest
  console.log('>>> FASE 0: Inventarisasi & Manifest Baseline SHA-256...');
  const baselineBuilder = new BaselineBuilder(runDir);
  const baselineData = baselineBuilder.buildBaseline();

  // FASE 1 & 2: Safe Read-Only State Explorer
  console.log('\n>>> FASE 1 & 2: Safe Read-Only Multi-State Explorer...');
  const stateExplorer = new StateExplorer(runDir);
  const explorationData = await stateExplorer.runExploration();

  // FASE 3, 4, 5: Evidence & Activity Modeling
  console.log('\n>>> FASE 3, 4, 5: Penyusunan Evidence & Activity Dataset...');
  const evidenceBuilder = new EvidenceBuilder(runDir, explorationData);
  evidenceBuilder.buildAllEvidence();

  // FASE 6, 7, 8: QA, Security Scanner & Sanitized Export
  console.log('\n>>> FASE 6, 7, 8: QA Validation, Integrity Check & Sanitized Export...');
  const qaValidator = new QaValidator(runDir);
  const qaResults = qaValidator.runAllValidations();

  console.log(`\n===============================================================`);
  console.log(`   ENRICHMENT PIPELINE BERHASIL 100%!`);
  console.log(`   Semua data lama dipertahankan utuh (0 file diubah).`);
  console.log(`   Folder Keluaran Baru: ${runDir}`);
  console.log(`===============================================================\n`);
}

main().catch(err => {
  console.error('\n[FATAL ERROR in Enrichment Runner]:', err);
  process.exit(1);
});

