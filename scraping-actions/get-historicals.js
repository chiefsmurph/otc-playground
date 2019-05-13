
const number = require('../helpers/number');
const getTrend = require('../helpers/get-trend');
const cacheThis = require('../helpers/cache-this');

const HEADERS = [
  'date',
  'open',
  'high',
  'low',
  'close',
  'volume'
];


module.exports = cacheThis(async (ticker) => {
  console.log(ticker)
  //https://finance.yahoo.com/quote/LEAS/history?p=LEAS
  // https://www.nasdaq.com/symbol/leas/historical
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', request => {
    if (request.resourceType() === 'image' || !request.url().includes('nasdaq'))
      request.abort();
    else
      request.continue();
  });
  await page.goto(`https://www.nasdaq.com/symbol/${ticker}/historical`, { waitUntil: 'domcontentloaded' });
  
  const data = await page.evaluate((text) => {
    const tableSel = '#historicalContainer table';
    const trs = Array.from(document.querySelectorAll(`${tableSel} tr`)).slice(2);
    return trs
      .map(tr => Array.from(tr.querySelectorAll('td')))
      .map(tdArrays =>
        tdArrays.map(td => td.textContent.trim())
      );
  });

  if (data || data.length) {
    console.log('OH NO - NO HISTORICAL DATA')
  }
  // console.log({ data })

  const hists = data
    .map(arr => 
      HEADERS.reduce((acc, header, ind) => ({
        ...acc,
        [header]: arr[ind]
      }), {})
    )
    .map(hist => {
      Object.keys(hist).forEach(key => {
        if (key === 'date') {
          hist[key] = new Date(hist[key]);
        } else {
          hist[key] = number(hist[key]);
        }
      });
      return hist;
    });

  const withTrend = hists.map((hist, index) => {
    const prevDay = hists[index + 1];
    const withTSO = {
      ...hist,
      tso: getTrend(hist.open, hist.close)
    };
    if (!prevDay) return withTSO;
    return {
      ...withTSO,
      tsc: getTrend(prevDay.close, hist.close)
    };
  });

  const allVols = withTrend.map(hist => hist.volume).filter(Boolean);
  const maxVol = Math.max(...allVols);
  const minVol = Math.min(...allVols);
  // console.log({ maxVol, minVol });
  const spread = maxVol - minVol;
  const withVolumePerc = withTrend.map(hist => {
    const { volume } = hist;
    const volMinusMin = volume - minVol;
    return {
      ...hist,
      volumeRatio: volMinusMin / spread * 100
    };
  });

  console.log(`got historicals for ${ticker}`, withVolumePerc);
  await page.waitFor(1500);
  await page.close();
  return withVolumePerc;

}, 200);