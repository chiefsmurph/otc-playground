// lots of volume little price actions (green)



const puppeteer = require('puppeteer');
const request = require('request-promise');
const cTable = require('console.table');
const { pick } = require('underscore');
const mapLimit = require('promise-map-limit');

const iHub = require('../scraping-actions/ihub');


const MIN_PRICE = 0.001;
const MAX_PRICE = 0.0099;
const MIN_DOLLAR_VOLUME = 2000;
const MIN_TRADE_COUNT = 4;
const COUNT = 300;




(async () => {


    await require('../helpers/init-browser')();

    const response = JSON.parse(await request(`https://backend.otcmarkets.com/otcapi/market-data/active/current?tierGroup=ALL&page=1&pageSize=25000&sortOn=volume&priceMin=${MIN_PRICE}`));
    
    console.table(response.records);

    // response.records.forEach(({ symbol, pctChange, tradeCount, dollarVolume }) => {
    //     console.log(pctChange, symbol, tradeCount, dollarVolume);
    // });

    const { records } = response;
    console.log('record count', records.length);
    const filtered = records
      .filter(r => r.price >= MIN_PRICE && r.price <= MAX_PRICE)
      .filter(r => r.dollarVolume >= MIN_DOLLAR_VOLUME)
      .filter(r => r.tradeCount >= MIN_TRADE_COUNT)
      .map(record =>
          pick(record, ['symbol', 'pctChange', 'price'])
      );


    const sliced = filtered.slice(0, COUNT);
    console.log('total of interest:', sliced.length);

    let i = 0;
    const withHits = await mapLimit(sliced, 5, async record => {
      const { symbol: ticker } = record;
      let iHubData;
      try {
        iHubData = await iHub(ticker);
        const hit = iHubData.containsMerger;
        console.log(`${++i}/${sliced.length}${hit ? ` - containsMerger ${ticker}` : ''}`);
      } catch (e) {
        console.log(e, ticker)
      }
      return {
        ticker,
        ...iHubData
      };
    });

    const hits = withHits.filter(obj => obj.containsMerger).map(obj => obj.ticker);

    console.log({ hits });
    await browser.close();
})();