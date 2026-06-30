#!/usr/bin/env npx tsx
/**
 * TEMPORARY — Gemini 401 diagnostic. Delete after investigation.
 * Run: pnpm exec tsx packages/ai/scripts/gemini-debug.ts
 */
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(__dirname, '../../..');
const MARKETING_ENV = resolve(ROOT, 'apps/marketing/.env.local');
const DASHBOARD_ENV = resolve(ROOT, 'apps/dashboard/.env.local');

function parseEnvFile(path: string): Record<string, string> {
  if (!existsSync(path)) return {};
  const out: Record<string, string> = {};
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function keyFingerprint(key: string) {
  return {
    length: key.length,
    first5: key.slice(0, 5),
    last5: key.slice(-5),
  };
}

async function testGetModels(key: string, label: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`;
  const res = await fetch(url);
  const body = await res.text();
  return { label, url: url.replace(key, '[KEY]'), status: res.status, body: body.slice(0, 800) };
}

async function testPostGenerate(key: string, model: string, label: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
  const payload = {
    contents: [{ parts: [{ text: 'Merhaba' }] }],
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await res.text();
  return { label, model, url: url.replace(key, '[KEY]'), status: res.status, body: body.slice(0, 800) };
}

async function testAuthVariants(key: string, model: string) {
  const path = `models/${model}:generateContent`;
  const baseUrl = `https://generativelanguage.googleapis.com/v1beta/${path}`;
  const payload = JSON.stringify({ contents: [{ parts: [{ text: 'Merhaba' }] }] });

  const variants = [
    { label: 'query_key', url: `${baseUrl}?key=${encodeURIComponent(key)}`, headers: { 'Content-Type': 'application/json' } },
    { label: 'header_key', url: baseUrl, headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key } },
    { label: 'bearer_token', url: baseUrl, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` } },
  ];

  const results = [];
  for (const v of variants) {
    const res = await fetch(v.url, { method: 'POST', headers: v.headers, body: payload });
    const body = await res.text();
    results.push({
      authMethod: v.label,
      status: res.status,
      bodyPreview: body.slice(0, 400),
    });
  }
  return results;
}

async function main() {
  const marketing = parseEnvFile(MARKETING_ENV);
  const dashboard = parseEnvFile(DASHBOARD_ENV);

  const marketingKey = marketing.GEMINI_API_KEY?.trim() ?? '';
  const dashboardKey = dashboard.GEMINI_API_KEY?.trim() ?? '';
  const keysIdentical = marketingKey === dashboardKey && marketingKey.length > 0;

  console.log('=== A) KEY FINGERPRINTS ===');
  console.log(JSON.stringify({
    marketingEnvExists: existsSync(MARKETING_ENV),
    dashboardEnvExists: existsSync(DASHBOARD_ENV),
    keysIdentical,
    marketing: keyFingerprint(marketingKey),
    dashboard: keyFingerprint(dashboardKey),
    marketingModel: marketing.GEMINI_MODEL ?? '(unset)',
    dashboardModel: dashboard.GEMINI_MODEL ?? '(unset)',
    charDiff: keysIdentical
      ? null
      : {
          marketingLen: marketingKey.length,
          dashboardLen: dashboardKey.length,
          firstMismatchIndex: [...marketingKey].findIndex((c, i) => c !== dashboardKey[i]),
        },
  }, null, 2));

  const primaryKey = marketingKey || dashboardKey;
  if (!primaryKey) {
    console.log('\nFATAL: No GEMINI_API_KEY found in either env file.');
    process.exit(1);
  }

  console.log('\n=== B) GET /v1beta/models?key=KEY (marketing key) ===');
  const getModels = await testGetModels(marketingKey, 'marketing');
  console.log(JSON.stringify(getModels, null, 2));

  if (!keysIdentical && dashboardKey) {
    console.log('\n=== B2) GET /v1beta/models?key=KEY (dashboard key) ===');
    console.log(JSON.stringify(await testGetModels(dashboardKey, 'dashboard'), null, 2));
  }

  console.log('\n=== C) POST generateContent gemini-2.5-flash (marketing key) ===');
  const postFlash = await testPostGenerate(marketingKey, 'gemini-2.5-flash', 'marketing');
  console.log(JSON.stringify(postFlash, null, 2));

  console.log('\n=== D) Nertura Gemini client (marketing env loaded into process.env) ===');
  process.env.GEMINI_API_KEY = marketingKey;
  process.env.GEMINI_MODEL = marketing.GEMINI_MODEL ?? 'gemini-2.0-flash';

  const clientReport: Record<string, unknown> = {
    modelName: process.env.GEMINI_MODEL,
    requestUrlPattern: `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL}:generateContent?key=[KEY]`,
    authMethodOrder: ['query_key', 'header_key', 'bearer_token'],
  };

  try {
    const { askGemini, getGeminiKeyStatus, getGeminiModel } = await import('../src/gemini.ts');
    clientReport.keyStatus = getGeminiKeyStatus();
    clientReport.resolvedModel = getGeminiModel();
    const result = await askGemini('Merhaba');
    clientReport.response = { provider: result.provider, model: result.model, answerPreview: result.answer.slice(0, 120) };
    clientReport.error = null;
  } catch (err) {
    clientReport.response = null;
    clientReport.error = err instanceof Error ? { name: err.name, message: err.message, status: (err as { status?: number }).status } : String(err);
  }
  console.log(JSON.stringify(clientReport, null, 2));

  const modelsToTry = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash', marketing.GEMINI_MODEL ?? 'gemini-3.5-flash'].filter(
    (m, i, a) => m && a.indexOf(m) === i
  );

  console.log('\n=== E) MODEL SWEEP (GET models list already done; POST each model) ===');
  const modelResults = [];
  for (const model of modelsToTry) {
    const r = await testPostGenerate(marketingKey, model, model);
    modelResults.push({ model, status: r.status, ok: r.status === 200, errorPreview: r.status !== 200 ? r.body.slice(0, 200) : 'OK' });
  }
  console.log(JSON.stringify(modelResults, null, 2));

  console.log('\n=== F) AUTH VARIANT SWEEP (gemini-2.5-flash) ===');
  console.log(JSON.stringify(await testAuthVariants(marketingKey, 'gemini-2.5-flash'), null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
