const initBrowser = require('../helpers/init-browser');
const getHistoricals = require('../scraping-actions/get-historicals');
const ticker = process.argv[2] || 'LEAS';

(async () => {
  await initBrowser();
  const historicals = await getHistoricals(ticker);
  console.log({ historicals})
  await browser.close();
})();