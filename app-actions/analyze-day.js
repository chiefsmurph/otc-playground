const puppeteer = require('puppeteer');
const { mapObject, chain } = require('underscore');

const generateDerived = require('./generate-derived');
const addHistoricals = require('../helpers/add-historicals');

const jsonMgr = require('../helpers/json-mgr');
const getTickers = require('../helpers/get-tickers');
const getTrend = require('../helpers/get-trend');
const { avg, sum } = require('../helpers/array-math');
const browserMapLimit = require('../helpers/browser-map-limit');

let historicalCache = {};
let tickerPerf = {};
let listPerf = {};


const IGNORE_TRIPS = true;

const { daysToAnalyze } = require('../config');

module.exports = async dateStr => {

  // generate derived
  const derived = await generateDerived(dateStr);

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
  const withHistoricals = await addHistoricals(uniqTicks.map(ticker => ({ symbol: ticker })));
  withHistoricals.forEach(record => {
    const { historicals, symbol } = record;
    if (historicals && historicals.length) {
      historicalCache[symbol] = historicals;
      // console.log({
      //   symbol,
      //   historicals
      // })
    } else {
      console.log('unable to get historicals for ', symbol);
    }
  });

  let numDays;
  // calc ticker performance
  const dateAsDate = new Date(dateStr);
  let foundFutureHistoricals = false;
  
  const missedHists = [];
  tickerPerf = mapObject(historicalCache, (historicals, key) => {

    // construct array of only historicals following dateStr
    const foundIndex = historicals.findIndex(hist => hist.date.getTime() <= dateAsDate.getTime());
    let followingDays = historicals.slice(0, foundIndex).reverse();
    followingDays = followingDays.slice(0, daysToAnalyze);
    console.log({ numDays, followingDays });


    numDays = Math.max(numDays || 0, followingDays.length);

    if (followingDays.length < numDays) {
      missedHists.push(key);
    }

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
    const allCloses = followingDays.map(day => getTrend(buyPrice, day.close));

    // important trends
    const trendToHigh = getTrend(buyPrice, max);
    const trendToLow = getTrend(buyPrice, low);
    const highMinusLow = trendToHigh - Math.abs(trendToLow);
    const trendToCloses = sum(allCloses);
    return {
      prices: {
        buyPrice,
        max,
        low,
        allCloses
      },
      perfs: {
        trendToHigh,
        trendToLow,
        highMinusLow,
        trendToCloses
      }
    };

  });

  if (!foundFutureHistoricals) {
    return console.log('Unable to find future historicals for any of these tickers.');
  }
  
  if (missedHists.length) {
    console.log('missed historicals...', missedHists);
  }

  await jsonMgr.save(`./data/ticker-perfs/${dateStr}.json`, tickerPerf);

  console.log(
    JSON.stringify(tickerPerf, null, 2)
  );
  
  const generateListPerf = (wlObj) => {
    // aggregate list performance
    listPerf = mapObject(wlObj, tickers => {

      return tickers
        .filter(ticker => Object.keys(historicalCache).includes(ticker))
        .filter(ticker => tickerPerf[ticker] && tickerPerf[ticker].prices)
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
        return {
          ...acc,
          [perfKey]: avg(allVals)
        };

      }, { allTickers });

      return avgs;

    });

    // console.log(
    //   JSON.stringify(listPerf, null, 2)
    // );

    return listPerf;

  };
  


  await jsonMgr.save(`./data/day-perfs/${dateStr}.json`, {
    numDays,
    closedOut: numDays === daysToAnalyze,
    listPerf: generateListPerf({
      ...dataTicks,
      ...derived
    })
  });


}