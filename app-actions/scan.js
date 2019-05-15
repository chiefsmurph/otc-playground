const cTable = require('console.table');
const sendEmail = require('../helpers/send-email');
const getDatestr = require('../helpers/get-datestr');
const Combinatorics = require('js-combinatorics');
const updateWl = require('../helpers/update-wl');



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
  count,
  permuteKeys = true, 
  skipSave = false, 
  ...rest
) => {

  // fetch collection of stocks
  console.log({
    scanName,
    permuteKeys
  });
  
  // scan ihub
  console.log('running scan...', rest);
  const todayDate = getDatestr();

  const scanFn = require(`../scans/${scanName}`);
  const hits = await scanFn(count, ...rest);
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
  
    !skipSave && await updateWl(todayDate, groupedByHit);

    console.log(JSON.stringify(groupedByHit));
  
    // send email
    await sendEmail(`${scanName.toUpperCase()} SCAN for ${todayDate}`, cTable.getTable(hits));
  
  }
  
  console.log('done scanning');
};