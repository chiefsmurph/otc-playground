(async () => {

  const args = process.argv.slice(2).map(val => {
    if (val === 'true' || val === 'false') {
      return Boolean(val === 'true');
    } else if (!isNaN(val)) {
      return Number(val);
    } else {
      return val;
    }
  });
  console.log(args)
  const toRun = args.shift();
  
  // init
  await require('./helpers/init-browser')();
  const fnToRun = require(`./app-actions/${toRun}`);
  await fnToRun(...args);

  // un-init
  await browser.close();
})();