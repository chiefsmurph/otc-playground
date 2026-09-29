const { execFileSync } = require('child_process');
const path = require('path');
const DIR = '/home/deploy/otc-playground';
const gl = require('/home/deploy/golden-lion/config.js');
process.env.PROXY_USER = gl.proxy.username; process.env.PROXY_PASS = gl.proxy.password; process.env.PROXY_HOSTS = (gl.proxy.hosts || []).join(',');
const raw = execFileSync('node', [path.join(DIR, 'scan.js'), '--json', '--source', 'decliners', '--domestic', '--priceMax', '5', '--minVol', '1000', '--minTrades', '3', '--pages', '5', '--limit', '30'], { cwd: DIR, env: process.env, maxBuffer: 32e6 });
const universe = JSON.parse(raw).map(u => ({ symbol: u.symbol }));
console.log('decliners universe:', universe.length, '->', universe.map(u => u.symbol).join(','));
const addHistoricals = require(path.join(DIR, 'helpers', 'add-historicals'));
const { RSI } = require('technicalindicators');
(async () => {
  const wh = await addHistoricals(universe);
  const withHist = wh.filter(r => r.historicals && r.historicals.length);
  console.log('got historicals:', withHist.length, 'of', universe.length);
  const rsis = withHist.map(r => {
    const closes = r.historicals.map(h => h.close).reverse();
    const rsi = RSI.calculate({ values: closes, period: 14 });
    return { s: r.symbol, rsi: Math.round(rsi[rsi.length - 1] || 0), n: r.historicals.length };
  }).sort((a, b) => a.rsi - b.rsi);
  console.log('RSI (lowest first):', rsis.slice(0, 10).map(x => `${x.s}:${x.rsi}(${x.n}d)`).join(' '));
  console.log('any RSI<30?', rsis.filter(x => x.rsi < 30 && x.rsi > 0).map(x => x.s).join(',') || 'NONE');
})();
