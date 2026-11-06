const cheerio = require('cheerio');

class DomParser {
  /**
   * Parses page HTML into a structured summary for employee guidebook generation.
   */
  static parsePageStructure(html, currentUrl = '') {
    const $ = cheerio.load(html);

    // Remove noise scripts and styles
    $('script, style, noscript, svg, iframe').remove();

    // 1. Page Title & Headings
    const pageTitle = $('title').text().trim() || $('h1').first().text().trim() || 'Halaman Sistem';
    const headings = [];
    $('h1, h2, h3').each((_, el) => {
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      if (text && text.length > 2) {
        headings.push({ tag: el.tagName.toLowerCase(), text });
      }
    });

    // 2. Breadcrumbs
    const breadcrumbs = [];
    $('.breadcrumb, [aria-label*="breadcrumb" i], ol.breadcrumb li').each((_, el) => {
      const crumb = $(el).text().trim().replace(/\s+/g, ' ');
      if (crumb) breadcrumbs.push(crumb);
    });

    // 3. Navigation Menus & Links
    const navigationLinks = [];
    $('nav, .sidebar, .menu, .navbar, aside').find('a').each((_, el) => {
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      const href = $(el).attr('href');
      if (text && href && !href.startsWith('javascript:') && !href.startsWith('#')) {
        navigationLinks.push({ text, href });
      }
    });

    // 4. Form Fields & Inputs (Explanation for employees on what fields mean)
    const formFields = [];
    $('input, select, textarea').each((_, el) => {
      const $el = $(el);
      const type = $el.attr('type') || el.tagName.toLowerCase();
      if (['hidden', 'submit', 'button', 'reset'].includes(type)) return;

      const id = $el.attr('id') || '';
      const name = $el.attr('name') || '';
      const placeholder = $el.attr('placeholder') || '';
      const isRequired = $el.attr('required') !== undefined || $el.hasClass('required');

      // Find associated label
      let labelText = '';
      if (id) {
        labelText = $(`label[for="${id}"]`).text().trim();
      }
      if (!labelText) {
        labelText = $el.closest('label').text().trim() || $el.closest('.form-group, .field, div').find('label').first().text().trim();
      }

      formFields.push({
        label: labelText || placeholder || name || id || 'Kolom Input',
        name,
        type,
        placeholder,
        isRequired
      });
    });

    // 5. Data Tables (Columns & Information presented)
    const tables = [];
    $('table').each((_, tableEl) => {
      const $tbl = $(tableEl);
      const headers = [];
      $tbl.find('th').each((_, th) => {
        const hText = $(th).text().trim().replace(/\s+/g, ' ');
        if (hText) headers.push(hText);
      });

      const rowCount = $tbl.find('tbody tr').length || $tbl.find('tr').length - 1;
      tables.push({
        headers,
        sampleRowCount: Math.max(0, rowCount),
        hasPagination: $tbl.closest('div').find('.pagination, [aria-label*="pagination" i]').length > 0
      });
    });

    // 6. Action Elements (Buttons / Links on page)
    const actionButtons = [];
    $('button, a.btn, input[type="button"], [role="button"]').each((_, btn) => {
      const text = $(btn).text().trim().replace(/\s+/g, ' ') || $(btn).attr('value') || '';
      if (text && text.length < 50) {
        actionButtons.push(text);
      }
    });

    return {
      currentUrl,
      pageTitle,
      headings: headings.slice(0, 10),
      breadcrumbs: breadcrumbs.slice(0, 5),
      navigationLinks: navigationLinks.slice(0, 20),
      formFields: formFields.slice(0, 25),
      tables: tables.slice(0, 5),
      actionButtons: [...new Set(actionButtons)].slice(0, 15)
    };
  }
}

module.exports = { DomParser };

