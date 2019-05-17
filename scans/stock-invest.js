const request = require('request-promise');
const { stockinvestapi } = require('../config');

module.exports = async () => {
  const urls = {
      top100: stockinvestapi.topBuy || 'https://stockinvest.us/list/buy/top100',
      undervalued: stockinvestapi.undervalued || 'https://stockinvest.us/list/undervalued'
  };
  const response = [];
  for (let name of Object.keys(urls)) {
      const results = JSON.parse(await request(urls[name]));
      const filtered = results.filter(b => b.price < 10);
      const cheapest = [...filtered].sort((a, b) => a.price - b.price);
      const getFirst2ticks = arr => arr.slice(0, 2).map(t => t.tick);
      const uniq = [
          ...new Set(
              [
                  ...getFirst2ticks(filtered),
                  ...getFirst2ticks(cheapest)
              ]
          )
      ];
      uniq.forEach(ticker => {
        response.push({
          symbol: ticker,
          [name]: true
        });
      });
  }
  return response;
}