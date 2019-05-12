(async () => {

  const args = process.argv.slice(2).map(val => {
    if (val === 'true' || val === 'false') {
      return Boolean(val === 'true');
    } else if (!isNaN(val)) {
      return Number(val);
    } else if (val === '_') {
      return undefined; 
    } else {
      return val;
    }
  });
  console.log({ args })
  const toRun = args.shift();
  
  // init
  await require('./helpers/init-browser')();
  const folders = ['app-actions', 'cli', 'singles'];
  const getFile = file => {
    for (let folder of folders) {
      try {
        const found = require(`./${folder}/${file}`);
        console.log(`found in ${folder}`);
        return found;
      } catch (e) {}
    }
  };
  const fnToRun = getFile(toRun);
  await fnToRun(...args);

  // un-init
  await browser.close();
})();