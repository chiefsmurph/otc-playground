const cTable = require('console.table');
const ihubScan = require('../scans/ihub');
const sendEmail = require('../helpers/send-email');
const getDatestr = require('../helpers/get-datestr');
const Combinatorics = require('js-combinatorics');
const jsonMgr = require('../helpers/json-mgr');

// defaults
const COUNT = 300;
const MIN_PRICE = 0.0004;
const MAX_PRICE = 0.013;

// helpers
const { lookups } = require('../scraping-actions/ihub');
const lookupKeys = lookups.map(lookup => lookup.key);
const combineKeys = keys => {
  const sorted = keys.sort((a, b) =>
    lookupKeys.indexOf(a) - lookupKeys.indexOf(b)
  );
  return sorted.join('-');
};

module.exports = async (
  scanName = 'ihub', 
  count = COUNT,
  collectionStr = 'all',
  minPrice = MIN_PRICE,
  maxPrice = MAX_PRICE,
  permuteKeys = true, 
  skipSave = false, 
  ...rest
) => {

  // fetch collection of stocks
  console.log({
    count,
    collectionStr
  });

  const collectionFn = require(`../collections/${collectionStr}`);
  const records = await collectionFn(minPrice, maxPrice);
  const sliced = records.slice(0, count);

  // scan ihub
  console.log('running scan...', rest);
  console.log({ scanName, permuteKeys, totalCount: records.length, sliced: sliced.length });

  const todayDate = getDatestr();

  const scanFn = require(`../scans/${scanName}`);
  const hits = await scanFn(sliced, ...rest);
  // add to data/watch-lists
  console.log(hits);

  const groupedByContains = {};
  hits.forEach(hit => {
    const { symbol } = hit;
    const containsKeys = Object.keys(hit).filter(key => key !== 'symbol').map(key => `${scanName}-${key}`);
    const hitSets = permuteKeys 
      ? Combinatorics.power(containsKeys).filter(arr => arr.length) 
      : containsKeys;
    hitSets.forEach(hitSet => {
      const combinedHitSet = combineKeys(hitSet);
      groupedByContains[combinedHitSet] = [
        ...(groupedByContains[combinedHitSet] || []),
        symbol
      ];
    });
  });

  !skipSave && await jsonMgr.save(`./data/watch-lists/${todayDate}.json`, groupedByContains);
  
  console.log(JSON.stringify(groupedByContains));

  // send email
  await sendEmail(`${scanName.toUpperCase()} SCAN for ${todayDate}`, cTable.getTable(hits));

};