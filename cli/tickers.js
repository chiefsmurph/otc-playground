
const puppeteer = require('puppeteer');
const getMetrics = require('../actions/get-metrics');
const cTable = require('console.table');
const mapLimit = require('promise-map-limit');
const { pick } = require('underscore');

const input = `NSPX

crsm
ZMRK

`;


var regex = /\w{3,5}/gi;

var tickers = input.match(regex).map(t => t.toUpperCase());
console.log({ tickers });


(async () => {

    const browser = await puppeteer.launch({ headless: true });


    let allMetrics = await mapLimit(tickers, 3, async ticker => ({
        ticker,
        ...await getMetrics(browser, ticker)
    }));

    allMetrics = allMetrics.map(record => 
        pick(record, ['ticker', 'price', 'percentChange', 'dollarVolume', 'float', 'turnover'])
    );
    
    console.table(allMetrics);


    await browser.close();

})();