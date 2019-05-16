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
      const tweets = Array.from(document.querySelectorAll('.tweet:not(.user-pinned)'));
      return tweets.map(node => ({
        timestamp: node.querySelector('.js-short-timestamp').textContent,
        text: node.querySelector('.tweet-text').textContent
      }));
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

  let page, allText, errored;
  try {
    boardUrl = boardUrl || await getBoardUrl(ticker);
    page = await browser.newPage();
    await page.goto(boardUrl, { waitUntil: 'domcontentloaded' });
    await page.waitFor(1000);
  } catch (e) {
    console.log(e);
    errored = true;
    console.log(ticker, 'nope');
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

      const response = lookups.reduce((acc, { key, query }) => ({
        ...acc,
        [key]: allText.toLowerCase().includes(query.toLowerCase()),
      }), {});

      if (errored && allText && allText.length > 4) {
        console.log('interesting save', {
          ticker, 
          allText,
          response
        });
      }
      await page.waitFor(1000 * 2);
      await page.close();

      return response;
    
    }
  }
  
};

module.exports = {
  lookupQueries,
  scrapeIhub: cacheThis(scrapeIhub, 60),
  lookups
};