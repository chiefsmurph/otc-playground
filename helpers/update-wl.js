const jsonMgr = require('../helpers/json-mgr');

module.exports = async (dateStr, wlObj) => {
  console.log('updating', { dateStr, wlObj });
  const path = `./data/watch-lists/${dateStr}`;
  try {
    var current = require(`.${path}`);
  } catch (e) {}
  await jsonMgr.save(`${path}.json`, {
    ...current,
    ...wlObj
  });
};