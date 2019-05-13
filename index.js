const regCronIncAfterSixThirty = require('./helpers/reg-cron-after-630');
const analyzeWatchlists = require('./app-actions/analyze-watchlists');
const scan = require('./app-actions/scan');

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
    name: 'day-streaks scan',
    run: [450],
    fn: () => scan('day-streaks')
  });
    
  // accumulation scan
  regCronIncAfterSixThirty({
    name: 'accumulation scan',
    run: [500],
    fn: () => scan('accumulation')
  });

  // ihub scan
  regCronIncAfterSixThirty({
    name: 'ihub scan',
    run: [600],
    fn: () => scan('ihub')
  });


  console.log('otc-playground initialized!');
  console.log(regCronIncAfterSixThirty.toString());

})();

process.on('exit', async () => {
  // un-init
  await browser.close();
});