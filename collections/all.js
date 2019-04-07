const { flatten, uniq, values } = require('underscore');

const MIN_PRICE = 0.001;
const MAX_PRICE = 0.0099;

module.exports = async (
  priceMin = MIN_PRICE,    // dubs
  priceMax = MAX_PRICE
) => {

  // console.log(await iHubHot());
  const collections = {
    iHubHot: require('./ihub-hot'),
    active: require('./active'),
    advancers: require('./advancers'),
    decliners: require('./decliners'),
    otcmScanner: require('./otcm-scanner')
  };

  const all = {};
  for (let [key, collectionFn] of Object.entries(collections)) {
    all[key] = await collectionFn(priceMin, priceMax);
  }

  for (let [key, stocks] of Object.entries(all)) {
    console.log(`${key} - ${stocks.length} stocks`);
    // console.log(key, stocks);
  }

  const flattened = flatten(values(all));
  const allUniq = uniq(flattened, stock => stock.symbol);
  console.log('flattened', flattened.length);
  console.log('allUniq', allUniq.length);
  // console.log(JSON.stringify({all}, null, 2));
  return allUniq;

};