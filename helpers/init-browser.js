const puppeteer = require('puppeteer');

module.exports = async () => {
  global.browser = await puppeteer.launch({ 
    headless: true, 
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    // args: ['--disable-dev-shm-usage']
  });
};