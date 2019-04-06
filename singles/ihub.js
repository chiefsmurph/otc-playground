const puppeteer = require('puppeteer');
const iHub = require('../scraping-actions/ihub');

const ticker = process.argv[2] || 'LEAS';
(async () => {
  
  await require('../helpers/init-browser')();

  const iHubData = await iHub(ticker);
  console.log({ iHubData})

  await browser.close();

  
})();