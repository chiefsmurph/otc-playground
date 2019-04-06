
const puppeteer = require('puppeteer');
const getMetrics = require('../scraping-actions/get-metrics');
const cTable = require('console.table');
const mapLimit = require('promise-map-limit');
const { pick } = require('underscore');
const getTickers = require('../helpers/get-tickers');

const input = `NSPX

crsm
ZMRK

`;


const tickers = getTickers(input);
console.log({ tickers });


(async () => {

    await require('../helpers/init-browser')();


    let allMetrics = await mapLimit(tickers, 3, async ticker => ({
        ticker,
        ...await getMetrics(ticker)
    }));

    allMetrics = allMetrics.map(record => 
        pick(record, ['ticker', 'price', 'percentChange', 'dollarVolume', 'float', 'turnover'])
    );
    
    console.table(allMetrics);


    await browser.close();

})();