const scan = require('./scan');

module.exports = async () => {
  const scansToRun = [
    'twitter',
    'day-streaks',
    'accumulation',
    'ihub'
  ];
  console.log({ scansToRun });
  for (let scanName of scansToRun) {
    console.log('starting scan...', scanName);
    await scan(scanName);
    console.log('finished scan...', scanName);
  }
};