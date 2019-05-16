
const getMostRecentHistoricalDate = require('../cli/get-most-recent-historical-date');

const fns = [];
const onHistoricalChange = fnToRun => {
  let prevVal;
  fns.push(fnToRun);
  setInterval(async () => {
    const curDateStr = await getMostRecentHistoricalDate();
    console.log(`most recent hist dateStr: ${curDateStr}`)
    if (prevVal && prevVal != curDateStr) {
      fns.forEach(fn => fn());
    }
    prevVal = curDateStr;
  }, 1000 * 60 * 10);
};

module.exports = onHistoricalChange;