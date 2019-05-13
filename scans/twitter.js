const usersOfInterest = [
  'magicmiketrader',
  'SniperTradesOTC',
  'i_like_bb_stock',
];
const twitterUser = require('../scraping-actions/twitter-user');
const browserMapLimit = require('../helpers/browser-map-limit');

module.exports = async () => {
  const results = await browserMapLimit(usersOfInterest, 1, twitterUser);
  return results.reduce((acc, result) => [...acc, ...result], []);
};