const fs = require('mz/fs');
const { mapObject } = require('underscore');

const { avg } = require('../helpers/array-math');
const jsonMgr = require('../helpers/json-mgr');

const cTable = require('console.table');
const noExt = file => file.split('.')[0];

module.exports = async (numDays = Number.POSITIVE_INFINITY) => {

  // aggregate all day-perfs by watch-list
  const perfsByWL = {};

  const watchLists = (await fs.readdir('./data/day-perfs'))
    .map(noExt)
    .sort((a, b) => new Date(a) - new Date(b))
    .slice(0 - numDays);
  console.log(watchLists);
  for (let date of watchLists) {

    const { listPerf: watchListPerf } = await jsonMgr.get(`./data/day-perfs/${date}.json`);
    Object.keys(watchListPerf).forEach(watchList => {
      perfsByWL[watchList] = [  
        ...perfsByWL[watchList] || [],
        {
          date: date.split('.')[0],
          picks: watchListPerf[watchList].allTickers,
          ...watchListPerf[watchList]
        }
      ];

    });

  }

  console.log('perfsByWL');
  console.log('-----------------------');
  console.log(perfsByWL);

  // aggregate stats for WL
  const firstList = perfsByWL[Object.keys(perfsByWL)[0]];
  const firstPerf = firstList[0];
  const perfKeys = Object.keys(firstPerf).filter(key => 
    !['date', 'allTickers', 'picks'].includes(key)
  );
  console.log('\n', { perfKeys })
  const wlStats = mapObject(perfsByWL, dayPerfs => {
    const allPicks = dayPerfs.reduce((acc, perf) => [ ...acc, ...perf.picks], []);
    return perfKeys.reduce((acc, perfKey) => {
      const allPerfValues = dayPerfs.map(perf => perf[perfKey]);
      return {
        ...acc,
        [perfKey]: {
          avg: avg(allPerfValues),
          values: allPerfValues.map(val => Math.round(val)),
        }
      };
    }, { allPicks });
  });


  console.log('\n\nwlStats');
  console.log('-----------------------');
  console.log(
    wlStats
  );

  // display sorted by perfKeys from wlStats
  console.log()
  console.log()

  const finalReport = perfKeys.map(perfKey => {

    const data = Object.keys(wlStats)
      .map(watchList => {
        return {
          watchList,
          ...wlStats[watchList][perfKey],
          allPicks: wlStats[watchList].allPicks
        };
      })
      .sort((a, b) => b.avg - a.avg);

    return {
      perfKey,
      data
    };

  });


  const lines = [];
  finalReport
    .filter(({ perfKey }) => ['trendToCloses', 'trendToHigh'].includes(perfKey))
    .forEach(({ perfKey, data }) => {
      lines.push(`sorted by ${perfKey}`);
      lines.push('-----------------------');
      lines.push(cTable.getTable(data));
    });

  return {
    dates: watchLists,
    finalReport,
    formatted: lines.join('\r\n')
  };

};