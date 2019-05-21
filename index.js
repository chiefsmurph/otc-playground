// const daily = require('./app-actions/daily');
const onHistoricalChange = require('./helpers/on-historical-change');
const daily = require('./app-actions/daily');
const sendEmail = require('./helpers/send-email');

(async () => {

  // init
  await require('./helpers/browser').init();
  onHistoricalChange(async curDateStr => {
    await sendEmail(`new historicals for ${curDateStr}!`, 'new historicals posted!');
    await daily();
  });
  console.log('otc-playground initialized!');

})();

process.on('exit', async () => {
  // un-init
  await require('./helpers/browser').close();
});