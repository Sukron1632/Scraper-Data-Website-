const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const sleep = ms => new Promise(res => setTimeout(res, ms));

class DualGeminiOrchestrator {
  constructor(options = {}) {
    this.key1 = options.key1 || process.env.GEMINI_API_KEY_1 || process.env.GEMINI_API_KEY;
    this.key2 = options.key2 || process.env.GEMINI_API_KEY_2 || this.key1;
    this.modelName = options.model || process.env.GEMINI_MODEL || 'gemini-3.5-flash';
    this.temperature = options.temperature !== undefined ? options.temperature : parseFloat(process.env.GEMINI_TEMPERATURE || '0.2');

    if (!this.key1) {
      console.warn(`[DualGemini] WARNING: Neither GEMINI_API_KEY_1 nor GEMINI_API_KEY is defined in .env.`);
    }

    // Initialize two distinct clients
    this.client1 = this.key1 ? new GoogleGenAI({ apiKey: this.key1 }) : null;
    this.client2 = this.key2 ? new GoogleGenAI({ apiKey: this.key2 }) : this.client1;

    this.stats = {
      client1Requests: 0,
      client2Requests: 0,
      failovers: 0,
      errors: 0
    };
    this.candidateModels = [
      'gemini-3.5-flash-lite',
      'gemini-3.1-flash-lite',
      'gemini-3.5-flash'
    ];
  }

  async _callClientWithModelFallback(client, params, maxRetries = 2) {
    let lastErr = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      for (const m of this.candidateModels) {
        try {
          const response = await client.models.generateContent({
            model: m,
            contents: params.contents,
            config: {
              temperature: this.temperature,
              systemInstruction: params.systemInstruction || undefined
            }
          });
          return { text: response.text, modelUsed: m };
        } catch (err) {
          lastErr = err;
          const isDemandSpike = err.message && (err.message.includes('503') || err.message.includes('high demand') || err.message.includes('UNAVAILABLE'));
          if (isDemandSpike) {
            console.warn(`[DualGemini] Model ${m} experiencing temporary demand spike. Waiting 3s before fallback...`);
            await sleep(3000);
            continue;
          }
          throw err;
        }
      }
      if (attempt < maxRetries) {
        console.warn(`[DualGemini] All candidate models busy on attempt ${attempt + 1}. Backing off 5s before re-trying...`);
        await sleep(5000);
      }
    }
    throw lastErr;
  }

  /**
   * Execute generation with automatic failover between Key 1 and Key 2.
   * workerRole: 'analyst' (prefers Key 1) or 'synthesizer' (prefers Key 2)
   */
  async executeWithFailover(params, preferredWorker = 'analyst') {
    const primaryClient = preferredWorker === 'synthesizer' ? (this.client2 || this.client1) : (this.client1 || this.client2);
    const backupClient = primaryClient === this.client1 ? (this.client2 || this.client1) : (this.client1 || this.client2);
    const primaryName = primaryClient === this.client1 ? 'Key 1 (Analyst)' : 'Key 2 (Synthesizer)';
    const backupName = backupClient === this.client1 ? 'Key 1 (Analyst)' : 'Key 2 (Synthesizer)';

    if (!primaryClient) {
      throw new Error('[DualGemini] No Gemini API keys configured! Please set GEMINI_API_KEY_1 and GEMINI_API_KEY_2 in .env');
    }

    // Try Primary Key
    try {
      if (primaryClient === this.client1) this.stats.client1Requests++;
      else this.stats.client2Requests++;

      const res = await this._callClientWithModelFallback(primaryClient, params);
      return {
        text: res.text,
        usedClient: `${primaryName} [${res.modelUsed}]`
      };
    } catch (primaryErr) {
      console.warn(`[DualGemini] ${primaryName} failed or rate-limited (${primaryErr.message.slice(0, 80)}...). Backing off 3s and failing over to ${backupName}...`);
      this.stats.failovers++;
      await sleep(3000);

      // Try Backup Key
      try {
        if (backupClient === this.client1) this.stats.client1Requests++;
        else this.stats.client2Requests++;

        const res = await this._callClientWithModelFallback(backupClient, params);
        return {
          text: res.text,
          usedClient: `${backupName} [${res.modelUsed} - FAILOVER]`
        };
      } catch (backupErr) {
        this.stats.errors++;
        console.error(`[DualGemini] Both Gemini API keys failed: ${backupErr.message.slice(0, 100)}`);
        throw backupErr;
      }
    }
  }

  getStats() {
    return { ...this.stats, model: this.modelName };
  }
}

module.exports = { DualGeminiOrchestrator };

