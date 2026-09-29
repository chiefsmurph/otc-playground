// Polygon daily aggregates -> the exact shape otc-playground scans expect.
// Paid tier: unlimited calls, so no throttle needed. Key from env/.env.
const getTrend = require('../helpers/get-trend');
const cacheThis = require('../helpers/cache-this');
const fs = require('fs');
let KEY = process.env.POLYGON_API_KEY;
if (!KEY) { try { KEY = Object.fromEntries(fs.readFileSync('/home/deploy/chiefsmurph-push/.env', 'utf8').split('\n').filter(l => l && !l.startsWith('#')).map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)]; })).POLYGON_API_KEY; } catch (e) {} }

const getHistoricals = async (ticker) => {
  const to = new Date().toISOString().slice(0, 10);
  const url = `https://api.polygon.io/v2/aggs/ticker/${encodeURIComponent(ticker)}/range/1/day/2023-06-01/${to}?adjusted=true&sort=desc&limit=400&apiKey=${KEY}`;
  const r = await fetch(url);
  const b = await r.json();
  const results = b.results || [];
  if (!results.length) return [];
  const hists = results.map(bar => ({
    date: new Date(bar.t),
    open: bar.o, high: bar.h, low: bar.l, close: bar.c, volume: bar.v,
    adjOpen: bar.o, adjHigh: bar.h, adjLow: bar.l, adjClose: bar.c, adjVolume: bar.v,
  }));
  const withTrend = hists.map((hist, index) => {
    const prevDay = hists[index + 1];
    const withTSO = { ...hist, tso: getTrend(hist.adjOpen, hist.adjClose) };
    if (!prevDay) return withTSO;
    return { ...withTSO, tsc: getTrend(prevDay.adjClose, hist.adjClose) };
  });
  const allVols = withTrend.map(h => h.adjVolume).filter(Boolean);
  const maxVol = Math.max(...allVols), minVol = Math.min(...allVols), spread = maxVol - minVol;
  return withTrend.map(h => ({ ...h, volumeRatio: spread ? (h.adjVolume - minVol) / spread * 100 : 0 }));
};
module.exports = { getHistoricals, cachedHistoricals: cacheThis(getHistoricals, 400) };
