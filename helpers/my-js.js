Array.prototype.flatten = function() {
  return this.reduce((acc, val) => [
    ...acc,
    ...val
  ], []);
};