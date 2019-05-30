const scan = require('./scan');
const allScans = [
  'twitter',
  // 'stock-invest',
  'finviz',
  'barchart',
  'day-streaks',
  'accumulation',
  ['accumulation', 'advancers'],
  ['accumulation', 'ihub-hot'],
  'green-volume',
  ['ihub', 'all', 100],
  ['ihub', 'decliners', 30],
  ['ihub', 'ihub-hot', 100],
  ['metrics', 'active'],
  ['metrics', 'advancers'],
  ['metrics', 'decliners'],
  ['metrics', 'ihub-hot'],
];
module.exports = async (
  scansToRun = allScans,
  count,
  startAt = 0
) => {
  console.log({ scansToRun: scansToRun.slice(startAt), startAt });
  for (let scanToRun of scansToRun.slice(startAt)) {
    console.log('starting scan...', scanToRun);
    const args = (() => {
      if (Array.isArray(scanToRun)) {
        const [scanName, collection, countOverwrite] = scanToRun;
        return [
          scanName,
          countOverwrite || count,
          undefined,
          undefined,
          collection
        ];
      } else {
        return [scanToRun, count];
      }
    })();
    await scan(...args);
    console.log('finished scan...', scanToRun);
  }
};