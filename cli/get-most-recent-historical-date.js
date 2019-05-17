const { getHistoricals } = require('../scraping-actions/get-historicals');
const getDateStr = require('../helpers/get-datestr');

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

module.exports = async (ticker = 'KRFG') => {
  const hists = await getHistoricals(ticker);
  const mostRecent = hists[0];
  const date = mostRecent.date;
  const dateStr = getDateStr(addDays(date, 1));
  return dateStr;
};