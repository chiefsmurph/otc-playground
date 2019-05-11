const regCronIncAfterSixThirty = require('./helpers/reg-cron-after-630');
const dailyRun = require('./app-actions/daily-run');
const scanIhub = require('./app-actions/scan-ihub');

(async () => {

  // init
  await require('./helpers/init-browser')();


  // yarn daily
  regCronIncAfterSixThirty({
    name: 'yarn daily',
    run: [500],
    fn: dailyRun
  });

  setTimeout(scanIhub, 5000)


  // ihub scan
  regCronIncAfterSixThirty({
    name: 'ihub scan',
    run: [400],
    fn: scanIhub
  });

  console.log('otc-playground initialized!');
  console.log(regCronIncAfterSixThirty.toString());

})();

process.on('exit', async () => {
  // un-init
  await browser.close();
});