const initBrowser = require('../helpers/init-browser');
const getHistoricals = require('../scraping-actions/get-historicals');
const ticker = process.argv[2] || 'LEAS';

module.exports = async ticker => {
  const historicals = await getHistoricals(ticker);
  console.log(historicals);
};