const regCronIncAfterSixThirty = require('./helpers/reg-cron-after-630');
const analyzeWatchlists = require('./app-actions/analyze-watchlists');
const runAllScans = require('./app-actions/run-all-scans');

(async () => {

  // init
  await require('./helpers/init-browser')();


  // yarn daily
  regCronIncAfterSixThirty({
    name: 'analyze watchlists',
    run: [400],
    fn: analyzeWatchlists
  });

  // scans

  // day-streaks scan
  regCronIncAfterSixThirty({
    name: 'scan time!',
    run: [450],
    fn: runAllScans
  });


  console.log('otc-playground initialized!');
  console.log(regCronIncAfterSixThirty.toString());

})();

process.on('exit', async () => {
  // un-init
  await browser.close();
});