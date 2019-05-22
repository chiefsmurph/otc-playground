const cTable = require('console.table');
const sendEmail = require('../helpers/send-email');
const getRecs = require('../helpers/get-recs');
const updateWl = require('../helpers/update-wl');

module.exports = async onlyMe => {
  const { mostRecentDate, withPicks } = await getRecs();

  const topPicks = withPicks.splice(0, 2);
  const medPicks = withPicks.splice(0, 2);
  const theRest = withPicks;

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
    'recs-number1': getTs([topPicks[0]]),
    'recs-top': getTs(topPicks),
    'recs-medium': getTs(medPicks)
  });
};