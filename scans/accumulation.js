// lots of volume little price actions (green)



const puppeteer = require('puppeteer');
const request = require('request-promise');
const cTable = require('console.table');
const { pick } = require('underscore');
const mapLimit = require('promise-map-limit');

const getHistoricals = require('../scraping-actions/get-historicals');
const getTrend = require('../helpers/get-trend');


const MIN_PRICE = 0.0004;
const MAX_PRICE = 0.01;
const MIN_DOLLAR_VOLUME = 4000;
const MIN_TRADE_COUNT = 10;
const COUNT = 300;




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
            recentHistorical,
          };
        } catch (e) {
          console.log(e);
          console.log({ ticker, recentHistorical });
          return record;
        }
    });

    let withMetrics = withHistoricals
      .filter(record => record.recentHistorical && record.recentHistorical.open);

    console.log({
      withHistoricals,
      withMetricsCounts: withMetrics.length
    })
    withMetrics = withMetrics
      .map(record => {
        const { recentHistorical } = record;
        return {
          ...record,
          bodyTrend: getTrend(
            recentHistorical.open,
            recentHistorical.close
          ),
          wickSize: (
            getTrend(recentHistorical.close, recentHistorical.high) 
            + getTrend(recentHistorical.low, recentHistorical.open)
          )
        };
      });

    console.log('here')

    const withVolumeToChangeRatio = withMetrics.map(record => ({
      ...record,
      volumeToChangeRatio: record.recentHistorical.volumeRatio / record.bodyTrend
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
    const goodVol = smallWicks.filter(record => record.recentHistorical.volumeRatio > 35);

    console.table(
      goodVol
          .sort((a, b) => b.accumulationScore - a.accumulationScore)
    );

    const accBreakdowns = {
      infinity: score => score === Number.POSITIVE_INFINITY,
      gt300: score => score > 300 && score !== Number.POSITIVE_INFINITY,
      lt25: score => score < 25
    };



    return goodVol
      .map(record => ({
        symbol: record.symbol,
        ...Object.keys(accBreakdowns).filter(key => {
          const fn = accBreakdowns[key];
          return fn(record.accumulationScore);
        }).reduce((acc, key) => ({
          ...acc,
          [`acc-${key}`]: true
        }), {})
      }));

};