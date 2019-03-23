const puppeteer = require('puppeteer');
const iHub = require('../scraping-actions/ihub');

const ticker = process.argv[2] || 'LEAS';
(async () => {
  
  const browser = await puppeteer.launch({ headless: true });

  const iHubData = await iHub(browser, ticker);
  console.log({ iHubData})

  await browser.close();

  
})();