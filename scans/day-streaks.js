// lots of volume little price actions (green)
const cTable = require('console.table');
const { pick } = require('underscore');
const addHistoricals = require('../helpers/add-historicals');

module.exports = async records => {
    console.log('total of interest:', records.length);

    const withHistoricals = await addHistoricals(records);

    const withDayStreak = withHistoricals.map(record => ({
      ...pick(record, 'symbol'),
      dayStreak: record.historicals.findIndex(hist => hist.tso <= 0 && hist.tsc <= 0)
    }));

    console.log(withHistoricals)


    console.table(
      withDayStreak
          // .filter(record => record.bodyTrend > 0)
          .sort((a, b) => b.dayStreak - a.dayStreak)
    )

    return withDayStreak
      .filter(record => record.dayStreak >= 6)
      .map(record => ({
        symbol: record.symbol,
        [`${record.dayStreak}days`]: true
      }));

};