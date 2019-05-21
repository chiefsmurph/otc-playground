const watchlistPerf = require('./watch-list-perf');
const sendEmail = require('../helpers/send-email');
const mapLimit = require('promise-map-limit');

module.exports = async () => {
  const days = [1, 3, 6, 14];
  const output = await mapLimit(days, 1, async day => ({
    day,
    ...await watchlistPerf(day)
  }));
  const formatted = output
    .map(({ day, formatted, dates }) => [
      `<h1>NUMBER OF DAYS ... ${day}!!!</h1>`,
      `<h3>${dates.join(", ")}</h3>`,
      formatted
    ].join(''))
    .join('\n\n<hr>');
  return sendEmail('⭐ WATCHLIST REPORT ⭐', formatted, true);
};