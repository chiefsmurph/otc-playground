const fs = require('mz/fs');
const { mapObject } = require('underscore');

const { avgArray } = require('../helpers/array-math');
const jsonMgr = require('../helpers/json-mgr');

(async () => {

  // aggregate all day-perfs by watch-list
  const perfsByWL = {};

  const watchListPerfs = await fs.readdir('./data/day-perfs');
  for (let date of watchListPerfs) {

    const { listPerf: watchListPerf } = await jsonMgr.get(`./data/day-perfs/${date}`);
    Object.keys(watchListPerf).forEach(watchList => {
      perfsByWL[watchList] = [  
        ...perfsByWL[watchList] || [],
        {
          date: date.split('.')[0],
          numPicks: watchListPerf[watchList].allTickers.length,
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
    !['date', 'allTickers', 'numPicks'].includes(key)
  );
  console.log('\n', { perfKeys })
  const wlStats = mapObject(perfsByWL, dayPerfs => {
    const totalPicks = dayPerfs.reduce((acc, perf) => acc + perf.numPicks, 0);
    return perfKeys.reduce((acc, perfKey) => {
      const allPerfValues = dayPerfs.map(perf => perf[perfKey]);
      return {
        ...acc,
        [perfKey]: {
          avg: avgArray(allPerfValues),
          values: allPerfValues,
        }
      };
    }, { totalPicks });
  });


  console.log('\n\nwlStats');
  console.log('-----------------------');
  console.log(
    wlStats
  );

  // display sorted by perfKeys from wlStats
  console.log()
  console.log()
  perfKeys.forEach(perfKey => {

    console.log(`sorted by ${perfKey}`);
    console.log('-----------------------');

    const data = Object.keys(wlStats)
      .map(watchList => {
        return {
          watchList,
          ...wlStats[watchList][perfKey],
          totalPicks: wlStats[watchList].totalPicks
        };
      })
      .sort((a, b) => b.avg - a.avg);
    console.table(data)

  });

})();