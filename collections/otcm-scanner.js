// https://www.otcmarkets.com/research/stock-screener/api?penny=no&securityType=Common%20Stock,Preferred%20Stock&market=20,21,22,30&perf=0/2/0/40&pageSize=1000&volChgMin=40

const request = require('request-promise');
const { pick } = require('underscore');

module.exports = async (
  priceMin = 0.001,    // dubs
  priceMax = 0.0099
) => {
  console.log({
    priceMin,
    priceMax
  })
  const url = `https://www.otcmarkets.com/research/stock-screener/api?pageSize=10000&priceMin=${priceMin}&priceMax=${priceMax}`;
  const responseStr = JSON.parse(
    await request(url)
  );
  const { stocks } = JSON.parse(responseStr);

  return stocks.map(stock => 
    pick(stock, ['symbol', 'securityName', 'market', 'securityType', 'volume', 'volumeChange', 'caveatEmptor'])
  )
};