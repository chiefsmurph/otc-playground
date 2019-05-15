const getTickers = require('../helpers/get-tickers');

module.exports = async username => {
  const page = await browser.newPage();
  await page.goto(`https://twitter.com/${username}`, { waitUntil: 'domcontentloaded' });
  const data = await page.evaluate(() => {
    const tweets = Array.from(document.querySelectorAll('.tweet:not(.user-pinned)'));
    return tweets.map(node => ({
      timestamp: node.querySelector('.js-short-timestamp').textContent,
      text: node.querySelector('.tweet-text').textContent
    }));
  });
  const withTickers = data.map(tweet => ({
    ...tweet,
    tickers: getTickers(tweet.text, true)
  }));
  const filtered = withTickers.filter(tweet => tweet.timestamp.includes('h') || tweet.timestamp.includes('m'));
  const onlyTickers = filtered
    .filter(tweet => tweet.tickers.length <= 3)
    .reduce((acc, tweet) => [...acc, ...tweet.tickers], []);
  const uniqTickers = [
    ...new Set(
      onlyTickers.filter(ticker => onlyTickers.filter(t => t === ticker).length > 1)
    )
  ];

  return uniqTickers.map(symbol => ({ 
    symbol,
    [username]: true
  }));
};