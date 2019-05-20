const queries = {
  topStocks: 'https://www.barchart.com/stocks/signals/top-bottom/top',
  signalStrength: 'https://www.barchart.com/stocks/signals/direction-strength',
  signalDirection: 'https://www.barchart.com/stocks/signals/direction',
  upgrades: 'https://www.barchart.com/stocks/signals/upgrades'
};

const scrapeBarchartTickers = async url => {
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitFor(2000);
    const results = await page.evaluate(() => {
      const getText = q => Array.from(document.querySelectorAll(q)).slice(1, -1).map(node => node.textContent.trim());
      const symbols = getText('.symbol');
      const prices = getText('.lastPrice');
      return symbols.map((symbol, index) => ({
        symbol,
        price: Number(prices[index])
      }));
    });
    await page.close();
    console.log(results)
    return results.sort((a, b) => b.price - a.price).slice(0, 2).map(result => result.symbol);
  } catch (e) {
    return [];
  }
}

module.exports = async () => {

  let response = [];
  for (let key of Object.keys(queries)) {
    const url = queries[key];
    console.log(key, 'scraping', url);
    const symbols = await scrapeBarchartTickers(url);
    console.log({ symbols })
    response = [
      ...response,
      ...symbols
        .map(symbol => ({
          symbol,
          [key]: true
        }))
    ];
    console.log('done');
  }
  return response;
  
};