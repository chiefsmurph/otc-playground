const cTable = require('console.table');
const sendEmail = require('../helpers/send-email');
const getDatestr = require('../helpers/get-datestr');
const Combinatorics = require('js-combinatorics');
const updateWl = require('../helpers/update-wl');

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

  if (hits && hits.length) {

    const groupedByHit = {};

    const combinedBySymbol = [
      ...new Set(hits.map(hit => hit.symbol))
    ].map(symbol => {
      const filtered = hits.filter(hit => hit.symbol === symbol);
      console.log(symbol, filtered);
      return filtered.reduce((acc, hit) => ({
        ...acc,
        ...hit
      }), {});
    }).sort((a, b) => Object.keys(b).length - Object.keys(a).length);
    
    combinedBySymbol.forEach(hit => {
      const { symbol } = hit;
      const hitKeys = Object.keys(hit).filter(key => key !== 'symbol');
      const hitSets = permuteKeys 
        ? Combinatorics.power(hitKeys).filter(arr => arr.length) 
        : hitKeys;
      
      hitSets.forEach(hitSet => {
        console.log({ hitSet });
        const prefixed = `${scanName}-${hitSet.join('-')}`;
        groupedByHit[prefixed] = [
          ...(groupedByHit[prefixed] || []),
          symbol
        ];
      });
    });
  
    !skipSave && await updateWl(todayDate, groupedByHit);

    console.log(JSON.stringify(groupedByHit));
  
    // send email
    await sendEmail(`${scanName.toUpperCase()} SCAN for ${todayDate}`, cTable.getTable(combinedBySymbol));
  
  }
  
  console.log('done scanning');
};