const fs = require('mz/fs');
const jsonMgr = require('../helpers/json-mgr');
const dayPerfAction = require('../app-actions/day-perf');

const noExt = file => file.split('.')[0];
const { daysToAnalyze } = require('../settings');

(async () => {

  const watchLists = (await fs.readdir('./data/watch-lists')).map(noExt);
  const dayPerfs = await fs.readdir('./data/day-perfs');
  const closedOutDayPerfs = dayPerfs.filter(file => {
    const json = require(`../data/day-perfs/${file}`);
    return json.numDays === daysToAnalyze;
  }).map(noExt);
  
  const wlNeedAnalyzing = watchLists.filter(wl => {
    return !closedOutDayPerfs.includes(wl);
  });

  console.log('wlNeedAnalyzing', wlNeedAnalyzing);
  for (let date of wlNeedAnalyzing) {
    console.log(`ANALYZING WATCHLIST FOR DATE: ${date}`);
    await dayPerfAction(date);
  }


})();