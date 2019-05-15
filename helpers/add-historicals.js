const getHistoricals = require('../scraping-actions/get-historicals');
const mapLimit = require('promise-map-limit');

module.exports = async records => {

  let i = 0;
  return mapLimit(records, 3, async record => {

      await new Promise(resolve => setTimeout(resolve, Math.random() * 5000));
      let historicals;
      try {
        historicals = await getHistoricals(record.symbol);
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

};