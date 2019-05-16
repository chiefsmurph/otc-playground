const cTable = require('console.table');
const sendEmail = require('../helpers/send-email');
const getDatestr = require('../helpers/get-datestr');
const Combinatorics = require('js-combinatorics');
const updateWl = require('../helpers/update-wl');

const analyzeScanResponse = (scanName, response, permuteKeys) => {
  console.log('analyzeing')
  let emailRecords = [...response];
  if (typeof emailRecords[0] === 'string') {
    // array of strings
    emailRecords = emailRecords.map(symbol => ({
      symbol,
      [scanName]: true
    }))
  } else {
    // array of objects { symbol: 'string', accumulation-blah: true }
    emailRecords = [
      ...new Set(emailRecords.map(hit => hit.symbol))
    ].map(symbol => {
      const filtered = emailRecords.filter(hit => hit.symbol === symbol);
      console.log({
        symbol,
         filtered
      })
      return filtered.reduce((acc, hit) => ({
        ...acc,
        ...hit
      }), {});
    }).sort((a, b) => Object.keys(b).length - Object.keys(a).length);
  }
  
  const groupedByHit = {};
  emailRecords.forEach(hit => {
    const { symbol } = hit;
    const hitKeys = Object.keys(hit).filter(key => key !== 'symbol');
    const hitSets = permuteKeys 
      ? Combinatorics.power(hitKeys).filter(arr => arr.length) 
      : hitKeys;
    
    hitSets.forEach(hitSet => {
      const prefixed = `${scanName}-${hitSet.join('-')}`;
      groupedByHit[prefixed] = [
        ...(groupedByHit[prefixed] || []),
        symbol
      ];
    });
  });

  return {
    emailRecords,
    groupedByHit
  };

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
  const response = await scanFn(count, ...rest);
  // add to data/watch-lists
  console.log({response, responsel: response.length})
  if (response && response.length) {

    const {
      emailRecords,
      groupedByHit
    } = analyzeScanResponse(scanName, response, permuteKeys);
    !skipSave && await updateWl(todayDate, groupedByHit);
    console.log(JSON.stringify({
      emailRecords,
      groupedByHit
    }. null, 2));
  
    // send email
    await sendEmail(`${scanName.toUpperCase()} SCAN for ${todayDate}`, [
      cTable.getTable(emailRecords),
      '<br><br><hr>',
      JSON.stringify(groupedByHit, null, 2)
    ].join(''));
  
  }
  
  console.log('done scanning');
};