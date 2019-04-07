const { flatten, values, uniq } = require('underscore');


const iHubUrls = {
  breakouts: 'https://investorshub.advfn.com/boards/breakoutboards.aspx',
  mostRead: 'https://investorshub.advfn.com/boards/most_read.aspx',
  mostPosted: 'https://investorshub.advfn.com/boards/most_post.aspx'
};


const scrapeStocks = async url => {
  page = await browser.newPage();
  try {
    await page.setUserAgent('Mozilla/5.0 (Linux; Android 8.0.0; Nexus 5 Build/LMY48B; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/43.0.2357.65 Mobile Safari/537.36');
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const data = await page.evaluate(tickerTdIndex => {
      const trs = Array.from(document.querySelectorAll('table tr[class^="dt"]')).slice(2);
      return trs.map(tr => ({
        symbol: tr.querySelector(`td:nth-child(${tickerTdIndex})`).textContent.trim(),
        boardUrl: tr.querySelector('td:nth-child(2) a').href
      }));
    }, url.includes('breakout') ? 6 : 5);
    return data.filter(stock => Boolean(stock.symbol) && Boolean(stock.boardUrl));
  } catch (e) {
    console.error(e);
  } finally {
    await page.close();
  }
};


module.exports = async () => {
  const scrapedStocks = {};
  for (let board of Object.keys(iHubUrls)) {
    const url = iHubUrls[board];
    scrapedStocks[board] = await scrapeStocks(url);
  }

  const flattened = uniq(flatten(values(scrapedStocks)), stock => stock.symbol);

  console.log(flattened.length);

  return flattened;
};