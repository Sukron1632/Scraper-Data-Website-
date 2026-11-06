const path = require('path');
const fs = require('fs');
const { BaselineManager } = require('./baseline_manager');
const { StateExplorerV3 } = require('./state_explorer_v3');
const { DatasetBuilderV3 } = require('./dataset_builder_v3');
const { QaRunnerV3 } = require('./qa_runner_v3');

async function main() {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '_').slice(0, 15);
  const runId = `run_v3_${timestamp}`;
  const runDir = path.join(__dirname, `../../storage/guidebook_enrichment/runs/${runId}`);

  console.log(`\n===============================================================`);
  console.log(`   ZOLA MASTER REMEDIATION & SOURCE-OF-TRUTH READINESS (V3)`);
  console.log(`   Run ID: ${runId}`);
  console.log(`   Target Directory: ${runDir}`);
  console.log(`===============================================================\n`);

  // FASE 0: Baseline & Manifest
  console.log('>>> FASE 0: Inventarisasi & Manifest Baseline SHA-256...');
  const baselineManager = new BaselineManager(runDir);
  baselineManager.generateBaseline();

  // FASE 1 & 2: Safe Read-Only Multi-State Explorer & 2-Pass Assertions
  console.log('\n>>> FASE 1 & 2: Safe Multi-State Explorer dengan Livewire Guardrail...');
  const stateExplorer = new StateExplorerV3(runDir);
  const explorationData = await stateExplorer.runExploration();

  // FASE 3, 4, 5, 6, 7: Dataset Building & Measured Annotation Plans
  console.log('\n>>> FASE 3-7: Penyusunan Dataset V3 Evidence-First & PII Masking...');
  const datasetBuilder = new DatasetBuilderV3(runDir, explorationData);
  datasetBuilder.buildAll();

  // FASE 8: Two-Pass Independent QA & Reports
  console.log('\n>>> FASE 8: Two-Pass Independent QA, ZIP Packaging & Final Reports...');
  const qaRunner = new QaRunnerV3(runDir, baselineManager, explorationData);
  const finalResults = qaRunner.runFullTwoPassQA();

  console.log(`\n===============================================================`);
  console.log(`   V3 REMEDIATION PIPELINE BERHASIL 100%!`);
  console.log(`   Folder Run V3: ${runDir}`);
  console.log(`   ZIP Bersih: ${finalResults.zipPath}`);
  console.log(`   SHA-256 ZIP: ${finalResults.zipSha256}`);
  console.log(`===============================================================\n`);
}

main().catch(err => {
  console.error('\n[FATAL ERROR in V3 Runner]:', err);
  process.exit(1);
});

