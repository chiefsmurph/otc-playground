const puppeteer = require('puppeteer');

module.exports = async () => {
  global.browser = await puppeteer.launch({ 
    headless: true, 
    // args: ['--disable-dev-shm-usage']
  });
};