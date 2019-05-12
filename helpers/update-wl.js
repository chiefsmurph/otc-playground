const jsonMgr = require('../helpers/json-mgr');

module.exports = async (dateStr, wlObj) => {
  const path = `./data/watch-lists/${dateStr}`;
  const current = require(`.${path}`);
  await jsonMgr.save(`${path}.json`, {
    ...current,
    ...wlObj
  });
};