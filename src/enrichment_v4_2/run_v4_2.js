const path = require('path');
const fs = require('fs');
const { BaselineManagerV42 } = require('./baseline_manager_v4_2');
const { StateExplorerV42 } = require('./state_explorer_v4_2');
const { DatasetBuilderV42 } = require('./dataset_builder_v4_2');
const { OverlayGeneratorV42 } = require('./overlay_generator_v4_2');
const { QaRunnerV42 } = require('./qa_runner_v4_2');

async function main() {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '_').slice(0, 15);
  const runId = `v4_2_${timestamp}`;
  const runDir = path.join(__dirname, `../../storage/guidebook_runs/zola_guidebook_pricelist_v4_2_${runId}`);

  if (!fs.existsSync(runDir)) fs.mkdirSync(runDir, { recursive: true });

  console.log(`\n===============================================================`);
  console.log(`   ZOLA MASTER SUPER PROMPT V4.2 — FINAL RELEASE AUDIT`);
  console.log(`   Run ID: ${runId}`);
  console.log(`   Target Directory: ${runDir}`);
  console.log(`===============================================================\n`);

  // FASE 1: Safety & Historical Baseline Integrity
  console.log('>>> FASE 1: Inventarisasi Baseline SHA-256 (File Historis V1–V4.1)...');
  const baselineManager = new BaselineManagerV42(runDir);
  baselineManager.generateBeforeBaseline();

  // FASE 2 & 3: Multi-State Safe Exploration
  console.log('\n>>> FASE 2 & 3: Safe Multi-State Explorer V4.2 (9 Modul termasuk Tanya Harga)...');
  const stateExplorer = new StateExplorerV42(runDir);
  const explorationData = await stateExplorer.runExploration();

  // Export client request log
  const auditLogPath = path.join(runDir, 'reports', 'request_audit_log.json');
  if (!fs.existsSync(path.dirname(auditLogPath))) fs.mkdirSync(path.dirname(auditLogPath), { recursive: true });
  stateExplorer.guardrail.exportRedactedAuditLog(auditLogPath);

  // FASE 4 & 5: Dataset Building, 4-Way Reconciliation & Semantic Annotation Plans
  console.log('\n>>> FASE 4 & 5: Penyusunan Dataset V4.2, Rekonsiliasi D1–D5 & Dossier Lengkap...');
  const datasetBuilder = new DatasetBuilderV42(runDir, explorationData);
  const buildResults = datasetBuilder.buildAll();

  // FASE 6: Visual Overlay Preview Generation (Zola Standard)
  console.log('\n>>> FASE 6: Pembuatan Visual Overlay Previews (Standar Zola Oranye/Charcoal/Putih)...');
  const overlayGenerator = new OverlayGeneratorV42(runDir);
  const overlayAuditResults = await overlayGenerator.generateAllPreviews(buildResults.annotationPlans);

  // FASE 7 & 8: Three-Pass Independent QA, Sidecar SHA-256, POSIX ZIP & Freeze Record
  console.log('\n>>> FASE 7 & 8: Siklus QA 3-Tahap (Pass A, Pass B, Pass C), Sidecar & Freeze Record...');
  const qaRunner = new QaRunnerV42(runDir, baselineManager, explorationData, overlayAuditResults);
  const finalResults = qaRunner.runFullThreePassAudit();

  console.log(`\n===============================================================`);
  console.log(`   V4.2 MASTER RELEASE PIPELINE BERHASIL 100%!`);
  console.log(`   Folder Run V4.2: ${runDir}`);
  console.log(`   ZIP Bersih Portabel: ${finalResults.zipPath}`);
  console.log(`   SHA-256 ZIP: ${finalResults.zipSha256}`);
  console.log(`   Sidecar File: ${finalResults.sidecarPath}`);
  console.log(`   Status Pass A (QA_A_SCHEMA_LINKS): ${finalResults.passAGates.overall_status}`);
  console.log(`   Status Pass B (QA_B_VISUAL_SEMANTIC): ${finalResults.passBGates.overall_status}`);
  console.log(`   Status Pass C (QA_C_FINAL_ZIP_REOPEN): ${finalResults.passCResults.zipAudit.status}`);
  console.log(`===============================================================\n`);
}

main().catch(err => {
  console.error('\n[FATAL ERROR in V4.2 Runner]:', err);
  process.exit(1);
});

