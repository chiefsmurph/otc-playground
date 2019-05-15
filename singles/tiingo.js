var request = require('request-promise');
var requestOptions = {
  'url': 'https://api.tiingo.com/tiingo/daily/LEAS/prices?startDate=2018-1-1&token=91b3bdf8bb8904ee156a2a544cffaaa6dcceca70',
  // https://api.tiingo.com/api/test?token=91b3bdf8bb8904ee156a2a544cffaaa6dcceca70',
  'headers': {
    'Content-Type': 'application/json'
  }
};

module.exports = async () => {
  const response = await request(requestOptions);
  const parsed = JSON.parse(response);
}
 