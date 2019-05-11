const scanIhub = require('../app-actions/scan-ihub');
(async () => {
  
  // init
  await require('../helpers/init-browser')();

  await scanIhub();

  // un-init
  await browser.close();
})();