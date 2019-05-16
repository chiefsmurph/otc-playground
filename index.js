const regCronIncAfterSixThirty = require('./helpers/reg-cron-after-630');
const daily = require('./app-actions/daily');
const runAllScans = require('./app-actions/run-all-scans');
const onHistoricalChange = require('./helpers/on-historical-change');

(async () => {

  // init
  await require('./helpers/init-browser')();

  onHistoricalChange(async () => {
    console.log('new historicals posted!');
    await daily();
    await new Promise(resolve => setTimeout(resolve, 1000 * 60));
    await runAllScans();
  });

  console.log('otc-playground initialized!');
  console.log(regCronIncAfterSixThirty.toString());

})();

process.on('exit', async () => {
  // un-init
  await browser.close();
});