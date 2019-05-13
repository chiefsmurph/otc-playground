const cacheThis = require('../helpers/cache-this');

const DAYS_BACK = 3;

const lookupQueries = [
  'merger',
  'custodianship',
  'reinstatement',
  'big week'
];

const capitalized = str => str.charAt(0).toUpperCase() + str.slice(1);

const lookups = lookupQueries.map(query => ({
  query,
  key: `contains${query.split(' ').map(capitalized).join('')}`
}));

const getBoardUrl = async ticker => {
  
  // console.log('getting board url for ', ticker);
  let page;
  try {
    page = await browser.newPage();
    // await page.setUserAgent('Mozilla/5.0 (Linux; Android 8.0.0; Nexus 5 Build/LMY48B; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/43.0.2357.65 Mobile Safari/537.36');
    await page.goto(`https://investorshub.advfn.com/boards/getboards.aspx?searchstr=${ticker}`, { waitUntil: 'domcontentloaded' });
    await page.waitFor(3000);
    const rateLimited = await page.evaluate(() => {
      return document.body.textContent.includes('Rate limited.');
    });
  
    if (rateLimited) {
      console.log('rate limited');
      await page.waitFor(1000 * 15);
    }
  
    const boardUrl = await page.evaluate(() => {
      const firstBoard = document.querySelector('table table td:nth-child(2) a');
      return firstBoard.href;
    });
    
    return boardUrl;
  } finally {
    // console.log('page closing')
    page && await page.close();
  }
  
};


const scrapeIhub = async (ticker, boardUrl) => {

  let page, allText;
  try {
    boardUrl = boardUrl || await getBoardUrl(ticker);
    page = await browser.newPage();
    await page.goto(boardUrl, { waitUntil: 'domcontentloaded' });
    await page.waitFor(1000);
  } catch (e) {
    console.log(e);
    let bodyHTML = await page.evaluate(() => document.body.innerText);
    console.log(ticker, 'nope');
    console.log(bodyHTML);
    throw 'unable to find iHub board';
  } finally {
    if (page) {


      allText = await page.evaluate(daysBack => {
        const trs = Array.from(
          Array.from(
            document.querySelectorAll('table > tbody > tr > td > div > table tbody')
          )[2].querySelectorAll('tr')
        ).slice(1).slice(0, -1);
        const msIn90Days = 1000*60*60*24*daysBack;
        const onlyWithin90Days = trs.filter(tr => {
          const dateText = tr.querySelector('td:nth-child(4)').textContent;
          const msDiff = Date.now() - new Date(dateText).getTime();
          return msDiff < msIn90Days;
        });
        return onlyWithin90Days.reduce((acc, tr) => acc + tr.textContent, '');
      }, DAYS_BACK);

      await page.waitFor(1000 * 2);
      await page.close();

      return lookups.reduce((acc, { key, query }) => ({
        ...acc,
        [key]: allText.toLowerCase().includes(query.toLowerCase()),
      }), {});
    
    }
  }
  
};

module.exports = {
  lookupQueries,
  scrapeIhub: cacheThis(scrapeIhub, 60),
  lookups
};