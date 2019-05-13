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

module.exports = async (count = COUNT, collectionStr = 'all') => {
    console.log({
      count,
      collectionStr
    });
    
    const collectionFn = require(`../collections/${collectionStr}`);
    const records = await collectionFn(MIN_PRICE, MAX_PRICE);
    const sliced = records.slice(0, count);
    console.log('total of interest:', sliced.length);

    let i = 0;
    const withHistoricals = await mapLimit(sliced, 14, async record => {
        let historicals;
        try {
          historicals = await getHistoricals(record.symbol);
          console.log(`${++i}/${sliced.length}`);
          const recentHistorical = historicals[0];
          return {
            ...record,
            historicals,
            recentHistorical,
          };
        } catch (e) {
          console.log(e);
          console.log({ ticker, recentHistorical });
          return record;
        }
    });

    const withDayStreak = withHistoricals.map(record => ({
      ...pick(record, 'symbol'),
      dayStreak: record.historicals.findIndex(hist => hist.tso <= 0 && hist.tsc <= 0)
    }));

    console.log(withHistoricals)


    console.table(
      withDayStreak
          // .filter(record => record.bodyTrend > 0)
          .sort((a, b) => b.dayStreak - a.dayStreak)
    )

    return withDayStreak
      .filter(record => record.dayStreak >= 4)
      .map(record => ({
        symbol: record.symbol,
        [`${record.dayStreak}days`]: true
      }));

};