const watchlistPerf = require('../app-actions/watch-list-perf');
const mapLimit = require('promise-map-limit');
const { mapObject } = require('underscore');
const fs = require('mz/fs');


const noExt = file => file.split('.')[0];
module.exports = async (numToConsider = 3) => {
  const days = [1, 3, 6];
  const output = await mapLimit(days, 1, async day => ({
    day,
    ...await watchlistPerf(day)
  }));
  const stratsPerDay = output.map(report => 
    report.finalReport.find(r => r.perfKey === 'avgTrendBetween')
      .data.slice(0, numToConsider).map(result => result.watchList)
  );

  const pointTally = {};
  stratsPerDay.forEach((strats) => {
    strats.forEach((strat, ind) => {
      const points = numToConsider - ind;
      pointTally[strat] = [
        ...(pointTally[strat] || []),
        points
      ];
    });
  });

  const totals = mapObject(pointTally, arr => arr.reduce((acc, val) => acc + val, 0));
  const sorted = Object.keys(totals).sort((a, b) => {
    return totals[b] - totals[a];
  });

  const watchLists = (await fs.readdir('./data/watch-lists'))
    .map(noExt)
    .sort((a, b) => new Date(b) - new Date(a));
  const mostRecentDate = watchLists[0];
  const mostRecentWL = require(`../data/watch-lists/${mostRecentDate}`);
  
  const withPicks = sorted.map(strat => ({
    strat,
    picks: mostRecentWL[strat]
  })).filter(pick => pick.picks && pick.picks.length);
  console.table(withPicks)
  return {
    withPicks,
    mostRecentDate
  };
};