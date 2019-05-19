const cTable = require('console.table');
const sendEmail = require('../helpers/send-email');
const getRecs= require('../helpers/get-recs');
module.exports = async () => {
  const { mostRecentDate, withPicks } = await getRecs();
  await sendEmail(`TODAYS RECOMMENDATIONS (${mostRecentDate})`, cTable.getTable(withPicks));
};