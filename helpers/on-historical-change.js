
const getMostRecentHistoricalDate = require('../cli/get-most-recent-historical-date');
// const regCronAfter630 = require('../helpers/reg-cron-after-630');

const fns = [];
const onHistoricalChange = fnToRun => {
  let prevVal;
  fns.push(fnToRun);

  const checkForChange = async () => {
    const curDateStr = await getMostRecentHistoricalDate();
    console.log(`most recent hist dateStr: ${curDateStr}`)
    if (prevVal && prevVal != curDateStr) {
      fns.forEach(fn => fn());
    }
    prevVal = curDateStr;
  };
  checkForChange();
  setInterval(checkForChange, 1000 * 60 * 10);
};

module.exports = onHistoricalChange;