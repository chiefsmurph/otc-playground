const scan = require('./scan');

module.exports = async (count) => {
  const scansToRun = [
    'twitter',
    'day-streaks',
    'accumulation',
    'green-volume',
    'ihub'
  ];
  console.log({ scansToRun });
  for (let scanName of scansToRun) {
    console.log('starting scan...', scanName);
    await scan(scanName, count);
    console.log('finished scan...', scanName);
  }
};