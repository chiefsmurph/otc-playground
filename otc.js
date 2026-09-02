#!/usr/bin/env node
// Modern, zero-install performance analyzer for penny/OTC tickers.
//
//   node otc TRTC HYSNF ABML          analyze one or more tickers
//   node otc --watchlist data/watch-lists/1-10-2020.json
//   node otc TRTC --json
//
// Uses Tiingo (config.tiingo.token) via Node 18+ global fetch. No Puppeteer,
// no scraping, no npm install. This is the "watch list performance analyzer"
// half of otc-playground, decoupled from the (mostly dead) scraper half.

require('./load-env');
const fs = require('fs');
const { tiingo: { token }, daysToAnalyze } = require('./config');

if (!token) {
  console.error('No Tiingo token. Copy config.example.js -> config.js and set TIINGO_TOKEN (or put it in .env).');
  process.exit(1);
}

async function getHistoricals(ticker, startDate = '2018-01-01') {
  const url = `https://api.tiingo.com/tiingo/daily/${encodeURIComponent(ticker)}/prices` +
    `?startDate=${startDate}&token=${token}`;
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
  if (!res.ok) return null;
  const rows = await res.json();
  return Array.isArray(rows) && rows.length ? rows : null;
}

function analyze(ticker, rows, days) {
  const px = r => (r.adjClose != null ? r.adjClose : r.close);
  const vol = r => (r.adjVolume != null ? r.adjVolume : r.volume);
  const last = rows[rows.length - 1];
  const window = rows.slice(-days);
  const first = window[0];
  const closes = window.map(px);
  const vols = window.map(vol);
  const hi = Math.max(...closes), lo = Math.min(...closes);
  const avgVol = vols.reduce((a, b) => a + b, 0) / vols.length;
  const retPct = ((px(last) - px(first)) / px(first)) * 100;
  const offHigh = ((px(last) - hi) / hi) * 100;
  const volSpike = avgVol ? (vol(last) / avgVol) : 0;
  return {
    ticker,
    last: +px(last).toFixed(4),
    date: last.date.slice(0, 10),
    [`ret${days}d%`]: +retPct.toFixed(1),
    windowHigh: +hi.toFixed(4),
    windowLow: +lo.toFixed(4),
    offHigh$pct: +offHigh.toFixed(1),
    avgVol: Math.round(avgVol),
    lastVolVsAvg: +volSpike.toFixed(2),
    trend: retPct > 0 ? 'up' : 'down',
  };
}

function extractTickers(fileContent) {
  // Accept ["AAA","BBB"], {tickers:[...]}, or any JSON; fall back to $TICKER / TICKER tokens.
  try {
    const j = JSON.parse(fileContent);
    if (Array.isArray(j) && j.every(x => typeof x === 'string')) return j;
    if (Array.isArray(j.tickers)) return j.tickers;
  } catch (e) { /* not clean json array */ }
  const matches = fileContent.match(/\$?\b([A-Z]{3,5})\b/g) || [];
  return [...new Set(matches.map(m => m.replace('$', '')))];
}

async function main() {
  const args = process.argv.slice(2);
  const json = args.includes('--json');
  const days = Number(daysToAnalyze) || 90;

  let tickers = [];
  const wlIdx = args.indexOf('--watchlist');
  if (wlIdx !== -1) {
    const file = args[wlIdx + 1];
    tickers = extractTickers(fs.readFileSync(file, 'utf8'));
  } else {
    tickers = args.filter(a => !a.startsWith('--')).map(t => t.toUpperCase());
  }
  if (!tickers.length) {
    console.log('usage:\n  node otc <TICKER...>\n  node otc --watchlist <file.json>');
    process.exit(1);
  }

  const results = [];
  const missing = [];
  for (const t of tickers) {
    const rows = await getHistoricals(t);
    if (!rows) { missing.push(t); continue; }
    results.push(analyze(t, rows, days));
  }

  if (json) {
    console.log(JSON.stringify({ days, results, missing }, null, 2));
    return;
  }
  console.log(`\nOTC performance — trailing ${days} trading days (Tiingo)`);
  console.table(results);
  if (missing.length) console.log(`no Tiingo data (delisted / not covered): ${missing.join(', ')}`);
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
