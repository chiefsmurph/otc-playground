// lots of volume little price actions (green)



const puppeteer = require('puppeteer');
const request = require('request-promise');
const cTable = require('console.table');
const { pick } = require('underscore');
const mapLimit = require('promise-map-limit');

const getHistoricals = require('../scraping-actions/get-historicals');
const getTrend = require('../helpers/get-trend');


const MIN_PRICE = 0.0009;
const MAX_PRICE = 0.03;
const MIN_DOLLAR_VOLUME = 2000;
const MIN_TRADE_COUNT = 6;
const COUNT = 305;




(async () => {


    await require('../helpers/init-browser')();

    const response = JSON.parse(await request(`https://backend.otcmarkets.com/otcapi/market-data/active/current?tierGroup=ALL&page=1&pageSize=25000&sortOn=volume`));
    
    console.table(response.records);

    // response.records.forEach(({ symbol, pctChange, tradeCount, dollarVolume }) => {
    //     console.log(pctChange, symbol, tradeCount, dollarVolume);
    // });

    const { records } = response;
    console.log('record count', records.length);
    const filtered = records
      .filter(r => r.pctChange < 20)
      .filter(r => r.price > MIN_PRICE && r.price < MAX_PRICE)
      .filter(r => r.dollarVolume >= MIN_DOLLAR_VOLUME)
      .filter(r => r.tradeCount >= MIN_TRADE_COUNT)
      .map(record =>
          pick(record, ['symbol', 'pctChange', 'price'])
      );


    const sliced = filtered.slice(0, COUNT);
    console.log('total of interest:', sliced.length);

    let i = 0;
    const withHistoricals = await mapLimit(sliced, 14, async record => {
        let historicals;
        try {
            historicals = await getHistoricals(record.symbol);
            console.log(`${++i}/${sliced.length}`);
        } catch (e) {
            console.log(e)
        }
        try {
          return {
            ...record,
            historicals
          };
        } catch (e) {
          console.log(e, record.symbol);
          return record;
        }
    });

    const withDayStreak = withHistoricals.map(record => ({
      ...pick(record, 'symbol'),
      dayStreak: record.historicals.findIndex(hist => hist.tso <= 0 && hist.tsc <= 0)
    }));


    console.table(
      withDayStreak
          // .filter(record => record.bodyTrend > 0)
          .sort((a, b) => b.dayStreak - a.dayStreak)
    )


    // console.table(
    //   withHistoricals
    //       .filter(record => record.bodyTrend > 0)
    //       .sort((a, b) => b.volumeRatio - a.volumeRatio)
    // )

    console.log('-----------');


    await browser.close();
})();