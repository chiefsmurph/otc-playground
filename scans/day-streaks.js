// lots of volume little price actions (green)
const cTable = require('console.table');
const { pick } = require('underscore');
const addHistoricals = require('../helpers/add-historicals');
const withCollection = require('../helpers/with-collection');
const { omit } = require('underscore');

module.exports = withCollection(async records => {
    console.log('total of interest:', records.length);

    const withHistoricals = await addHistoricals(records);
    const withDayStreak = withHistoricals.map(record => ({
      ...pick(record, 'symbol'),
      dayStreak: record.historicals.findIndex(hist => hist.tsc <= 0)
    }));

    const uniqDayStreaks = [...new Set(withDayStreak.map(record => record.dayStreak))]
    const dayStreaksOfInterest = uniqDayStreaks
      .filter(dayStreak => dayStreak > 0)
      .filter(dayStreak => {
        const count = withDayStreak.filter(record => record.dayStreak === dayStreak).length;
        return count <= 3;
      });

    const response = withDayStreak
      .filter(record => dayStreaksOfInterest.includes(record.dayStreak))
      .map(record => ({
        symbol: record.symbol,
        [`${record.dayStreak}days`]: true
      }));

    console.table(
      response
        // .filter(record => record.bodyTrend > 0)
        .sort((a, b) => b.dayStreak - a.dayStreak)
        .map(record => omit(record, 'historicals'))
    );

    return response;

});