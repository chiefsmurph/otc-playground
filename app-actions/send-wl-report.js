const watchlistPerf = require('./watch-list-perf');
const sendEmail = require('../helpers/send-email');
const mapLimit = require('promise-map-limit');

module.exports = async () => {
  const days = [1, 3, 6, 14];
  const output = await mapLimit(days, 1, async day => ({
    day,
    output: await watchlistPerf(day)
  }));
  const formatted = output
    .map(({ day, output }) => `<h2>NUMBER OF DAYS ... ${day}!</h2>${output}`)
    .join('\n\n<hr>');
  return sendEmail('WATCHLIST REPORT', formatted);
};