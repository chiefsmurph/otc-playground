const request = require('request-promise');
const { pick } = require('underscore');

const MIN_PRICE = 0.001;
const MAX_PRICE = 0.0099;
const MIN_DOLLAR_VOLUME = 2000;
const MIN_TRADE_COUNT = 4;

module.exports = async (
  priceMin = MIN_PRICE,    // dubs
  priceMax = MAX_PRICE
) => {
  console.log('getting ACTIVE collection...');
  const response = JSON.parse(await request(`https://backend.otcmarkets.com/otcapi/market-data/active/current?tierGroup=ALL&page=1&pageSize=25000&sortOn=volume&priceMin=${priceMin}`));
  // console.table(response.records);


  const { records } = response;
  console.log('record count', records.length);
  const filtered = records
    .filter(r => r.price >= priceMin && r.price <= priceMax)
    .filter(r => r.dollarVolume >= MIN_DOLLAR_VOLUME)
    .filter(r => r.tradeCount >= MIN_TRADE_COUNT)
    .map(record =>
        pick(record, ['symbol', 'pctChange', 'price'])
    );
  console.log('filtered', filtered.length);
  return filtered;
}