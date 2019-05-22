const Combinatorics = require('js-combinatorics');
const getDatestr = require('../helpers/get-datestr');

module.exports = async () => {
  let derived = {};
  const todayDate = getDatestr();
  const todayWl = require(`../data/watch-lists/${todayDate}`);
  if (!todayWl) return console.log('no wl for today');



  // start by 

  const allStrats = Object.keys(todayWl);
  console.log({allStrats});


  // start by calcing combos

  const bySymbol = {};
  Object.keys(todayWl).forEach(strat => {
    const picks = todayWl[strat];
    picks.forEach(pick => {
      bySymbol[pick] = [
        ...(bySymbol[pick] || []),
        strat
      ];
    });
  });

  
  Object.keys(bySymbol).forEach(symbol => {
    const strats = bySymbol[symbol];
    const allPerms = Combinatorics.power(strats).filter(arr => arr.length);
    console.log({ allPerms })
    if (allPerms.length > 1) {
      derived = {
        ...derived,
        ...allPerms.reduce((acc, perm) => {

          if (perm.length === 1) return acc; 
          const keyName = perm
            .sort((a, b) => a.localeCompare(b))
            .join('~');
          return {
            ...acc,
            [keyName]: [
              ...(derived[keyName] || []),
              symbol
            ]
          };
          
        }, {})
      };
    }
    
  });


  // then get my-recs

  

  console.log({derived});
};