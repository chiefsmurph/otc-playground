const cTable = require('console.table');
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
  console.log({ keys })
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
    scanName,
    count,
    collectionStr,
    permuteKeys
  });

  const sliced = collectionStr === 'none' || collectionStr === null ? [] : await (async () => {
    const collectionFn = require(`../collections/${collectionStr}`);
    const records = await collectionFn(minPrice, maxPrice);
    console.log({ totalCount: records.length, sliced: sliced.length });
    return records.slice(0, count);
  });

  // scan ihub
  console.log('running scan...', rest);
  const todayDate = getDatestr();

  const scanFn = require(`../scans/${scanName}`);
  const hits = await scanFn(sliced, ...rest);
  // add to data/watch-lists
  console.table({hits});

  if (hits && hits.length) {

    const groupedByHit = {};
    hits.forEach(hit => {
      const { symbol } = hit;
      const hitKeys = Object.keys(hit).filter(key => key !== 'symbol');
      const hitSets = permuteKeys 
        ? Combinatorics.power(hitKeys).filter(arr => arr.length) 
        : hitKeys;
      
      hitSets.forEach(hitSet => {
        const prefixed = hitSet.map(key => `${scanName}-${key}`);
        const combinedHitSet = combineKeys(prefixed);
        groupedByHit[combinedHitSet] = [
          ...(groupedByHit[combinedHitSet] || []),
          symbol
        ];
      });
    });
  
    !skipSave && await jsonMgr.save(`./data/watch-lists/${todayDate}.json`, groupedByHit);
    
    console.log(JSON.stringify(groupedByHit));
  
    // send email
    await sendEmail(`${scanName.toUpperCase()} SCAN for ${todayDate}`, cTable.getTable(hits));
  
  }
  
  console.log('done scanning');
};