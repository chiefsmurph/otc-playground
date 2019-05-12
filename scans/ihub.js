// lots of volume little price actions (green)



const cTable = require('console.table');
const { pick, omit } = require('underscore');
const mapLimit = require('promise-map-limit');

const { scrapeIhub } = require('../scraping-actions/ihub');

const MIN_PRICE = 0.0008;
const MAX_PRICE = 0.0019;
const COUNT = 300;

module.exports = async (count = COUNT, collectionStr = 'all') => {

    console.log({
      count,
      collectionStr
    });

    const collectionFn = require(`../collections/${collectionStr}`);
    const records = await collectionFn(MIN_PRICE, MAX_PRICE);
    const sliced = records.slice(0, count);
    console.log('total records', records.length);
    console.log('of interest', sliced.length);
    const tickers = sliced.map(t => t.symbol);
    console.log(tickers);

    let i = 0;
    const withHits = await mapLimit(sliced, 1, async record => {
      const { symbol, boardUrl } = record;
      let iHubData, hit;
      try {
        iHubData = await scrapeIhub(symbol, boardUrl);
        const hits = Object.keys(iHubData).filter(key => iHubData[key]);
        hit = hits.length;
        const hitStr = hit ? hits.join('/') : '';
        console.log([`${++i}/${sliced.length}`, symbol, hitStr].filter(Boolean).join(' - '));
      } catch (e) {
        console.log([`${++i}/${sliced.length}`, symbol, e].filter(Boolean).join(' - '));
      }
      await new Promise(res => setTimeout(res, 500));
      return {
        symbol,
        hit,
        ...iHubData
      };
    });

    const onlyHits = withHits
      .filter(obj => obj.hit)
      .map(obj => 
        omit(obj, (val, key) => key === 'hit' || !val)
      );

    console.table(onlyHits);


    return {
      tickers,

    };

};