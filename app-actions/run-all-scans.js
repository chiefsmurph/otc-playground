const scan = require('./scan');
const allScans = [
  'twitter',
  'stock-invest',
  'day-streaks',
  'accumulation',
  'green-volume',
  'ihub'
];
module.exports = async (
  scansToRun = allScans,
  count
) => {
  console.log({ scansToRun });
  for (let scanName of scansToRun) {
    console.log('starting scan...', scanName);
    await scan(scanName, count);
    console.log('finished scan...', scanName);
  }
};