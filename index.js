const daily = require('./app-actions/daily');
const onHistoricalChange = require('./helpers/on-historical-change');

(async () => {

  // init
  await require('./helpers/init-browser')();

  onHistoricalChange(daily);

  console.log('otc-playground initialized!');
  console.log(regCronIncAfterSixThirty.toString());

})();

process.on('exit', async () => {
  // un-init
  await browser.close();
});