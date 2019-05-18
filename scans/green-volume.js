// lots of volume little price actions (green)
const cTable = require('console.table');

const addHistoricals = require('../helpers/add-historicals');
const getTrend = require('../helpers/get-trend');
const withCollection = require('../helpers/with-collection');
const { omit } = require('underscore');

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
        // recentHistorical derived
        bodyTrend: getTrend(
          recentHistorical.open,
          recentHistorical.close
        ),
        wickSize: getTrend(recentHistorical.close, recentHistorical.high) + getTrend(recentHistorical.low, recentHistorical.open),
        volumeRatio: recentHistorical.volumeRatio
      };
    });

    const withSingleMetric = withBodyAndWick.map(record => ({
      ...record,
      single: record.bodyTrend * record.volumeRatio
    }))

    const greenVol = withSingleMetric
      .sort((a, b) => b.single - a.single);


    const filtered = greenVol
      .filter(({ bodyTrend }) => bodyTrend > 15 && bodyTrend < 100)
      .filter(({ volumeRatio }) => volumeRatio > 70)
      .filter(({ wickSize }) => wickSize < 50);

    
    console.table(
      filtered.map(record => omit(record, 'historicals'))
    )

    // console.log('-----------');

    return filtered.slice(0, 2).map(record => record.symbol);
});