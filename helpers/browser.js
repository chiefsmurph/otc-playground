const puppeteer = require('puppeteer');
const { proxy: proxyConfig } = require('../config');
const proxyChain = require('proxy-chain');

const getProxy = host => {
  const { username, password, hosts } = proxyConfig;
  host = host || hosts[Math.floor(hosts.length * Math.random())];
  return `http://${username}:${password}@${host}`;
};

let curProxyUrl;

class Browser {
  async init() {
    if (global.browser) {
      await this.close();
    }
    const oldProxyUrl = getProxy();
    curProxyUrl = oldProxyUrl;
    const newProxyUrl = await proxyChain.anonymizeProxy(oldProxyUrl);
  
    console.log({ oldProxyUrl, newProxyUrl })
    global.browser = await puppeteer.launch({ 
      headless: true, 
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox', 
        `--proxy-server=${newProxyUrl}`
      ],
      // args: ['--disable-dev-shm-usage']
    });
  }
  async close() {
    console.log('closing current browser');
    await browser.close();
    console.log('closing current anonymized proxy', curProxyUrl);
    await proxyChain.closeAnonymizedProxy(curProxyUrl);
  }
}

module.exports = new Browser();