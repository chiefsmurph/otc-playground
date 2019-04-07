const initBrowser = require('../helpers/init-browser');

const collectionStr = process.argv[2];
const collectionFn = require(`../collections/${collectionStr}`);

(async () => {
  await initBrowser();
  const response = await collectionFn();
  console.log(response.map(t => t.symbol));
  console.log('total', response.length, 'stocks');
  await browser.close();
})();