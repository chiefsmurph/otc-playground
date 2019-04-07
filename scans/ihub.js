// lots of volume little price actions (green)



const cTable = require('console.table');
const { pick, omit } = require('underscore');
const mapLimit = require('promise-map-limit');

const iHub = require('../scraping-actions/ihub');

const MIN_PRICE = 0.0008;
const MAX_PRICE = 0.0019;
const COUNT = 700;

const collectionStr = process.argv[2] || 'all';
const collectionFn = require(`../collections/${collectionStr}`);


(async () => {

    await require('../helpers/init-browser')();
    
    const records = await collectionFn(MIN_PRICE, MAX_PRICE);
    const sliced = records.slice(0, COUNT);
    console.log('total records', records.length);
    console.log('of interest', sliced.length);
    console.log(sliced.map(t => t.symbol));

    let i = 0;
    const withHits = await mapLimit(sliced, 5, async record => {
      const { symbol, boardUrl } = record;
      let iHubData, hit;
      try {
        iHubData = await iHub(symbol, boardUrl);
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
    await browser.close();
})();