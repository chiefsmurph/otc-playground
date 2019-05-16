const { getHistoricals } = require('../scraping-actions/get-historicals');
const getDateStr = require('../helpers/get-datestr');

module.exports = async (ticker = 'AAPL') => {
  if (Math.random() > 0.8) {
    console.log('hit');
    return '33-333';
  }
  const hists = await getHistoricals(ticker);
  const mostRecent = hists[0];
  const dateStr = getDateStr(mostRecent.date);
  // console.log(dateStr);
  return dateStr;
};