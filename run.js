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
  const folders = ['app-actions', 'cli', 'singles', 'scraping-actions'];
  const getFile = file => {
    for (let folder of folders) {
      try {
        const path = `./${folder}/${file}`;
        const found = require(path);
        console.log(`found at ${path}`);
        return found;
      } catch (e) {}
    }
  };
  const fnToRun = getFile(toRun);
  await fnToRun(...args);

  // un-init
  await browser.close();
})();