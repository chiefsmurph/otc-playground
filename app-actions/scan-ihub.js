const cTable = require('console.table');
const ihubScan = require('../scans/ihub');
const sendEmail = require('../helpers/send-email');
const getDatestr = require('../helpers/get-datestr');
const Combinatorics = require('js-combinatorics');
const jsonMgr = require('../helpers/json-mgr');

module.exports = async () => {

  // scan ihub

  const todayDate = getDatestr();
  const hits = await ihubScan(300);
  // add to data/watch-lists
  console.log(hits);

  const groupedByContains = {};
  hits.forEach(hit => {
    const { symbol } = hit;
    const containsKeys = Object.keys(hit).filter(key => key !== 'symbol');
    const hitSets = Combinatorics.power(containsKeys).filter(arr => arr.length);
    hitSets.forEach(hitSet => {
      const combinedHitSet = hitSet.join('-');
      groupedByContains[combinedHitSet] = [
        ...(groupedByContains[combinedHitSet] || []),
        symbol
      ];
    });
  });

  await jsonMgr.save(`./data/watch-lists/${todayDate}.json`, groupedByContains);
  
  console.log(JSON.stringify(groupedByContains));

  // send email
  await sendEmail(`IHUB SCAN for ${todayDate}`, cTable.getTable(hits));

};