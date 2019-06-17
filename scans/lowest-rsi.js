
const withCollection = require('../helpers/with-collection');
const { RSI } = require('technicalindicators');
const addHistoricals = require('../helpers/add-historicals');

const getCurrentRSI = record => {

  const closes = record.historicals.map(hist => hist.close).reverse();
  const rsiCalced = RSI.calculate({
    values: closes,
    period: 14
  });

  // strlog({
  //   closes,
  //   rsiCalced
  // });

  return rsiCalced[rsiCalced.length - 1];
};


module.exports = withCollection(async records => {
  console.log('total records:', records.length);
  const withHistoricals = await addHistoricals(records);

  const withRSI = withHistoricals.map(record => ({
    ...record,
    RSI: getCurrentRSI(record)
  }));

  // strlog(withRSI);

  const sorted = withRSI.sort((a, b) => a.RSI - b.RSI)
  console.log('lowest rsi', withRSI[0]);
  return sorted
    .filter(record => record.RSI < 30)
    .map(record => record.symbol);
  
});