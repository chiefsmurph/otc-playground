const cTable = require('console.table');
const sendEmail = require('../helpers/send-email');
const getRecs = require('../helpers/get-recs');
const updateWl = require('../helpers/update-wl');
const { partition } = require('underscore');

module.exports = async (onlyMe, perfKey) => {
  const { mostRecentDate, withPicks } = await getRecs(perfKey);
  const [ noCombos, yesCombos ] = partition(withPicks, pick => !pick.strat.includes('~'));

  const twoPicks = arr => {
    let result = [];
    while (arr.length && result.reduce((acc, res) => {
      console.log(res.picks);
      return acc + res.picks.length
    }, 0) < 2) {
      result.push(
        arr.shift()
      );
    }
    return result;
  };
  const topPicks = twoPicks(noCombos);
  const medPicks = twoPicks(noCombos);
  const theRest = noCombos.slice(0, 10);
  const firstCombos = yesCombos.slice(0, 2);

  let str = '';
  const section = (title, withPicks) => {
    str += title + '\n';
    str += '-------------------------------\n'
    str += cTable.getTable(withPicks);
    str += '\n';
  };
  section('TOP PICKS', topPicks);
  medPicks.length && section('MEDIUM PICKS', medPicks);
  firstCombos.length && section('COMBOS', firstCombos);
  theRest.length && section('WORTH CONSIDERING', theRest);

  await sendEmail(`TODAYS RECOMMENDATIONS [amended] (${mostRecentDate})`, str, !onlyMe);

  const getTs = arr => arr.map(pick => pick.picks).flatten();

  await updateWl(mostRecentDate, {
    'recs-number1': getTs(topPicks).slice(0, 1),
    'recs-top': getTs(topPicks),
    'combos': getTs(firstCombos),
    'recs-medium': getTs(medPicks)
  });
};