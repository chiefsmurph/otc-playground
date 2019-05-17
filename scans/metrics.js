const getMetrics = require('../scraping-actions/get-metrics');
const browserMapLimit = require('../helpers/browser-map-limit');
const withCollection = require('../helpers/with-collection');

module.exports = withCollection(async records => {

  const withMetrics = (
    await browserMapLimit(records, 5, async record => ({
      ...record,
      ...await getMetrics(record.symbol)
    }))
  ).filter(record => record && record.price < 0.4);

  console.log(withMetrics.length, 'metricscount');
  const sortBy = {
    'lowest-float': (a, b) => a.float - b.float,
    'lowest-turnover': (a, b) => b.turnover - a.turnover,
    'highest-dollarVolume': (a, b) => b.dollarVolume - a.dollarVolume
  };

  return Object.keys(sortBy).reduce((acc, key) => {
    const sortFn = sortBy[key];
    const matchingTickers = [...withMetrics]
      .sort(sortFn)
      .slice(0, 2)
      .map(record => record.symbol);
    return [
      ...acc,
      ...matchingTickers.map(ticker => ({
        symbol: ticker,
        [key]: true
      }))
    ];
  }, []);
});