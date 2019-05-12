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

  // ihub scan
  regCronIncAfterSixThirty({
    name: 'ihub scan',
    run: [500],
    fn: () => scan('ihub')
  });

  // ihub scan
  regCronIncAfterSixThirty({
    name: 'accumulation scan',
    run: [750],
    fn: () => scan('accumulation')
  });


  console.log('otc-playground initialized!');
  console.log(regCronIncAfterSixThirty.toString());

})();

process.on('exit', async () => {
  // un-init
  await browser.close();
});