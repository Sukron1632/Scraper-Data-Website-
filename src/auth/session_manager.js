const fs = require('fs');
const path = require('path');
require('dotenv').config();

class SessionManager {
  constructor(options = {}) {
    this.sessionDir = options.sessionDir || path.join(__dirname, '../../storage/sessions');
    if (!fs.existsSync(this.sessionDir)) {
      fs.mkdirSync(this.sessionDir, { recursive: true });
    }
  }

  getSessionPath(role = 'employee') {
    const roleStr = String(role || '').toLowerCase();
    const normalized = (roleStr.includes('it') || roleStr.includes('admin')) ? 'it' : 'employee';
    return path.join(this.sessionDir, `${normalized}_session.json`);
  }

  hasExistingSession(role = 'employee') {
    const sessionFile = this.getSessionPath(role);
    return fs.existsSync(sessionFile) && fs.statSync(sessionFile).size > 10;
  }

  getCredentials(role = 'employee') {
    const roleStr = String(role || '').toLowerCase();
    const hasIt = roleStr.includes('it') || roleStr.includes('admin');

    if (hasIt || (!process.env.AUTH_EMPLOYEE_USERNAME && process.env.AUTH_IT_USERNAME)) {
      return {
        username: process.env.AUTH_IT_USERNAME || '',
        password: process.env.AUTH_IT_PASSWORD || '',
        roleName: process.env.AUTH_IT_ROLE || 'IT Administrator'
      };
    }

    return {
      username: process.env.AUTH_EMPLOYEE_USERNAME || '',
      password: process.env.AUTH_EMPLOYEE_PASSWORD || '',
      roleName: process.env.AUTH_EMPLOYEE_ROLE || 'Karyawan Operasional'
    };
  }

  /**
   * Applies existing session state (cookies, local storage) to a browser context.
   */
  async restoreSession(context, role = 'employee') {
    const sessionFile = this.getSessionPath(role);
    if (fs.existsSync(sessionFile)) {
      try {
        const state = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
        await context.addCookies(state.cookies || []);
        console.log(`[SessionManager] Restored existing session for role: ${role}`);
        return true;
      } catch (err) {
        console.warn(`[SessionManager] Failed to restore session for ${role}: ${err.message}`);
      }
    }
    return false;
  }

  /**
   * Saves current storage state (cookies, origins) to file for reuse.
   */
  async saveSession(context, role = 'employee') {
    const sessionFile = this.getSessionPath(role);
    try {
      await context.storageState({ path: sessionFile });
      console.log(`[SessionManager] Successfully saved session state to ${sessionFile}`);
    } catch (err) {
      console.error(`[SessionManager] Error saving session state: ${err.message}`);
    }
  }

  /**
   * Performs automated login if session does not exist.
   */
  async performLogin(page, context, role = 'employee', loginUrl = null) {
    const creds = this.getCredentials(role);
    const targetUrl = loginUrl || process.env.BASE_URL;

    if (!creds.username || !creds.password) {
      console.warn(`[SessionManager] Warning: No credentials configured for role: ${role} in .env file.`);
      return false;
    }

    console.log(`[SessionManager] Navigating to login for role: ${creds.roleName} (${creds.username})`);
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Look for login fields
    const usernameInput = await page.$('input[name*="user" i], input[name*="email" i], input[type="email"], input[id*="user" i], input[id*="email" i]');
    const passwordInput = await page.$('input[type="password"]');

    if (usernameInput && passwordInput) {
      console.log(`[SessionManager] Filling credentials safely...`);
      await usernameInput.fill(creds.username);
      await page.waitForTimeout(500);
      await passwordInput.fill(creds.password);
      await page.waitForTimeout(500);

      // Find submit button specifically for auth
      const submitBtn = await page.$('button[type="submit"], input[type="submit"], form button');
      if (submitBtn) {
        console.log(`[SessionManager] Submitting authentication...`);
        await Promise.all([
          page.waitForNavigation({ timeout: 8000, waitUntil: 'domcontentloaded' }).catch(() => {}),
          submitBtn.click()
        ]);
        await page.waitForTimeout(3500);
      }

      await this.saveSession(context, role);
      console.log(`[SessionManager] Login completed for ${role}. Current URL: ${page.url()}`);
      return true;
    } else {
      console.log(`[SessionManager] Login inputs not detected at ${targetUrl}. System may already be authenticated or publicly accessible.`);
      return false;
    }
  }
}

module.exports = { SessionManager };

