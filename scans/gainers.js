const puppeteer = require('puppeteer');
const request = require('request-promise');
const cTable = require('console.table');
const { pick } = require('underscore');
const mapLimit = require('promise-map-limit');

const getMetrics = require('../actions/get-metrics');



const MIN_PRICE = 0.0004;
const MIN_DOLLAR_VOLUME = 12000;
const MIN_TRADE_COUNT = 20;
const COUNT = 55;



(async () => {


    const browser = await puppeteer.launch({ headless: false });

    const response = JSON.parse(await request(`https://backend.otcmarkets.com/otcapi/market-data/advancers/current?tierGroup=ALL&page=1&pageSize=1000&priceMin=${MIN_PRICE}`));
    
    console.table(response.records);

    // response.records.forEach(({ symbol, pctChange, tradeCount, dollarVolume }) => {
    //     console.log(pctChange, symbol, tradeCount, dollarVolume);
    // });

    const records = response.records.map(record =>
        pick(record, ['symbol', 'pctChange', 'price', 'tradeCount', 'dollarVolume'])
    );
    const filtered = records.filter(record => record.tradeCount >= MIN_TRADE_COUNT && record.dollarVolume >= MIN_DOLLAR_VOLUME).slice(0, COUNT);
    
    console.log('total of interest:', filtered.length);

    let i = 0;
    const withMetrics = await mapLimit(filtered, 2, async record => {
        let metrics;
        try {
            metrics = await getMetrics(browser, record.symbol);
            console.log(`${++i}/${filtered.length}`);
        } catch (e) {
            console.log(e)
        }
        return {
            ...record,
            ...pick(metrics, ['tradeCount', 'dollarVolume', 'float', 'Unrestricted', 'Outstanding', 'Authorized', 'turnover'])
        };
    });

    const withPercOfTurnover = withMetrics.map(record => ({
        ...record,
        percOfTurnover: Math.round(record.dollarVolume / record.turnover * 100) + '%'
    }));

    const withTier = withPercOfTurnover.map(record => ({
        ...record,
        tier: response.records.find(r => r.symbol === record.symbol).tierName
    }))

    console.table(
        withTier
            .filter(r => r.float)
            .sort((a, b) => a.turnover - b.turnover)
    )

    console.log(
        JSON.stringify(
            withTier,
            null,
            2
        )
    )


    await browser.close();
})();