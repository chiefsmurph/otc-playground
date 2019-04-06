const getHistoricals = require('../scraping-actions/get-historicals');
const ticker = process.argv[2] || 'LEAS';

(async () => {

  const historicals = await getHistoricals(ticker);
  console.log({ historicals})

  await browser.close();
  
})();