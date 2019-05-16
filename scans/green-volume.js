// lots of volume little price actions (green)
const cTable = require('console.table');

const addHistoricals = require('../helpers/add-historicals');
const getTrend = require('../helpers/get-trend');
const withCollection = require('../helpers/with-collection');


module.exports = withCollection(async records => {


    console.log('total records:', records.length);

    const withHistoricals = await addHistoricals(records);
    const withRecentHist = withHistoricals
      .map(record => ({
        ...record,
        recentHistorical: record.historicals[0]
      }));
      
    const withBodyAndWick = withRecentHist.map(({ recentHistorical, ...record }) => {
      return {
        ...record,
        recentHistorical,
        bodyTrend: getTrend(
          recentHistorical.open,
          recentHistorical.close
        ),
        wickSize: getTrend(recentHistorical.close, recentHistorical.high) + getTrend(recentHistorical.low, recentHistorical.open)
      };
    });
    
    const greenVol = withBodyAndWick
      .filter(record => record.bodyTrend > 0)
      .sort((a, b) => b.volumeRatio - a.volumeRatio);


    console.table(
      greenVol
    )

    console.log('-----------');

    return withBodyAndWick.map(record => record.symbol);
});