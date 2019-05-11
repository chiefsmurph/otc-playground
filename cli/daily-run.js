const dailyRun = require('../app-actions/daily-run');
(async () => {
  
  // init
  await require('../helpers/init-browser')();

  await dailyRun();

  // un-init
  await browser.close();
})();