const jsonMgr = require('../helpers/json-mgr');

module.exports = async (dateStr, wlObj) => {
  console.log('updating', { dateStr, wlObj });
  const path = `./data/watch-lists/${dateStr}.json`;
  try {
    var current = await jsonMgr.get(path);
  } catch (e) {}
  await jsonMgr.save(path, {
    ...current,
    ...wlObj
  });
};