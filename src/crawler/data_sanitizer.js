const fs = require('fs');
const path = require('path');

const rulesPath = path.join(__dirname, '../../config/data_governance_rules.json');
let governanceRules = null;

if (fs.existsSync(rulesPath)) {
  try {
    governanceRules = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));
  } catch (err) {
    console.warn('[DataSanitizer] Warning: Could not parse data_governance_rules.json', err.message);
  }
}

class DataSanitizer {
  /**
   * Redacts sensitive information (PII, phone numbers, NIK, credit cards, bank accounts)
   * from any text or markdown before sending to AI or saving to disk.
   */
  static sanitizeText(text) {
    if (!text || typeof text !== 'string') return text;
    if (!governanceRules || !governanceRules.sensitiveDataMasking || !governanceRules.sensitiveDataMasking.enabled) {
      return text;
    }

    let sanitized = text;
    const rules = governanceRules.sensitiveDataMasking.rules || [];

    for (const rule of rules) {
      try {
        const regex = new RegExp(rule.pattern, 'g');
        sanitized = sanitized.replace(regex, rule.replaceWith);
      } catch (regexErr) {
        // Fallback if regex pattern has custom flags or syntax
      }
    }

    return sanitized;
  }

  /**
   * Recursively sanitizes structured JSON objects.
   */
  static sanitizeObject(obj) {
    if (!obj) return obj;
    if (typeof obj === 'string') return DataSanitizer.sanitizeText(obj);
    if (Array.isArray(obj)) return obj.map(item => DataSanitizer.sanitizeObject(item));
    if (typeof obj === 'object') {
      const sanitizedObj = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitizedObj[key] = DataSanitizer.sanitizeObject(value);
      }
      return sanitizedObj;
    }
    return obj;
  }
}

module.exports = { DataSanitizer };

