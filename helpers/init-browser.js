const puppeteer = require('puppeteer');
const { proxy: proxyConfig } = require('../config');
const proxyChain = require('proxy-chain');

const getProxy = host => {
  const { username, password, hosts } = proxyConfig;
  host = host || hosts[Math.floor(hosts.length * Math.random())];
  return `http://${username}:${password}@${host}`;
};

const initBrowser = async () => {
  
  if (global.browser) {
    console.log('closing current browser');
    await browser.close();
  }
  const oldProxyUrl = getProxy();
  const newProxyUrl = await proxyChain.anonymizeProxy(oldProxyUrl);

  console.log({ oldProxyUrl, newProxyUrl })
  global.browser = await puppeteer.launch({ 
    headless: false, 
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox', 
      `--proxy-server=${newProxyUrl}`
    ],
    // args: ['--disable-dev-shm-usage']
  });
  
};

module.exports = initBrowser;