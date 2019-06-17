

const number = require('../helpers/number');
const getTrend = require('../helpers/get-trend');
const cacheThis = require('../helpers/cache-this');
const request = require('request-promise');
const { mapObject } = require('underscore');
const { tiingo: { token }} = require('../config');

const getQuote = async (ticker) => {

  const requestOptions = {
    url: `https://api.tiingo.com/iex/${ticker}?token=${token}`,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const response = await request(requestOptions);
  const parsed = JSON.parse(response);

  console.log(`got quote for ${ticker}`);
  return parsed;

};

module.exports = getQuote

// {
//   getQuote,
//   cachedQuote: cacheThis(getQuote, 200)
// };