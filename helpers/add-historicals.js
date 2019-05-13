const mapLimit = require('promise-map-limit');
const getHistoricals = require('../scraping-actions/get-historicals');

module.exports = async records => {

  let i = 0;
  return mapLimit(records, 14, async record => {
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

};