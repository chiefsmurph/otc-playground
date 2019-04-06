const puppeteer = require('puppeteer');
const mapLimit = require('promise-map-limit');
const { mapObject, chain } = require('underscore');

const getHistoricals = require('../scraping-actions/get-historicals');

const jsonMgr = require('../helpers/json-mgr');
const getTickers = require('../helpers/get-tickers');
const getTrend = require('../helpers/get-trend');
const { avgArray } = require('../helpers/array-math');

let historicalCache = {};
let tickerPerf = {};
let listPerf = {};


const MAX_DAYS = 4;
const IGNORE_TRIPS = true;


module.exports = async dateStr => {


  // load watch list data and get uniq ticks
  const data = require(`../data/watch-lists/${dateStr}`);
  const dataTicks = mapObject(data, getTickers);
  const uniqTicks = chain(dataTicks)
    .values()
    .flatten()
    .uniq()
    .value();

    

  // get all historical data
  await require('../helpers/init-browser')();
  for (let ticker of uniqTicks) {
    historicalCache[ticker] = await getHistoricals(ticker);
  }
  await browser.close();


  let numDays;
  // calc ticker performance
  const dateAsDate = new Date(dateStr);
  tickerPerf = mapObject(historicalCache, historicals => {

    // construct array of only historicals following dateStr
    const foundIndex = historicals.findIndex(hist => hist.date.getTime() === dateAsDate.getTime());
    let followingDays = historicals.slice(0, foundIndex).reverse();
    followingDays = followingDays.slice(0, MAX_DAYS);
    numDays = numDays || followingDays.length;

    // important prices
    const buyPrice = followingDays[0].open;
    const max = Math.max(...followingDays.map(hist => hist.high));
    const low = Math.min(...followingDays.map(hist => hist.low));

    // important trends
    const trendToHigh = getTrend(buyPrice, max);
    const trendToLow = getTrend(buyPrice, low);
    const avgTrendBetween = (trendToHigh + trendToLow) / 2;
    return {
      prices: {
        buyPrice,
        max,
        low,
      },
      perfs: {
        trendToHigh,
        trendToLow,
        avgTrendBetween
      }
    };

  });
  


  console.log(
    JSON.stringify(tickerPerf, null, 2)
  );

  // aggregate list performance
  listPerf = mapObject(dataTicks, tickers => {

    return tickers
      .filter(ticker => !IGNORE_TRIPS || tickerPerf[ticker].prices.buyPrice >= .001)
      .map(ticker => ({
        ticker,
        ...tickerPerf[ticker].perfs
      }));

  });


  console.log(
    `--------`
  );




  listPerf = mapObject(listPerf, tickerPerfs => {

    const allPerfs = Object.keys(tickerPerfs[0]).slice(1);
    console.log({ allPerfs, tickerPerfs });
    const allTickers = tickerPerfs.map(t => t.ticker);
    const avgs = allPerfs.reduce((acc, perfKey) => {

      const allVals = tickerPerfs.map(t => t[perfKey]);
      const avg = avgArray(allVals);
      return {
        ...acc,
        [perfKey]: avg
      };

    }, { allTickers });

    return avgs;

  });

  console.log(
    JSON.stringify(listPerf, null, 2)
  );



  await jsonMgr.save(`./data/day-perfs/${dateStr}.json`, {
    numDays,
    closedOut: numDays === MAX_DAYS,
    listPerf
  });


}