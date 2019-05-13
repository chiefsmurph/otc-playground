const puppeteer = require('puppeteer');
const { mapObject, chain } = require('underscore');

const getHistoricals = require('../scraping-actions/get-historicals');

const jsonMgr = require('../helpers/json-mgr');
const getTickers = require('../helpers/get-tickers');
const getTrend = require('../helpers/get-trend');
const { avgArray } = require('../helpers/array-math');
const browserMapLimit = require('../helpers/browser-map-limit');

let historicalCache = {};
let tickerPerf = {};
let listPerf = {};


const IGNORE_TRIPS = true;

const { daysToAnalyze } = require('../config');

module.exports = async dateStr => {


  // load watch list data and get uniq ticks
  const data = require(`../data/watch-lists/${dateStr}`);
  const dataTicks = mapObject(data, val => getTickers(val));
  // console.log({ dataTicks})
  const uniqTicks = chain(dataTicks)
    .values()
    .flatten()
    .uniq()
    .value();
    

  // get all historical data
  await browserMapLimit(uniqTicks, 3, async ticker => {
    const hists = await getHistoricals(ticker);
    if (hists && hists.length) {
      historicalCache[ticker] = hists;
    } else {
      console.log('unable to get historicals for ', ticker);
    }
  });


  let numDays;
  // calc ticker performance
  const dateAsDate = new Date(dateStr);
  let foundFutureHistoricals = false;
  
  tickerPerf = mapObject(historicalCache, (historicals, key) => {

    // construct array of only historicals following dateStr
    const foundIndex = historicals.findIndex(hist => hist.date.getTime() <= dateAsDate.getTime());
    let followingDays = historicals.slice(0, foundIndex).reverse();
    followingDays = followingDays.slice(0, daysToAnalyze);
    numDays = numDays || followingDays.length;

    foundFutureHistoricals = foundFutureHistoricals || !!followingDays.length;
    if (!followingDays.length) {
      console.log('unable to find future hists for ', key);
      return null;
    }

    // console.log({
    //   key,
    //   historicals,
    //   foundIndex,
    //   followingDays
    // })
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

  if (!foundFutureHistoricals) {
    return console.log('Unable to find future historicals for any of these tickers.');
  }
  


  // console.log(
  //   JSON.stringify(tickerPerf, null, 2)
  // );

  // aggregate list performance
  listPerf = mapObject(dataTicks, tickers => {

    return tickers
      .filter(ticker => Object.keys(historicalCache).includes(ticker))
      .filter(ticker => !IGNORE_TRIPS || tickerPerf[ticker].prices.buyPrice >= .001)
      .map(ticker => ({
        ticker,
        ...tickerPerf[ticker].perfs
      }));

  });


  console.log(
    `--------`
  );


  console.log(
    JSON.stringify(listPerf, null, 2)
  );

  Object.keys(listPerf).forEach(key => {
    const val = listPerf[key];
    if (!val || !val.length) {
      console.log('deleting ', key);
      delete listPerf[key];
    }
  });
  
  listPerf = mapObject(listPerf, tickerPerfs => {

    const allPerfs = Object.keys(tickerPerfs[0]).slice(1);
    // console.log({ allPerfs, tickerPerfs });
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

  // console.log(
  //   JSON.stringify(listPerf, null, 2)
  // );



  await jsonMgr.save(`./data/day-perfs/${dateStr}.json`, {
    numDays,
    closedOut: numDays === daysToAnalyze,
    listPerf
  });


}