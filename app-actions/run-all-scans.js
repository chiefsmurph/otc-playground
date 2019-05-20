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
  count,
  startAt = 0
) => {
  console.log({ scansToRun: scansToRun.slice(startAt), startAt });
  for (let scanName of scansToRun.slice(startAt)) {
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