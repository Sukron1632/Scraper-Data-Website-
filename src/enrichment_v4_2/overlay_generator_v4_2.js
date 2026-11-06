const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class OverlayGeneratorV42 {
  constructor(runDir) {
    this.runDir = runDir;
    this.screenshotsDir = path.join(runDir, 'evidence', 'screenshots_sanitized');
    this.previewsDir = path.join(runDir, 'evidence', 'annotation_previews');
    if (!fs.existsSync(this.previewsDir)) fs.mkdirSync(this.previewsDir, { recursive: true });
  }

  async generateAllPreviews(annotationPlans) {
    console.log('[OverlayGenerator V4.2] Memulai pembuatan visual overlay preview (Zola Standard)...');

    const browser = await chromium.launch({
      headless: true,
      args: ['--window-size=1440,900', '--no-sandbox']
    });

    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    const auditResults = [];

    try {
      for (const plan of annotationPlans) {
        const shotPath = path.join(this.runDir, plan.screenshot_ref);
        if (!fs.existsSync(shotPath)) {
          console.warn(`[OverlayGenerator V4.2] Screenshot tidak ditemukan: ${shotPath}`);
          continue;
        }

        const previewFileName = `${plan.activity_id}_preview.png`;
        const previewPath = path.join(this.previewsDir, previewFileName);

        const shotBase64 = fs.readFileSync(shotPath).toString('base64');
        const imgSrc = `data:image/png;base64,${shotBase64}`;

        const calloutsHtml = plan.callouts.map(c => {
          const [x, y, w, h] = c.bbox_px;
          const label = c.target_label || c.target_label_actual || c.text_note || '';
          return `
            <div style="
              position: absolute;
              left: ${x}px;
              top: ${y}px;
              width: ${w}px;
              height: ${h}px;
              border: 3px solid #E65100;
              box-shadow: 0 0 10px rgba(230, 81, 0, 0.6);
              pointer-events: none;
              box-sizing: border-box;
              z-index: 100;
              border-radius: 4px;
            ">
              <div style="
                position: absolute;
                top: -14px;
                left: -14px;
                background-color: #E65100;
                color: #FFFFFF;
                font-family: Arial, sans-serif;
                font-size: 13px;
                font-weight: bold;
                padding: 2px 7px;
                border-radius: 9999px;
                border: 2px solid #FFFFFF;
                box-shadow: 0 2px 4px rgba(0,0,0,0.4);
              ">
                ${c.callout_number}
              </div>
              <div style="
                position: absolute;
                bottom: -28px;
                left: 0;
                background-color: #263238;
                color: #FFFFFF;
                font-family: Arial, sans-serif;
                font-size: 11px;
                padding: 3px 6px;
                border-radius: 4px;
                white-space: nowrap;
                opacity: 0.95;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              ">
                ${label}
              </div>
            </div>
          `;
        }).join('\n');

        const htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body, html { margin: 0; padding: 0; overflow: hidden; width: 1440px; height: 900px; background: #000; }
                .container { position: relative; width: 1440px; height: 900px; }
                img.base { width: 1440px; height: 900px; display: block; }
              </style>
            </head>
            <body>
              <div class="container">
                <img class="base" src="${imgSrc}" />
                ${calloutsHtml}
              </div>
            </body>
          </html>
        `;

        await page.setContent(htmlContent, { waitUntil: 'load' });
        await page.screenshot({ path: previewPath, fullPage: false });

        auditResults.push({
          activity_id: plan.activity_id,
          plan_id: plan.plan_id,
          preview_file: `evidence/annotation_previews/${previewFileName}`,
          exists: fs.existsSync(previewPath),
          file_size_bytes: fs.existsSync(previewPath) ? fs.statSync(previewPath).size : 0,
          status: 'PASS'
        });

        console.log(`[OverlayGenerator V4.2] Preview tersimpan: ${previewFileName} (Status: PASS)`);
      }
    } finally {
      await context.close();
      await browser.close();
    }

    return auditResults;
  }
}

module.exports = { OverlayGeneratorV42 };

