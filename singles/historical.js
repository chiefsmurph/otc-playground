const puppeteer = require('puppeteer');
const getHistoricals = require('../scraping-actions/get-historicals');

const ticker = process.argv[2] || 'LEAS';
(async () => {
  
  const browser = await puppeteer.launch({ headless: true });

  const historicals = await getHistoricals(browser, ticker);
  console.log({ historicals})

  await browser.close();

  
})();