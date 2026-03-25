#!/usr/bin/env node
// env.js — Shared environment loader for Amap Web Service scripts
// Resolves AMAP_WEBSERVICE_KEY from env var or ~/.swat/.env file

const fs = require('fs');
const path = require('path');

const ENV_FILE = path.join(process.env.HOME, '.swat', '.env');
const KEY_NAME = 'AMAP_WEBSERVICE_KEY';

/**
 * Load a key=value .env file into an object.
 * Supports lines like: KEY=value (no quotes handling needed for simple values)
 */
function loadEnvFile(filePath) {
  const vars = {};
  if (!fs.existsSync(filePath)) return vars;
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    // Strip surrounding quotes if present
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    vars[key] = val;
  }
  return vars;
}

/**
 * Resolve the Amap Web Service API key.
 * Priority: AMAP_WEBSERVICE_KEY env var > ~/.swat/.env file
 * Exits with error if not found.
 */
function getApiKey() {
  // 1. Check environment variable
  if (process.env[KEY_NAME]) {
    return process.env[KEY_NAME];
  }
  // 2. Check ~/.swat/.env file
  const envVars = loadEnvFile(ENV_FILE);
  if (envVars[KEY_NAME]) {
    return envVars[KEY_NAME];
  }
  // 3. Not found — error with clear message
  console.error(JSON.stringify({
    error: 'AMAP_WEBSERVICE_KEY not found',
    message: `Set the AMAP_WEBSERVICE_KEY environment variable or add AMAP_WEBSERVICE_KEY=<your-key> to ${ENV_FILE}`,
    hint: 'Get your key from https://lbs.amap.com → Console → My Apps → Create App → Add Key (Web Service type)'
  }, null, 2));
  process.exit(1);
}

/**
 * Make an API request to Amap Web Service.
 * @param {string} url - Full API endpoint URL
 * @param {object} params - Query parameters (key is auto-added)
 * @returns {Promise<object>} Parsed JSON response
 */
async function apiRequest(url, params = {}) {
  const key = getApiKey();
  const searchParams = new URLSearchParams({ key, ...params });
  const fullUrl = `${url}?${searchParams.toString()}`;

  const response = await fetch(fullUrl);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  const data = await response.json();

  // Standard Amap v3/v5 error check (status === '1' means success)
  if (data.status === '0') {
    throw new Error(`Amap API error: ${data.info || 'Unknown error'} (infocode: ${data.infocode || 'N/A'})`);
  }
  return data;
}

/**
 * Parse CLI arguments in --key=value format.
 * @param {string[]} argv - process.argv.slice(2)
 * @returns {object} Parsed arguments
 */
function parseArgs(argv) {
  const args = {};
  for (const arg of argv) {
    if (arg.startsWith('--')) {
      const eqIdx = arg.indexOf('=');
      if (eqIdx > 0) {
        args[arg.slice(2, eqIdx)] = arg.slice(eqIdx + 1);
      } else {
        args[arg.slice(2)] = true;
      }
    }
  }
  return args;
}

module.exports = { getApiKey, apiRequest, parseArgs, loadEnvFile };
