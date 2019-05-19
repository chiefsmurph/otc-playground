const puppeteer = require('puppeteer');
const iHub = require('../scraping-actions/ihub');

const ticker = process.argv[2] || 'LEAS';



module.exports = async () => {

  const iHubData = await iHub(ticker);
  console.log({ iHubData})

};