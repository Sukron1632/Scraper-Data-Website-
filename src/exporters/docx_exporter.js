const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, ImageRun } = require('docx');

class DocxExporter {
  constructor(options = {}) {
    this.outputDir = options.outputDir || path.join(__dirname, '../../output/guidebook/docx');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Generates a styled .docx file from chapters and screenshots.
   */
  async exportToDocx(chapters, docTitle = 'Buku Panduan Operasional Sistem (SOP Karyawan)') {
    console.log(`[DocxExporter] Compiling chapters into Microsoft Word document (.docx)...`);

    const sectionsChildren = [];

    // Cover Page (PT Radiator Springs Indonesia Standard)
    sectionsChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'PT RADIATOR SPRINGS INDONESIA\n',
            bold: true,
            size: 28,
            color: '1A365D'
          }),
          new TextRun({
            text: 'PANDUAN PENGGUNA\n',
            bold: true,
            size: 40,
            color: '2B6CB0'
          }),
          new TextRun({
            text: `${docTitle.toUpperCase()}\n\n\n\n\n\n`,
            bold: true,
            size: 32,
            color: '2D3748'
          }),
          new TextRun({
            text: 'PT RADIATOR SPRINGS INDONESIA\nSLEMAN, YOGYAKARTA\n2026',
            size: 22,
            color: '718096'
          })
        ],
        spacing: { before: 1000, after: 1200 }
      }),

      // Section: Cara Menggunakan Panduan
      new Paragraph({
        text: 'CARA MENGGUNAKAN PANDUAN',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 600, after: 200 }
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: 'Mulai dari sini:\n',
            bold: true,
            size: 22
          }),
          new TextRun({
            text: 'Panduan ini membantu rekan-rekan karyawan menjalankan alur operasional sistem dengan cepat, tepat, dan mandiri. Karyawan cukup memperhatikan nomor anotasi pada gambar untuk mengetahui tombol dan kolom apa yang harus digunakan.\n\n',
            size: 20
          }),
          new TextRun({
            text: 'POLANYA SELALU SAMA:\n',
            bold: true,
            size: 22,
            color: '2B6CB0'
          }),
          new TextRun({
            text: '01. Pilih Fitur dan Kegiatan: Buka modul sesuai pekerjaan yang ingin dilakukan.\n',
            bold: true,
            size: 20
          }),
          new TextRun({
            text: '02. Screenshot & Anotasi: Ikuti nomor penanda [01], [02], [03] untuk mengetahui lokasi tombol, cara penggunaan, dan hasil tindakan.\n\n',
            bold: true,
            size: 20
          })
        ],
        spacing: { after: 400 }
      })
    );

    // Iterate chapters
    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i];

      // Chapter Heading
      sectionsChildren.push(
        new Paragraph({
          text: `BAB ${i + 1}: ${ch.title}`,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 150 }
        })
      );

      // Embed Screenshot if available
      if (ch.screenshotPath && fs.existsSync(ch.screenshotPath)) {
        try {
          const imgData = fs.readFileSync(ch.screenshotPath);
          sectionsChildren.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: imgData,
                  transformation: {
                    width: 550,
                    height: 340
                  }
                })
              ],
              spacing: { after: 150 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Gambar ${i + 1}.1: Tampilan Layar ${ch.title}`,
                  italics: true,
                  size: 18,
                  color: '555555'
                })
              ],
              spacing: { after: 250 }
            })
          );
        } catch (imgErr) {
          console.warn(`[DocxExporter] Could not embed screenshot: ${imgErr.message}`);
        }
      }

      // Convert Markdown content lines into paragraphs
      const lines = (ch.content || '').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed.startsWith('# ')) {
          continue; // Already handled by Chapter Heading
        } else if (trimmed.startsWith('## ')) {
          sectionsChildren.push(
            new Paragraph({
              text: trimmed.replace(/^##\s+/, ''),
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 }
            })
          );
        } else if (trimmed.startsWith('### ')) {
          sectionsChildren.push(
            new Paragraph({
              text: trimmed.replace(/^###\s+/, ''),
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 150, after: 80 }
            })
          );
        } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          sectionsChildren.push(
            new Paragraph({
              text: trimmed.replace(/^[-*]\s+/, ''),
              bullet: { level: 0 },
              spacing: { after: 60 }
            })
          );
        } else if (/^\d+\.\s+/.test(trimmed)) {
          sectionsChildren.push(
            new Paragraph({
              text: trimmed,
              spacing: { after: 80 }
            })
          );
        } else {
          sectionsChildren.push(
            new Paragraph({
              text: trimmed,
              spacing: { after: 120 }
            })
          );
        }
      }
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: sectionsChildren
      }]
    });

    const fileName = `BUKU_PANDUAN_KARYAWAN_${new Date().toISOString().slice(0, 10)}.docx`;
    const outputPath = path.join(this.outputDir, fileName);

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(outputPath, buffer);

    console.log(`[DocxExporter] Microsoft Word document generated successfully at: ${outputPath}`);
    return outputPath;
  }
}

module.exports = { DocxExporter };

