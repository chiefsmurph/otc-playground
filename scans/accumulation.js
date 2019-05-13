// lots of volume little price actions (green)
const cTable = require('console.table');
const addHistoricals = require('../helpers/add-historicals');
const getTrend = require('../helpers/get-trend');

module.exports = async records => {

  console.log('total records:', records.length);

  const withHistoricals = await addHistoricals(records);
  const withRecentHist = withHistoricals.map(record => ({
    ...record,
    recentHistorical: record.historicals[0]
  }));

  let withMetrics = withRecentHist
    .filter(record => record.recentHistorical && record.recentHistorical.open);

  console.log({
    withRecentHist,
    numWithMetrics: withMetrics.length
  });

  withMetrics = withMetrics
    .map(record => {
      const { recentHistorical } = record;
      return {
        ...record,
        bodyTrend: getTrend(
          recentHistorical.open,
          recentHistorical.close
        ),
        wickSize: (
          getTrend(recentHistorical.close, recentHistorical.high) 
          + getTrend(recentHistorical.low, recentHistorical.open)
        )
      };
    });


  const withVolumeToChangeRatio = withMetrics.map(record => ({
    ...record,
    volumeToChangeRatio: record.recentHistorical.volumeRatio / record.bodyTrend
  }));

  const withAccumulationScore = withVolumeToChangeRatio.map(record => ({
    ...record,
    accumulationScore: Math.round(record.volumeToChangeRatio / record.wickSize * 100)
  }));

  // const withTier = withVolumeToChangeRatio.map(record => ({
  //     ...record,
  //     tier: response.records.find(r => r.symbol === record.symbol).tierName
  // }));


  console.table(
    withAccumulationScore
        .sort((a, b) => b.accumulationScore - a.accumulationScore)
  )

  console.log('-----------');


  const smallWicks = withAccumulationScore.filter(record => record.wickSize < 25);
  const goodVol = smallWicks.filter(record => record.recentHistorical.volumeRatio > 35);

  console.table(
    goodVol
        .sort((a, b) => b.accumulationScore - a.accumulationScore)
  );

  const accBreakdowns = {
    infinity: score => score === Number.POSITIVE_INFINITY,
    gt300: score => score > 300 && score !== Number.POSITIVE_INFINITY,
    lt25: score => score < 25
  };



  return goodVol
    .map(record => ({
      symbol: record.symbol,
      ...Object.keys(accBreakdowns).filter(key => {
        const fn = accBreakdowns[key];
        return fn(record.accumulationScore);
      }).reduce((acc, key) => ({
        ...acc,
        [`acc-${key}`]: true
      }), {})
    }));

};