const alpha = require('alphavantage')({ key: 'FXIBM8WJJYN4KDFE' });

module.exports = async (ticker = 'AAPL') => {
  const response = await alpha.data.daily(ticker);
  const timeSeries = response['Time Series (Daily)'];
  
  .then(data => {
    console.log(data);
  })
};