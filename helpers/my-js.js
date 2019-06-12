Array.prototype.flatten = function() {
  return this.reduce((acc, val) => [
    ...acc,
    ...val
  ], []);
};

global.strlog = str => 
  console.log(
    JSON.stringify(str, null, 2)
  );

const promiseMapLimit = require('promise-map-limit');
Array.prototype.asyncMap = function(limit, asyncFn) {
  return promiseMapLimit(this, limit, asyncFn);
};

global.cTable = require('console.table');