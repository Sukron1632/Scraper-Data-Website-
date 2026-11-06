const path = require('path');
const fs = require('fs');
const { BaselineManagerV4 } = require('./baseline_manager_v4');
const { generateActionRiskRegistry } = require('./action_risk_registry');
const { StateExplorerV4 } = require('./state_explorer_v4');
const { DatasetBuilderV4 } = require('./dataset_builder_v4');
const { OverlayGeneratorV4 } = require('./overlay_generator_v4');
const { QaRunnerV4 } = require('./qa_runner_v4');

async function main() {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '_').slice(0, 15);
  const runId = `v4_${timestamp}`;
  const runDir = path.join(__dirname, `../../storage/guidebook_runs/${runId}`);

  if (!fs.existsSync(runDir)) fs.mkdirSync(runDir, { recursive: true });

  console.log(`\n===============================================================`);
  console.log(`   ZOLA MASTER SUPER PROMPT V4 — PRODUCTION-READY DATASET`);
  console.log(`   Run ID: ${runId}`);
  console.log(`   Target Directory: ${runDir}`);
  console.log(`===============================================================\n`);

  // FASE 0: Pre-flight, Inventaris Baseline & Action Risk Registry
  console.log('>>> FASE 0: Inventarisasi Baseline SHA-256 & Action Risk Registry...');
  const baselineManager = new BaselineManagerV4(runDir);
  baselineManager.generateBeforeBaseline();

  const actionRiskPath = path.join(runDir, 'action_risk_registry.json');
  generateActionRiskRegistry(actionRiskPath);

  // FASE 1 & 2: Safe Multi-State Explorer dengan Livewire Guardrail & 2-Pass Assertions
  console.log('\n>>> FASE 1 & 2: Safe Multi-State Explorer V4 dengan Livewire Guardrail...');
  const stateExplorer = new StateExplorerV4(runDir);
  const explorationData = await stateExplorer.runExploration();

  // Export redacted client audit log
  const auditLogPath = path.join(runDir, 'reports', 'request_audit_log.json');
  if (!fs.existsSync(path.dirname(auditLogPath))) fs.mkdirSync(path.dirname(auditLogPath), { recursive: true });
  stateExplorer.guardrail.exportRedactedAuditLog(auditLogPath);

  // FASE 3: Penyusunan Dataset V4 Evidence-First & PII Masking
  console.log('\n>>> FASE 3: Penyusunan Dataset V4 Evidence-First & Deferred Dossiers...');
  const datasetBuilder = new DatasetBuilderV4(runDir, explorationData);
  const buildResults = datasetBuilder.buildAll();

  // FASE 4: Visual Overlay Preview Generation (Zola Standard)
  console.log('\n>>> FASE 4: Pembuatan Visual Overlay Previews (Standar Zola)...');
  const overlayGenerator = new OverlayGeneratorV4(runDir);
  const overlayAuditResults = await overlayGenerator.generateAllPreviews(buildResults.annotationPlans);

  // FASE 5, 6, 7, 8: Two-Pass Independent QA, ZIP Packaging & Final Reports
  console.log('\n>>> FASE 5-8: Two-Pass Independent QA, ZIP Packaging & Final Audit...');
  const qaRunner = new QaRunnerV4(runDir, baselineManager, explorationData, overlayAuditResults);
  const finalResults = qaRunner.runFullAudit();

  console.log(`\n===============================================================`);
  console.log(`   V4 PIPELINE BERHASIL 100%!`);
  console.log(`   Folder Run V4: ${runDir}`);
  console.log(`   ZIP Bersih Portabel: ${finalResults.zipPath}`);
  console.log(`   SHA-256 ZIP: ${finalResults.zipSha256}`);
  console.log(`   Status Gate: ${finalResults.pass2Gates.overall_status}`);
  console.log(`===============================================================\n`);
}

main().catch(err => {
  console.error('\n[FATAL ERROR in V4 Runner]:', err);
  process.exit(1);
});

