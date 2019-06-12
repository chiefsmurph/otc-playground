const fs = require('mz/fs');
// const { mapObject } = require('underscore');
const jsonMgr = require('../helpers/json-mgr');

const noExt = file => file.split('.')[0];
module.exports = async (query = '', numDays = Number.POSITIVE_INFINITY) => {
  // aggregate all day-perfs by watch-list
  const perfsByWL = {};

  const watchLists = (await fs.readdir('./data/day-perfs'))
    .map(noExt)
    .sort((a, b) => new Date(a) - new Date(b))
    .slice(0 - numDays);
  console.log(watchLists);
  for (let date of watchLists) {

    const { listPerf: watchListPerf } = await jsonMgr.get(`./data/day-perfs/${date}.json`);
    Object.keys(watchListPerf).forEach(watchList => {
      perfsByWL[watchList] = [  
        ...perfsByWL[watchList] || [],
        {
          dateStr: date.split('.')[0],
          ...watchListPerf[watchList]
        }
      ];

    });


  }


  // strlog(perfsByWL);


  return Object.keys(perfsByWL)
    .filter(key => key.includes(query))
    .filter(key => perfsByWL[key].length > 3)
    .reduce((acc, key) => ({
      ...acc,
      [key]: perfsByWL[key]
    }), {})

};