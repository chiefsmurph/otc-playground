const cTable = require('console.table');
const sendEmail = require('../helpers/send-email');
const getRecs= require('../helpers/get-recs');
module.exports = async (numToConsider, email) => {
  const { mostRecentDate, withPicks } = await getRecs(numToConsider);

  const topPicks = withPicks.splice(0, 2);
  const medPicks = withPicks.splice(0, 2);
  const theRest = withPicks;

  let str = '';
  const section = (title, withPicks) => {
    str += title + '\n';
    str += '-------------------------------\n'
    str += cTable.getTable(withPicks);
    str += '\n\n';
  };
  section('TOP PICKS', topPicks);
  medPicks.length && section('MEDIUM PICKS', medPicks);
  theRest.length && section('MILD PICKS', theRest);

  // await sendEmail(`TODAYS RECOMMENDATIONS (${mostRecentDate})`, str, email);
};