const analyzeWatchlists = require('./analyze-watchlists');
const sendWlReport = require('./send-wl-report');
const runAllScans = require('./run-all-scans');
const sendRecs = require('./send-recs');

module.exports = async () => {
  await analyzeWatchlists();
  await sendWlReport(true);
  
  await new Promise(resolve => setTimeout(resolve, 1000 * 10));
  await runAllScans();
  await sendRecs(true);
};