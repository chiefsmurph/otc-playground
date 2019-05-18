const number = require('../helpers/number');
const { mapObject } = require('underscore');
const mapLimit = require('promise-map-limit');
const request = require('request-promise');
const cacheThis = require('../helpers/cache-this');

module.exports = cacheThis(async (ticker) => {
    const page = await browser.newPage();
    await page.goto(`https://www.otcmarkets.com/stock/${ticker}/security`, { waitUntil: 'networkidle2' });


    const data = JSON.parse(
        await request(`https://backend.otcmarkets.com/otcapi/stock/trade/inside/${ticker}?symbol=${ticker}`)
    );

    const { lastSale: price, percentChange, volume } = data;

    // console.log(data);


    const getValAndDate = async text => {
        try {
            const val = await page.evaluate((text) => 
                Array.from( document.querySelectorAll( 'div' ) ).filter( element => element.textContent === text )[0].parentNode.querySelector('div:nth-child(2)').textContent,
                text
            );
            const date = await page.evaluate(text => 
                Array.from( document.querySelectorAll( 'div' ) ).filter( element => element.textContent === text )[0].parentNode.querySelector('div:nth-child(3)').textContent,
                text
            );
            return { val, date };
        } catch (e) {
            console.log(e);
        }
    };

    const { val: floatVal, date: floatDate } = await getValAndDate('Float');

    const compareVals = await mapLimit([
        'Unrestricted',
        'Outstanding Shares',
        'Authorized Shares'
    ], 1, async text => ({
        text,
        ...await getValAndDate(text)
    }));

    const compareVal = compareVals.find(option => option.val !== 'Not Available');

    // console.log({compareVal})

    const float = compareVal 
        ? floatVal === 'Not Available' || new Date(floatDate).getTime() < new Date(compareVal.date).getTime() ? compareVal.val : floatVal
        : floatVal;

    // console.log(floatDate, unrestrictedDate)
    await page.close();

    return {
        ...mapObject({
            float,
            ...compareVals.reduce((acc, { text, val }) => ({
                ...acc,
                [text.split(' ')[0]]: val
            }), {}),
        }, number),

        price,
        percentChange,
        dollarVolume: Math.round(price * volume),
        turnover: Math.round(price * number(float))
    };;
}, 60 * 4);