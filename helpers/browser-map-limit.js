const mapLimit = require('promise-map-limit');
const initBrowser = require('./init-browser');

Object.defineProperty(Array.prototype, 'chunk', {
  value: function(chunkSize) {
      var R = [];
      for (var i=0; i<this.length; i+=chunkSize)
          R.push(this.slice(i,i+chunkSize));
      return R;
  }
});

module.exports = async (collection, limit, asyncFn, browserRefresh = 15000) => {
  const chunked = collection.chunk(browserRefresh);
  let response = [];
  for (let chunk of chunked) {
    response = [
      ...await mapLimit(chunk, limit, asyncFn),
      ...response
    ];
    await initBrowser();
  }
  return response;
};