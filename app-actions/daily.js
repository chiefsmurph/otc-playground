const analyzeWatchlists = require('./analyze-watchlists');
const sendWlReport = require('./send-wl-report');
const runAllScans = require('./app-actions/run-all-scans');

module.exports = async () => {
  await analyzeWatchlists();
  await sendWlReport();
  
  await new Promise(resolve => setTimeout(resolve, 1000 * 60));
  await runAllScans();
};