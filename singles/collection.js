const collectionStr = process.argv[2];
const collectionFn = require(`../collections/${collectionStr}`);

(async () => {

  const response = await collectionFn();
  console.log('found', response.length, 'stocks');
  console.log(response.map(t => t.symbol));

})();