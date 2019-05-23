const mapLimit = require('promise-map-limit');

Object.defineProperty(Array.prototype, 'chunk', {
  value: function(chunkSize) {
      var R = [];
      for (var i=0; i<this.length; i+=chunkSize)
          R.push(this.slice(i,i+chunkSize));
      return R;
  }
});

module.exports = async (collection = [], limit, asyncFn, browserRefresh = 15) => {
  const chunked = collection.chunk(browserRefresh);
  let response = [];
  let num = 0;
  for (let chunk of chunked) {
    response = [
      ...await mapLimit(chunk, limit, async (...args) => {
        try {
          var response = await asyncFn(...args);
        } catch (e) {
          console.log('caught in browser map limit...', e);
        } finally {
          num++;
          console.log(`${num} / ${collection.length}`);
          return response;
        }
      }),
      ...response
    ];
    await require('../helpers/browser').init();
  }
  return response;
};