const { cachedHistoricals } = require('../scraping-actions/get-historicals');
const { RSI } = require('technicalindicators');
module.exports = async ticker => {

  const historicals = await cachedHistoricals(ticker);

  // strlog(historicals)

  const rsiCalced = RSI.calculate({
    values: historicals.map(hist => hist.close),
    period: 14
  });

  strlog({
    // historicals,
    rsiCalced
  })
};