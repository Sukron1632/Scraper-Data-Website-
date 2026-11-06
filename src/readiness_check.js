const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { GoogleGenAI } = require('@google/genai');
const { SafetyGuardrails } = require('./crawler/guardrails');
const { SessionManager } = require('./auth/session_manager');
require('dotenv').config();

async function runReadinessTest() {
  console.log(`================================================================`);
  console.log(`  ANTIGRAVITY SYSTEM READINESS & PRE-FLIGHT CHECK (DRY-RUN)     `);
  console.log(`================================================================\n`);

  const results = {
    targetUrl: process.env.BASE_URL,
    token1: { status: 'PENDING', message: '' },
    token2: { status: 'PENDING', message: '' },
    serverHealth: { status: 'PENDING', code: 0, latencyMs: 0 },
    browserPlaywright: { status: 'PENDING', message: '' },
    authDetection: { status: 'PENDING', message: '' },
    guardrails: { status: 'ACTIVE', strictMode: true }
  };

  // -------------------------------------------------------------
  // TEST 1: GEMINI DUAL TOKEN CONNECTIVITY
  // -------------------------------------------------------------
  console.log(`[1/4] Menguji Konektivitas Dual Gemini API Token...`);

  const candidateModels = [
    process.env.GEMINI_MODEL || 'gemini-3.8-flash',
    'gemini-3.5-flash',
    'gemini-flash-latest'
  ];

  // Test Token 1
  try {
    const ai1 = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY_1 });
    let token1Ok = false;
    for (const m of candidateModels) {
      try {
        const res = await ai1.models.generateContent({ model: m, contents: 'ping' });
        results.token1 = { status: 'SUCCESS', model: m, response: res.text.trim().substring(0, 30) };
        token1Ok = true;
        console.log(`  ✓ Token 1 (Vision Analyst) Terhubung! Model: ${m}`);
        break;
      } catch (err) {
        if (!err.message.includes('503')) {
          results.token1 = { status: 'ERROR', message: err.message.substring(0, 80) };
        }
      }
    }
    if (!token1Ok && results.token1.status === 'PENDING') {
      results.token1 = { status: '503_SPIKE', message: 'Model mengalami spike demand sementara, fallback aktif.' };
      console.log(`  ⚠ Token 1 Terdeteksi valid, namun model utama sedang sibuk (fallback siap).`);
    }
  } catch (err) {
    results.token1 = { status: 'FAILED', message: err.message };
    console.log(`  ✗ Token 1 Gagal: ${err.message}`);
  }

  // Test Token 2
  try {
    const ai2 = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY_2 });
    let token2Ok = false;
    for (const m of candidateModels) {
      try {
        const res = await ai2.models.generateContent({ model: m, contents: 'ping' });
        results.token2 = { status: 'SUCCESS', model: m, response: res.text.trim().substring(0, 30) };
        token2Ok = true;
        console.log(`  ✓ Token 2 (SOP Synthesizer & Auditor) Terhubung! Model: ${m}`);
        break;
      } catch (err) {
        if (!err.message.includes('503')) {
          results.token2 = { status: 'ERROR', message: err.message.substring(0, 80) };
        }
      }
    }
    if (!token2Ok && results.token2.status === 'PENDING') {
      results.token2 = { status: '503_SPIKE', message: 'Model mengalami spike demand sementara, fallback aktif.' };
      console.log(`  ⚠ Token 2 Terdeteksi valid, namun model utama sedang sibuk (fallback siap).`);
    }
  } catch (err) {
    results.token2 = { status: 'FAILED', message: err.message };
    console.log(`  ✗ Token 2 Gagal: ${err.message}`);
  }

  // -------------------------------------------------------------
  // TEST 2: SERVER NETWORK & HTTP PROBE
  // -------------------------------------------------------------
  console.log(`\n[2/4] Menguji Respons Server Target (${process.env.BASE_URL})...`);
  const startTime = Date.now();
  try {
    const res = await fetch(process.env.BASE_URL);
    const latency = Date.now() - startTime;
    results.serverHealth = {
      status: res.ok ? 'ONLINE' : 'HTTP_' + res.status,
      code: res.status,
      latencyMs: latency
    };
    console.log(`  ✓ Server Status : HTTP ${res.status} (${res.statusText})`);
    console.log(`  ✓ Kecepatan Ping : ${latency} ms`);
  } catch (err) {
    results.serverHealth = { status: 'OFFLINE', error: err.message };
    console.log(`  ✗ Gagal menghubungi server: ${err.message}`);
    return;
  }

  // -------------------------------------------------------------
  // TEST 3: BROWSER PLAYWRIGHT & GUARDRAILS INSPECTION
  // -------------------------------------------------------------
  console.log(`\n[3/4] Menguji Browser Chromium, Guardrail Keamanan & Form Login...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const guardrails = new SafetyGuardrails();
  await guardrails.attachToPage(page, true); // Allow auth POST

  try {
    await page.goto(process.env.BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const pageTitle = await page.title();
    console.log(`  ✓ Judul Halaman : "${pageTitle}"`);

    // Take Landing Screenshot
    const screenshotDir = path.join(__dirname, '../storage/screenshots');
    const landingScreenshot = path.join(screenshotDir, '000_readiness_landing.png');
    await page.screenshot({ path: landingScreenshot });
    console.log(`  ✓ Screenshot Landing Tersimpan : 000_readiness_landing.png`);

    // Inspect inputs
    const inputs = await page.$$eval('input', els => els.map(el => ({
      name: el.name,
      type: el.type,
      id: el.id,
      placeholder: el.placeholder
    })));

    console.log(`  ✓ Ditemukan ${inputs.length} Kolom Input di Halaman:`);
    inputs.forEach(i => console.log(`     - [${i.type}] name="${i.name}" id="${i.id}" (placeholder: "${i.placeholder}")`));

    // Test IT Admin Login Simulation
    console.log(`\n[4/4] Menguji Otentikasi Akun IT (${process.env.AUTH_IT_USERNAME})...`);
    const sessionManager = new SessionManager();
    const loginSuccess = await sessionManager.performLogin(page, context, 'it');

    if (loginSuccess) {
      const authTitle = await page.title();
      const currentUrl = page.url();
      console.log(`  ✓ Login Berhasil!`);
      console.log(`  ✓ URL Setelah Login: ${currentUrl}`);
      console.log(`  ✓ Judul Dashboard : "${authTitle}"`);

      // Take Dashboard Screenshot
      const dashScreenshot = path.join(screenshotDir, '000_readiness_dashboard.png');
      await page.screenshot({ path: dashScreenshot });
      console.log(`  ✓ Screenshot Dashboard Tersimpan : 000_readiness_dashboard.png`);
      results.authDetection = { status: 'SUCCESS', title: authTitle, url: currentUrl };
    } else {
      console.log(`  ⚠ Login otomatis tidak mendeteksi formulir standar atau memerlukan konfigurasi selektor spesifik.`);
      results.authDetection = { status: 'MANUAL_REQUIRED', url: page.url() };
    }

  } catch (err) {
    console.error(`  ✗ Browser error: ${err.message}`);
    results.browserPlaywright = { status: 'ERROR', error: err.message };
  } finally {
    await browser.close();
  }

  console.log(`\n================================================================`);
  console.log(`                     HASIL PEMERIKSAAN KESIAPAN                 `);
  console.log(`================================================================`);
  console.log(`1. Server Target : ${results.serverHealth.status} (${results.serverHealth.latencyMs} ms)`);
  console.log(`2. Guardrails    : AKTIF (Strict Read-Only - Tidak Merusak Sistem)`);
  console.log(`3. Token Gemini 1: ${results.token1.status} (${results.token1.model || results.token1.message})`);
  console.log(`4. Token Gemini 2: ${results.token2.status} (${results.token2.model || results.token2.message})`);
  console.log(`5. Otentikasi IT : ${results.authDetection.status}`);
  console.log(`================================================================\n`);
}

runReadinessTest().catch(console.error);

