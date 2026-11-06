const path = require('path');
const fs = require('fs');
const { BaselineManagerV41 } = require('./baseline_manager_v4_1');
const { StateExplorerV41 } = require('./state_explorer_v4_1');
const { DatasetBuilderV41 } = require('./dataset_builder_v4_1');
const { OverlayGeneratorV41 } = require('./overlay_generator_v4_1');
const { QaRunnerV41 } = require('./qa_runner_v4_1');

async function main() {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '_').slice(0, 15);
  const runId = `v4_1_${timestamp}`;
  const runDir = path.join(__dirname, `../../storage/guidebook_runs/zola_guidebook_pricelist_v4_1_${runId}`);

  if (!fs.existsSync(runDir)) fs.mkdirSync(runDir, { recursive: true });

  console.log(`\n===============================================================`);
  console.log(`   ZOLA MASTER SUPER PROMPT V4.1 — FINAL DATASET PIPELINE`);
  console.log(`   Run ID: ${runId}`);
  console.log(`   Target Directory: ${runDir}`);
  console.log(`===============================================================\n`);

  // FASE 1: Safety & Baseline
  console.log('>>> FASE 1: Inventarisasi Baseline SHA-256 (443+ File Historis)...');
  const baselineManager = new BaselineManagerV41(runDir);
  baselineManager.generateBeforeBaseline();

  // FASE 2 & 3: Discovery & Safe Multi-State Explorer
  console.log('\n>>> FASE 2 & 3: Safe Multi-State Explorer V4.1 (9 Modul termasuk Tanya Harga)...');
  const stateExplorer = new StateExplorerV41(runDir);
  const explorationData = await stateExplorer.runExploration();

  // Export client request log
  const auditLogPath = path.join(runDir, 'reports', 'request_audit_log.json');
  if (!fs.existsSync(path.dirname(auditLogPath))) fs.mkdirSync(path.dirname(auditLogPath), { recursive: true });
  stateExplorer.guardrail.exportRedactedAuditLog(auditLogPath);

  // FASE 4 & 5: Dataset Building & Semantic Annotations
  console.log('\n>>> FASE 4 & 5: Penyusunan Dataset V4.1, Forms Matrix, & Semantic Annotation Plans...');
  const datasetBuilder = new DatasetBuilderV41(runDir, explorationData);
  const buildResults = datasetBuilder.buildAll();

  // FASE 6: Visual Overlay Preview Generation (Zola Standard)
  console.log('\n>>> FASE 6: Pembuatan Visual Overlay Previews (Standar Zola Oranye/Charcoal/Putih)...');
  const overlayGenerator = new OverlayGeneratorV41(runDir);
  const overlayAuditResults = await overlayGenerator.generateAllPreviews(buildResults.annotationPlans);

  // FASE 7 & 8: Three-Pass Independent QA, POSIX ZIP Packaging & Re-Open Audit
  console.log('\n>>> FASE 7 & 8: Siklus QA 3-Tahap (Pass A, Pass B, Pass C) & POSIX ZIP Packaging...');
  const qaRunner = new QaRunnerV41(runDir, baselineManager, explorationData, overlayAuditResults);
  const finalResults = qaRunner.runFullThreePassAudit();

  console.log(`\n===============================================================`);
  console.log(`   V4.1 MASTER PIPELINE BERHASIL 100%!`);
  console.log(`   Folder Run V4.1: ${runDir}`);
  console.log(`   ZIP Bersih Portabel: ${finalResults.zipPath}`);
  console.log(`   SHA-256 ZIP: ${finalResults.zipSha256}`);
  console.log(`   Status Pass A: ${finalResults.passAGates.overall_status}`);
  console.log(`   Status Pass B: ${finalResults.passBGates.overall_status}`);
  console.log(`   Status Pass C: ${finalResults.passCResults.zipAudit.status}`);
  console.log(`===============================================================\n`);
}

main().catch(err => {
  console.error('\n[FATAL ERROR in V4.1 Runner]:', err);
  process.exit(1);
});

