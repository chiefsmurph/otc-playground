const cTable = require('console.table');
const sendEmail = require('../helpers/send-email');
const getRecs = require('../helpers/get-recs');
const updateWl = require('../helpers/update-wl');

module.exports = async onlyMe => {
  const { mostRecentDate, withPicks } = await getRecs();

  const twoPicks = () => {
    let result = [];
    while (result.reduce((acc, res) => {
      console.log(res.picks);
      return acc + res.picks.length
    }, 0) < 2) {
      result.push(
        withPicks.shift()
      );
    }
    return result;
  };
  const topPicks = twoPicks();
  const medPicks = twoPicks();
  const theRest = withPicks.slice(0, 10);

  let str = '';
  const section = (title, withPicks) => {
    str += title + '\n';
    str += '-------------------------------\n'
    str += cTable.getTable(withPicks);
    str += '\n';
  };
  section('TOP PICKS', topPicks);
  medPicks.length && section('MEDIUM PICKS', medPicks);
  theRest.length && section('MILD PICKS', theRest);

  await sendEmail(`TODAYS RECOMMENDATIONS (${mostRecentDate})`, str, !onlyMe);

  const getTs = arr => arr.map(pick => pick.picks).flatten();

  await updateWl(mostRecentDate, {
    'recs-number1': getTs(topPicks).slice(0, 1),
    'recs-top': getTs(topPicks),
    'recs-medium': getTs(medPicks)
  });
};