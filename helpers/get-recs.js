const watchlistPerf = require('../app-actions/watch-list-perf');
const mapLimit = require('promise-map-limit');
const { mapObject } = require('underscore');
const fs = require('mz/fs');


const noExt = file => file.split('.')[0];
module.exports = async (numToConsider = 9) => {
  const days = [1, 2, 4, 6];
  const output = await mapLimit(days, 1, async day => ({
    day,
    ...await watchlistPerf(day)
  }));
  console.log(JSON.stringify({output}, null, 2));
  const stratsPerDay = output.map(report => 
    report.finalReport.find(r => r.perfKey === 'avgTrendBetween').data
      // .slice(0, numToConsider)
      .filter(result => result.values.length >= report.day - 2)
      .map(result => result.watchList)
  );
    console.log({stratsPerDay});
  const pointTally = {};
  stratsPerDay.forEach((strats) => {
    strats.forEach((strat, ind, arr) => {
      const points = numToConsider - ind;
      pointTally[strat] = [
        ...(pointTally[strat] || []),
        points
      ];
    });
  });

  console.log({ pointTally })
  const totals = mapObject(pointTally, arr => arr.reduce((acc, val) => acc + val, 0));
  const sorted = Object.keys(totals).sort((a, b) => {
    return totals[b] - totals[a];
  });

  console.log({ sorted })
  const watchLists = (await fs.readdir('./data/watch-lists'))
    .map(noExt)
    .sort((a, b) => new Date(b) - new Date(a));
  const mostRecentDate = watchLists[0];
  const mostRecentWL = require(`../data/watch-lists/${mostRecentDate}`);
  
  const withPicks = sorted.map(strat => ({
    strat,
    picks: (mostRecentWL[strat] || [])
  }))
  .filter(pick => !pick.strat.includes('recs-'))
  .filter(pick => pick.picks && pick.picks.length);
  console.table(withPicks)
  return {
    withPicks,
    mostRecentDate
  };
};