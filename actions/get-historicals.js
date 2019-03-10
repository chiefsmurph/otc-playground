
const number = require('../helpers/number');
const getTrend = require('../helpers/get-trend')

const HEADERS = [
  'date',
  'open',
  'high',
  'low',
  'close',
  'adj_close',
  'volume'
];


module.exports = async (browser, ticker) => {

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
  

  const objs = data
    .map(arr => 
      HEADERS.reduce((acc, header, ind) => ({
        ...acc,
        [header]: arr[ind]
      }), {})
    )
    .map(obj => {
      Object.keys(obj).forEach(key => {
        if (key === 'date') {
          obj[key] = new Date(obj[key]);
        } else {
          obj[key] = number(obj[key]);
        }
      });
      return obj;
    });

  const withTrend = objs.map((obj, index) => {
    const prevDay = objs[index + 1];
    if (!prevDay) return obj;
    return {
      ...obj,
      trend: getTrend(prevDay.close, obj.close)
    };
  });


  console.log(`got historicals for ${ticker}`);
  await page.close();
  return withTrend;

};