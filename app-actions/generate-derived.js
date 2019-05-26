const Combinatorics = require('js-combinatorics');
const getDatestr = require('../helpers/get-datestr');
const jsonMgr = require('../helpers/json-mgr');
const getTickers = require('../helpers/get-tickers');
const { mapObject } = require('underscore');

module.exports = async (dateStr = getDatestr()) => {
  let derived = {};
  const todayWl = mapObject(
    require(`../data/watch-lists/${dateStr}`), 
    val => getTickers(val)
  );
  if (!todayWl) return console.log(`no wl for ${dateStr}`);
  // console.log(todayWl)

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
    if (strats.length === 1) return;
    const cmb = Combinatorics.combination(strats, 2);
    const allPerms = [];
    while (a = cmb.next()) allPerms.push(a);
    
    const filtered = allPerms.filter(perms => {
      const bases = perms.map(wl => wl.split('-')[0]);
      const isTwitter = bases.some(base => base === 'twitter');

      const noRecs = bases.every(base => !base.includes('recs'));
      const noLongs = perms.every(wl => {
        const count = wl.split('-').length;
        return count <= (wl.includes('twitter') ? 2 : 3);
      });
      const onlyAcross = isTwitter || bases[0] != bases[1];
      console.log({
        perms,
        isTwitter,
        noRecs,
        noLongs,
        onlyAcross
      })
      return noRecs && noLongs && onlyAcross;
    });
    
    derived = {
      ...derived,
      ...filtered.reduce((acc, perm) => {

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
    
  });

  Object.keys(derived).length && await jsonMgr.save(`./data/derived-wls/${dateStr}.json`, derived);

  return derived;
};