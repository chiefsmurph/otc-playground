const updateWl = require('../helpers/update-wl');

module.exports = async () => {
  await updateWl('5-13-2019', {
    "day-streaks-5days": [
      "LRSV"
    ],
    "day-streaks-4days": [
      "INTV"
    ]
  });
};