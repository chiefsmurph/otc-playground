const fs = require('fs');
module.exports = async () => {
  try { return JSON.parse(fs.readFileSync('/tmp/otc-universe.json', 'utf8')); }
  catch (e) { return []; }
};
