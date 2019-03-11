// lots of volume little price actions (green)



const puppeteer = require('puppeteer');
const request = require('request-promise');
const cTable = require('console.table');
const { pick } = require('underscore');
const mapLimit = require('promise-map-limit');

const getHistoricals = require('../actions/get-historicals');
const getTrend = require('../helpers/get-trend');


const MIN_PRICE = 0.0004;
const MAX_PRICE = 0.01;
const MIN_DOLLAR_VOLUME = 4000;
const MIN_TRADE_COUNT = 10;
const COUNT = 300;




(async () => {


    const browser = await puppeteer.launch({ headless: true });

    const response = JSON.parse(await request(`https://backend.otcmarkets.com/otcapi/market-data/active/current?tierGroup=ALL&page=1&pageSize=25000&sortOn=volume&priceMin=${MIN_PRICE}`));
    
    console.table(response.records);

    // response.records.forEach(({ symbol, pctChange, tradeCount, dollarVolume }) => {
    //     console.log(pctChange, symbol, tradeCount, dollarVolume);
    // });

    const { records } = response;
    console.log('record count', records.length);
    const filtered = records
      .filter(r => r.pctChange < 20)
      .filter(r => r.price < MAX_PRICE)
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
            historicals = await getHistoricals(browser, record.symbol);
            console.log(`${++i}/${sliced.length}`);
        } catch (e) {
            console.log(e)
        }
        const recentHistorical = historicals[0];
        try {
          return {
            ...record,
            ...recentHistorical,
            bodyTrend: getTrend(
              recentHistorical.open,
              recentHistorical.close
            ),
            wickSize: getTrend(recentHistorical.close, recentHistorical.high) + getTrend(recentHistorical.low, recentHistorical.open)
          };
        } catch (e) {
          console.log(e);
          console.log({ ticker, recentHistorical });
          return record;
        }
    });



    const withVolumeToChangeRatio = withHistoricals.map(record => ({
      ...record,
      volumeToChangeRatio: record.volumeRatio / record.bodyTrend
    }));

    const withAccumulationScore = withVolumeToChangeRatio.map(record => ({
      ...record,
      accumulationScore: Math.round(record.volumeToChangeRatio / record.wickSize * 100)
    }));

    // const withTier = withVolumeToChangeRatio.map(record => ({
    //     ...record,
    //     tier: response.records.find(r => r.symbol === record.symbol).tierName
    // }));


    console.table(
      withAccumulationScore
          .sort((a, b) => b.accumulationScore - a.accumulationScore)
    )

    console.log('-----------');


    const smallWicks = withAccumulationScore.filter(record => record.wickSize < 25);
    const goodVol = smallWicks.filter(record => record.volumeRatio > 35);

    console.table(
      goodVol
          .sort((a, b) => b.accumulationScore - a.accumulationScore)
    )
    // console.log(
    //     JSON.stringify(
    //       withAccumulationScore,
    //         null,
    //         2
    //     )
    // )


    await browser.close();
})();