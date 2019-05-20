const scan = require('./scan');
const allScans = [
  'twitter',
  'stock-invest',
  'finviz',
  'barchart',
  'day-streaks',
  'accumulation',
  ['accumulation', 'advancers'],
  'green-volume',
  'ihub',
  'metrics',
  ['metrics', 'advancers']
];
module.exports = async (
  scansToRun = allScans,
  count
) => {
  console.log({ scansToRun });
  for (let scanName of scansToRun) {
    console.log('starting scan...', scanName);
    const args = Array.isArray(scanName) ? [
      scanName[0],
      count,
      undefined,
      undefined,
      ...scanName.slice(1)
    ] : [scanName, count];
    await scan(...args);
    console.log('finished scan...', scanName);
  }
};