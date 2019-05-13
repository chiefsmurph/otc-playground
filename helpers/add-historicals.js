const getHistoricals = require('../scraping-actions/get-historicals');
const browserMapLimit = require('../helpers/browser-map-limit');

module.exports = async records => {

  let i = 0;
  return browserMapLimit(records, 14, async record => {
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