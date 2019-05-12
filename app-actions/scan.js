const cTable = require('console.table');
const ihubScan = require('../scans/ihub');
const sendEmail = require('../helpers/send-email');
const getDatestr = require('../helpers/get-datestr');
const Combinatorics = require('js-combinatorics');
const jsonMgr = require('../helpers/json-mgr');

const { lookups } = require('../scraping-actions/ihub');
const lookupKeys = lookups.map(lookup => lookup.key);
const combineKeys = keys => {
  const sorted = keys.sort((a, b) =>
    lookupKeys.indexOf(a) - lookupKeys.indexOf(b)
  );
  return sorted.join('-');
};

module.exports = async (scanName = 'ihub', permuteKeys = true, skipSave = false, ...rest) => {

  // scan ihub
  console.log('running scan...', rest);
  console.log({ scanName, permuteKeys });

  const todayDate = getDatestr();

  const scanFn = require(`../scans/${scanName}`);
  const hits = await scanFn(...rest);
  // add to data/watch-lists
  console.log(hits);

  const groupedByContains = {};
  hits.forEach(hit => {
    const { symbol } = hit;
    const containsKeys = Object.keys(hit).filter(key => key !== 'symbol');
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