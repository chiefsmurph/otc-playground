const puppeteer = require('puppeteer');
const getHistoricals = require('../scraping-actions/get-historicals');


(async () => {
  
  const browser = await puppeteer.launch({ headless: true });

  const historicals = await getHistoricals(browser, 'LEAS');
  console.log({ historicals})

  await browser.close();

  
})();