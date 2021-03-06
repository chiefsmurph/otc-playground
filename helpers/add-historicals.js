const { cachedHistoricals } = require('../scraping-actions/get-historicals');
const mapLimit = require('promise-map-limit');

module.exports = async records => {

  let i = 0;
  const results = await mapLimit(records, 3, async record => {

      let historicals;
      try {
        historicals = await cachedHistoricals(record.symbol);
        console.log(`${++i}/${records.length}`);
        return {
          ...record,
          historicals,
        };
      } catch (e) {
        console.log(e);
        console.log({ ticker: record.symbol, historicals });
        return record;
      }
  });
  
  return results.filter(result => result && result.historicals && result.historicals.length);

};