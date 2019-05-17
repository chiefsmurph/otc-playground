// lots of volume little price actions (green)



const cTable = require('console.table');
const { omit } = require('underscore');
const browserMapLimit = require('../helpers/browser-map-limit');

const { scrapeIhub } = require('../scraping-actions/ihub');
const withCollection = require('../helpers/with-collection');

module.exports = withCollection(async records => {
    
    console.log('total records', records.length);
    const tickers = records.map(t => t.symbol);
    console.log(tickers);

    let i = 0;
    const withHits = await browserMapLimit(records, 1, async record => {
      const { symbol, boardUrl } = record;
      let iHubData, hit;
      try {
        iHubData = await scrapeIhub(symbol, boardUrl);
        const hits = Object.keys(iHubData).filter(key => iHubData[key]);
        hit = hits.length;
        const hitStr = hit ? hits.join('/') : '';
        console.log([`${++i}/${records.length}`, symbol, hitStr].filter(Boolean).join(' - '));
      } catch (e) {
        console.log([`${++i}/${records.length}`, symbol, e].filter(Boolean).join(' - '));
      }
      await new Promise(res => setTimeout(res, 3000));
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


    return onlyHits;

});