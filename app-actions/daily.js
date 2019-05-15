const analyzeWatchlists = require('./analyze-watchlists');
const sendWlReport = require('./send-wl-report');

module.exports = async () => {
  await analyzeWatchlists();
  await sendWlReport();
};