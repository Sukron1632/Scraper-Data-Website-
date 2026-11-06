const { SafeCrawler } = require('./crawler/safe_crawler');
const { DualGeminiOrchestrator } = require('./gemini/token_manager');
const { PageAnalyzer } = require('./gemini/analyzer');
const { GuidebookGenerator } = require('./gemini/guidebook_generator');
const { GuidebookAuditor } = require('./gemini/auditor');
const { DocxExporter } = require('./exporters/docx_exporter');
const { PackageConsolidator } = require('./exporters/package_consolidator');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  console.log(`\n===============================================================`);
  console.log(`   ANTIGRAVITY GUIDEBOOK ENGINE - DUAL GEMINI ORCHESTRATOR`);
  console.log(`===============================================================`);

  const orchestrator = new DualGeminiOrchestrator();

  switch (command) {
    case 'crawl': {
      console.log(`[Task] Starting Safe Throttled Crawler on Live System (Playwright Engine)...`);
      const crawler = new SafeCrawler();
      await crawler.start();
      break;
    }

    case 'crawl:scrapling': {
      console.log(`[Task] Starting Scrapling Mass Crawler (Ultra-Fast & Token Efficient)...`);
      const { spawn } = require('child_process');
      const pyScript = path.join(__dirname, 'crawler/scrapling_mass_crawler.py');
      const child = spawn('python', [pyScript], { stdio: 'inherit' });
      await new Promise((resolve, reject) => {
        child.on('close', code => code === 0 ? resolve() : reject(new Error(`Scrapling exited with code ${code}`)));
      });
      break;
    }

    case 'analyze': {
      console.log(`[Task] Analyzing Crawled Pages using Gemini Worker 1 (Vision/DOM Analyst)...`);
      const analyzer = new PageAnalyzer(orchestrator);
      const rawPagesDir = path.join(__dirname, '../storage/raw_pages');
      const files = fs.readdirSync(rawPagesDir).filter(f => f.endsWith('.json'));

      if (files.length === 0) {
        console.warn(`[Analyze] No crawled pages found. Please run 'npm run crawl' first.`);
        return;
      }

      const analyses = [];
      for (const file of files) {
        const pageData = JSON.parse(fs.readFileSync(path.join(rawPagesDir, file), 'utf8'));
        const analysis = await analyzer.analyzePage(pageData);
        analyses.push(analysis);

        // Save analysis cache
        const analysisPath = path.join(__dirname, '../storage/checkpoints', `analysis_${file}`);
        fs.writeFileSync(analysisPath, JSON.stringify(analysis, null, 2), 'utf8');
      }

      console.log(`[Analyze] Successfully analyzed ${analyses.length} pages.`);
      break;
    }

    case 'generate': {
      console.log(`[Task] Synthesizing Employee Guidebook using Gemini Dual Workers...`);
      const generator = new GuidebookGenerator(orchestrator);
      const analyzer = new PageAnalyzer(orchestrator);
      const rawPagesDir = path.join(__dirname, '../storage/raw_pages');
      const checkpointsDir = path.join(__dirname, '../storage/checkpoints');
      const files = fs.readdirSync(rawPagesDir).filter(f => f.endsWith('.json'));

      if (files.length === 0) {
        console.warn(`[Generate] No crawled pages found. Please run 'npm run crawl' first.`);
        return;
      }

      // Sort files by index
      files.sort((a, b) => parseInt(a.slice(0, 3)) - parseInt(b.slice(0, 3)));

      const chapters = [];
      for (const file of files) {
        const pageData = JSON.parse(fs.readFileSync(path.join(rawPagesDir, file), 'utf8'));
        const analysisPath = path.join(checkpointsDir, `analysis_${file}`);

        let analysisResult = null;
        if (fs.existsSync(analysisPath)) {
          try {
            analysisResult = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));
          } catch (e) {}
        }

        if (!analysisResult) {
          console.log(`[Generate] Analyzing UI for Page ${pageData.pageIndex}: ${file}`);
          analysisResult = await analyzer.analyzePage(pageData);
          fs.writeFileSync(analysisPath, JSON.stringify(analysisResult, null, 2), 'utf8');
        }

        const chapter = await generator.generateModuleChapter(pageData, analysisResult);
        chapter.screenshotPath = pageData.screenshotPath;
        chapters.push(chapter);
      }

      await generator.compileMasterGuidebook(chapters);
      console.log(`[Generate] Guidebook synthesis completed for all ${chapters.length} chapters!`);
      break;
    }

    case 'export:docx': {
      console.log(`[Task] Exporting Guidebook to Microsoft Word (.docx)...`);
      const docxExporter = new DocxExporter();
      const markdownDir = path.join(__dirname, '../output/guidebook/markdown');
      const rawPagesDir = path.join(__dirname, '../storage/raw_pages');

      const mdFiles = fs.readdirSync(markdownDir).filter(f => f.endsWith('.md') && !f.includes('BUKU_PANDUAN_LENGKAP'));

      if (mdFiles.length === 0) {
        console.warn(`[Export Docx] No markdown chapters found. Generating sample or please run 'npm run generate' first.`);
        return;
      }

      mdFiles.sort((a, b) => {
        const numA = parseInt(a.match(/^\d+/)?.[0] || '0', 10);
        const numB = parseInt(b.match(/^\d+/)?.[0] || '0', 10);
        return numA - numB;
      });

      const chapters = mdFiles.map(file => {
        const content = fs.readFileSync(path.join(markdownDir, file), 'utf8');
        const h2Match = content.match(/##\s+([^\n]+)/);
        const h1Match = content.match(/#\s+([^\n]+)/);
        const title = h2Match ? h2Match[1].trim() : (h1Match ? h1Match[1].trim() : file.replace('.md', ''));

        // Try matching screenshot from markdown image syntax or capture spec
        let screenshotPath = null;
        const imgMdMatch = content.match(/!\[.*?\]\((.*?)\)/);
        if (imgMdMatch && imgMdMatch[1]) {
          const candidate = path.join(__dirname, '../storage/screenshots', path.basename(imgMdMatch[1].trim()));
          if (fs.existsSync(candidate)) screenshotPath = candidate;
        }
        if (!screenshotPath) {
          const rawMatch = content.match(/(0\d\d_[^\s\)]+\.png)/);
          if (rawMatch && rawMatch[1]) {
            const candidate = path.join(__dirname, '../storage/screenshots', path.basename(rawMatch[1].trim()));
            if (fs.existsSync(candidate)) screenshotPath = candidate;
          }
        }

        return { title, content, screenshotPath };
      });

      await docxExporter.exportToDocx(chapters);
      break;
    }

    case 'audit': {
      const docArgIndex = args.indexOf('--doc');
      let docText = '';

      if (docArgIndex !== -1 && args[docArgIndex + 1]) {
        const docPath = args[docArgIndex + 1];
        if (fs.existsSync(docPath)) {
          docText = fs.readFileSync(docPath, 'utf8');
          console.log(`[Audit] Auditing document from file: ${docPath}`);
        } else {
          docText = args[docArgIndex + 1];
        }
      } else {
        const defaultDraftPath = path.join(__dirname, '../output/audit/DRAFT_TO_AUDIT.txt');
        if (fs.existsSync(defaultDraftPath)) {
          docText = fs.readFileSync(defaultDraftPath, 'utf8');
          console.log(`[Audit] Auditing document from: ${defaultDraftPath}`);
        } else {
          console.log(`[Audit] Tip: Anda dapat membuat file 'output/audit/DRAFT_TO_AUDIT.txt' yang berisi teks dari AI Web atau jalankan: npm run audit -- --doc "teks atau path file"`);
          docText = `Contoh Draf Panduan AI Web:\nBuka sistem lalu klik tombol Simpan untuk memperbarui transaksi.`;
        }
      }

      const auditor = new GuidebookAuditor(orchestrator);
      await auditor.auditDocument(docText);
      break;
    }

    case 'pipeline': {
      console.log(`[Task] Running End-to-End Guidebook Pipeline...`);
      console.log(`1. Crawling System (Read-Only & Throttled)...`);
      const crawler = new SafeCrawler();
      const crawledPages = await crawler.start();

      console.log(`2. Analyzing Pages with Gemini Dual Orchestration...`);
      const analyzer = new PageAnalyzer(orchestrator);
      const generator = new GuidebookGenerator(orchestrator);
      const chapters = [];

      for (const pageData of crawledPages) {
        const analysis = await analyzer.analyzePage(pageData);
        const chapter = await generator.generateModuleChapter(pageData, analysis);
        chapter.screenshotPath = pageData.screenshotPath;
        chapters.push(chapter);
      }

      console.log(`3. Compiling Master Guidebook & AI Export Packages...`);
      await generator.compileMasterGuidebook(chapters);

      console.log(`4. Generating Direct Word (.docx) Document...`);
      const docxExporter = new DocxExporter();
      await docxExporter.exportToDocx(chapters);

      console.log(`5. Consolidating Package for External AI Website Review & Audit...`);
      const consolidator = new PackageConsolidator();
      await consolidator.buildConsolidatedPackage();

      console.log(`\n===============================================================`);
      console.log(`   PIPELINE FINISHED WITH COMPLETE SUCCESS!`);
      console.log(`===============================================================`);
      break;
    }

    case 'consolidate': {
      console.log(`[Task] Consolidating all data into unified AI Website Review Package...`);
      const consolidator = new PackageConsolidator();
      await consolidator.buildConsolidatedPackage();
      break;
    }

    case 'inspect': {
      console.log(`[Task] Opening Interactive Chromium Browser with Safety Guardrails...`);
      const { chromium } = require('playwright');
      const { SafetyGuardrails } = require('./crawler/guardrails');
      const { SessionManager } = require('./auth/session_manager');

      const guardrails = new SafetyGuardrails();
      const sessionManager = new SessionManager();

      const browser = await chromium.launch({ headless: false });
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      await sessionManager.restoreSession(context, process.env.ACTIVE_CRAWL_ROLE || 'employee');

      const page = await context.newPage();
      await guardrails.attachToPage(page, false);

      const targetUrl = process.env.BASE_URL || 'https://google.com';
      await page.goto(targetUrl);
      console.log(`Browser is now open at: ${targetUrl}. Press Ctrl+C in terminal when done.`);
      // Keep open
      await new Promise(() => {});
      break;
    }

    default: {
      console.log(`
Perintah yang tersedia:
  npm run crawl               : Melakukan crawling Playwright aman (read-only, screenshots) pada sistem live
  npm run crawl:scrapling     : Pengambilan data massal super cepat & hemat token menggunakan Scrapling
  npm run analyze             : Menganalisis tangkapan layar & DOM dengan Token Gemini 1 (Explorer/Vision)
  npm run generate            : Menyusun Buku Panduan karyawan & paket ekspor AI Web dengan Token Gemini 2
  npm run export:docx         : Mengkompilasi panduan menjadi dokumen Microsoft Word (.docx) lengkap bergambar
  npm run audit               : Melakukan audit silang draf AI Web terhadap fakta sistem nyata
  npm run pipeline            : Menjalankan seluruh alur kerja dari awal sampai akhir secara otomatis
  npm run browser:inspect     : Membuka Chromium interaktif dengan penjagaan guardrail anti-rusak
  npm run mcp:scrapling       : Menjalankan built-in MCP server Scrapling secara langsung
`);
      break;
    }
  }

  const stats = orchestrator.getStats();
  console.log(`\n[Token Stats] Key 1 Req: ${stats.client1Requests} | Key 2 Req: ${stats.client2Requests} | Failovers: ${stats.failovers} | Errors: ${stats.errors}`);
}

main().catch(err => {
  console.error(`\x1b[31m[Fatal Error]\x1b[0m ${err.message}`, err.stack);
  process.exit(1);
});

