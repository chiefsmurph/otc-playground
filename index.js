// const daily = require('./app-actions/daily');
const onHistoricalChange = require('./helpers/on-historical-change');
const analyzeWatchlists = require('./app-actions/analyze-watchlists');

(async () => {

  // init
  await require('./helpers/init-browser')();
  onHistoricalChange(analyzeWatchlists);
  console.log('otc-playground initialized!');

})();

process.on('exit', async () => {
  // un-init
  await browser.close();
});