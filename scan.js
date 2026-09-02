#!/usr/bin/env node
// Modern OTC scanner — the "penny stock scanner" half of otc-playground, revived.
// Pulls today's advancers / most-active from the OTCMarkets backend API (still live)
// and returns a filtered universe of hot penny names. Zero npm install, no Puppeteer.
//
//   node scan                                  advancers, default penny filters
//   node scan --source active                  most-active instead of advancers
//   node scan --priceMax 1 --minVol 20000      custom filters
//   node scan --out universe.json              save the symbol universe (feeds otc.js / pattern-predict)
//   node scan --json
//
// Endpoints discovered from the original collections/ scrapers; confirmed 200 today.

const fs = require('fs');
const { execFile } = require('child_process');

// OTCMarkets' backend fingerprints the HTTP client via bot-management. Node's
// built-in fetch (undici) gets flagged (403/412); curl passes cleanly. So we
// shell out to curl (present on macOS + Linux) with a full browser header set.
const OTC_HEADERS = [
  'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
  'Accept: application/json, text/plain, */*',
  'Accept-Language: en-US,en;q=0.9',
  'Origin: https://www.otcmarkets.com',
  'Referer: https://www.otcmarkets.com/',
];

function curlJson(url) {
  const args = ['-s', '--compressed', '--max-time', '30'];
  for (const h of OTC_HEADERS) args.push('-H', h);
  args.push(url);
  return new Promise((resolve, reject) => {
    execFile('curl', args, { maxBuffer: 64 * 1024 * 1024 }, (err, stdout) => {
      if (err) return reject(err);
      try { resolve(JSON.parse(stdout)); }
      catch (e) { reject(new Error(`bad response (blocked? empty?): ${stdout.slice(0, 80)}`)); }
    });
  });
}

function arg(name, def) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : def;
}
function has(name) { return process.argv.includes(`--${name}`); }

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchMarketData(source, pages) {
  // source: 'advancers' | 'active' | 'decliners'.
  // OTCMarkets now caps pageSize at 50, so paginate. Records are volume-sorted,
  // so the first few pages already contain the hottest movers.
  const PAGE_SIZE = 50;
  const all = [];
  for (let page = 1; page <= pages; page++) {
    const url = `https://backend.otcmarkets.com/otcapi/market-data/${source}/current` +
      `?tierGroup=ALL&page=${page}&pageSize=${PAGE_SIZE}&sortOn=volume`;
    const data = await curlJson(url);
    if (!data || !Array.isArray(data.records)) {
      throw new Error(`OTCMarkets ${source}: unexpected response`);
    }
    all.push(...data.records);
    if (data.pages && page >= data.pages) break;
    await sleep(300); // be polite; avoid the throttle
  }
  return all;
}

async function main() {
  const source = arg('source', 'advancers');
  const priceMin = Number(arg('priceMin', 0.0001));
  const priceMax = Number(arg('priceMax', 1.0));
  const minDollarVolume = Number(arg('minVol', 5000));
  const minTradeCount = Number(arg('minTrades', 5));
  const limit = Number(arg('limit', 50));
  const pages = Number(arg('pages', 6)); // 6 * 50 = top 300 by volume
  const sortOn = arg('sort', 'dollarVolume'); // dollarVolume | pctChange
  const json = has('json');
  const outFile = arg('out', null);

  const records = await fetchMarketData(source, pages);
  // Foreign ADRs/ordinaries (5-letter symbols ending in F or Y) are common in the
  // volume-sorted OTC lists but are mostly NOT covered by Tiingo historicals.
  // --domestic drops them so the universe lines up with what otc.js / pattern-predict can analyze.
  const isForeignAdr = sym => /^[A-Z]{4}[FY]$/.test(sym);
  const filtered = records
    .filter(r => r.price >= priceMin && r.price <= priceMax)
    .filter(r => r.dollarVolume >= minDollarVolume)
    .filter(r => r.tradeCount >= minTradeCount)
    .filter(r => (source === 'advancers' ? r.pctChange > 0 : true))
    .filter(r => (has('domestic') ? !isForeignAdr(r.symbol) : true))
    .map(r => ({
      symbol: r.symbol,
      price: r.price,
      pctChange: r.pctChange,
      dollarVolume: Math.round(r.dollarVolume),
      tradeCount: r.tradeCount,
    }))
    .sort((a, b) => b[sortOn] - a[sortOn])
    .slice(0, limit);

  if (outFile) {
    fs.writeFileSync(outFile, JSON.stringify(filtered, null, 2));
  }

  if (json) {
    console.log(JSON.stringify(filtered, null, 2));
    return;
  }
  console.log(`\nOTC ${source} — ${filtered.length}/${records.length} passed ` +
    `(price ${priceMin}-${priceMax}, $vol>=${minDollarVolume}, trades>=${minTradeCount}), sorted by ${sortOn}`);
  console.table(filtered);
  if (outFile) console.log(`universe written -> ${outFile}  (feed to: node otc --watchlist ${outFile})`);
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
