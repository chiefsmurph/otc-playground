// lots of volume little price actions (green)
const cTable = require('console.table');
const { pick } = require('underscore');
const addHistoricals = require('../helpers/add-historicals');
const withCollection = require('../helpers/with-collection');

module.exports = withCollection(async records => {
    console.log('total of interest:', records.length);

    const withHistoricals = await addHistoricals(records);
    console.log({ withHistoricals })
    const withDayStreak = withHistoricals.map(record => ({
      ...pick(record, 'symbol'),
      dayStreak: record.historicals.findIndex(hist => hist.tsc <= 0)
    }));

    console.log(withHistoricals)


    console.table(
      withDayStreak
          // .filter(record => record.bodyTrend > 0)
          .sort((a, b) => b.dayStreak - a.dayStreak)
    );

    const uniqDayStreaks = [...new Set(withDayStreak.map(record => record.dayStreak))]
    const dayStreaksOfInterest = uniqDayStreaks
      .filter(dayStreak => dayStreak > 0)
      .filter(dayStreak => {
        const count = withDayStreak.filter(record => record.dayStreak === dayStreak).length;
        return count <= 3;
      });

    return withDayStreak
      .filter(record => dayStreaksOfInterest.includes(record.dayStreak))
      .map(record => ({
        symbol: record.symbol,
        [`${record.dayStreak}days`]: true
      }));

});