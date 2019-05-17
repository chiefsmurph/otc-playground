
const number = require('../helpers/number');
const getTrend = require('../helpers/get-trend');
const cacheThis = require('../helpers/cache-this');
const request = require('request-promise');
const { mapObject } = require('underscore');
const { tiingo: { token }} = require('../config');

const getHistoricals = async (ticker) => {

  const requestOptions = {
    url: `https://api.tiingo.com/tiingo/daily/${ticker}/prices?startDate=2018-1-1&token=${token}`,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const response = await request(requestOptions);
  const parsed = JSON.parse(response);
  parsed.reverse();
  const hists = parsed
    .map(({ date, ...hist }) => {
      return {
        date: new Date(date),
        ...mapObject(hist, number)
      };
    });

  const withTrend = hists.map((hist, index) => {
    const prevDay = hists[index + 1];
    const withTSO = {
      ...hist,
      tso: getTrend(hist.adjOpen, hist.adjClose)
    };
    if (!prevDay) return withTSO;
    return {
      ...withTSO,
      tsc: getTrend(prevDay.adjClose, hist.adjClose)
    };
  });

  const allVols = withTrend.map(hist => hist.adjVolume).filter(Boolean);
  const maxVol = Math.max(...allVols);
  const minVol = Math.min(...allVols);
  // console.log({ maxVol, minVol });
  const spread = maxVol - minVol;
  const withVolumePerc = withTrend.map(hist => {
    const { adjVolume } = hist;
    const volMinusMin = adjVolume - minVol;
    return {
      ...hist,
      volumeRatio: volMinusMin / spread * 100
    };
  });

  console.log(`got historicals for ${ticker}`, withVolumePerc);
  return withVolumePerc;

};

module.exports = {
  getHistoricals,
  cachedHistoricals: cacheThis(getHistoricals, 200)
};