// lots of volume little price actions (green)
const cTable = require('console.table');

const addHistoricals = require('../helpers/add-historicals');
const getTrend = require('../helpers/get-trend');


module.exports = async records => {


    console.log('total records:', records.length);

    const withHistoricals = await addHistoricals(records);
    const withRecentHist = withHistoricals
      .filter(record => record.historicals && record.historicals.length)
      .map(record => ({
        ...record,
        recentHistorical: record.historicals[0]
      }));
      
    console.log({ withHistoricals })
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


    console.table(
      withBodyAndWick
          // .filter(record => record.bodyTrend > 0)
          .sort((a, b) => b.volumeRatio - a.volumeRatio)
    )


    console.table(
      withBodyAndWick
          .filter(record => record.bodyTrend > 0)
          .sort((a, b) => b.volumeRatio - a.volumeRatio)
    )

    console.log('-----------');


    await browser.close();
};