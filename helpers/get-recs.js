const mapLimit = require('promise-map-limit');
const { mapObject } = require('underscore');
const fs = require('mz/fs');

const watchlistPerf = require('../app-actions/watch-list-perf');
const generateDerived = require('../app-actions/generate-derived');
const { sum } = require('../helpers/array-math');

const noExt = file => file.split('.')[0];
module.exports = async (perfKey = 'trendToHigh') => {
  const days = [3, 7, 14];
  const output = await mapLimit(days, 1, async day => ({
    day,
    ...await watchlistPerf(day)
  }));
  console.log(JSON.stringify({output}, null, 2));
  const stratsPerDay = output.map(report => ({
    day: report.day,
    report: report.finalReport.find(r => r.perfKey === perfKey).data
      // .slice(0, numToConsider)
      // .filter(result => {
      //   return result.values.length >= (
      //     result.watchList.includes('~') ? Math.min(report.day, 3) : report.day - 2
      //   );
      // })
      // .filter(result => result.avg > 10)
  }));
    
    console.log(JSON.stringify({stratsPerDay}, null, 2));


  const pointTally = {};
  stratsPerDay.forEach(({ report }) => {
    report.forEach(({ watchList, avg }) => {
      pointTally[watchList] = [
        ...(pointTally[watchList] || []),
        avg
      ];
    });
  });

  console.log({ pointTally })
  const totals = mapObject(pointTally, tally => ({
    tally: [...new Set(tally)].map(Math.round),
    sum: sum([...new Set(tally)])
  }));
  const sorted = Object.keys(totals).sort((a, b) => {
    return totals[b].sum - totals[a].sum;
  });

  console.log({ sorted })
  const watchLists = (await fs.readdir('./data/watch-lists'))
    .map(noExt)
    .sort((a, b) => new Date(b) - new Date(a));
  const mostRecentDate = watchLists[0];
  const mostRecentWL = require(`../data/watch-lists/${mostRecentDate}`);
  
  const derived = await generateDerived(mostRecentDate);

  const withPicks = sorted.map(strat => ({
    strat,
    picks: mostRecentWL[strat] || derived[strat] || [],
    tallys: totals[strat].tally
  }))
    .filter(pick => ['recs', 'combos'].every(compare => !pick.strat.includes(compare)))
    .filter(pick => pick.picks && pick.picks.length);

  console.table(withPicks)
  return {
    withPicks,
    mostRecentDate
  };
};