const { getHistoricals } = require('../scraping-actions/get-historicals');
const getDateStr = require('../helpers/get-datestr');

module.exports = async (ticker = 'AAPL') => {
  const hists = await getHistoricals(ticker);
  const mostRecent = hists[0];
  const dateStr = getDateStr(mostRecent.date);
  // console.log(dateStr);
  return dateStr;
};