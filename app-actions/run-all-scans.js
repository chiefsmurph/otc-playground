const scan = require('./scan');

module.exports = async () => {
  const scansToRun = {
    'day-streaks': true,
    'accumulation': true,
    'ihub': true,
    'twitter': [undefined, null]  // not based on collection
  };
  console.log({ scansToRun });
  for (let scanName of Object.keys(scansToRun)) {
    console.log('starting scan...', scanName);
    const additionalArgs = Array.isArray(scansToRun[scanName]) ? scansToRun[scanName] : [];
    await scan(scanName, ...additionalArgs);
    console.log('finished scan...', scanName);
  }
};