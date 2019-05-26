const sum = arr => arr.reduce((acc, val) => acc + val, 0);

const avg = arr => {
  return +(sum(arr) / arr.length).toFixed(2);
};

const percUp = arr => arr.filter(v => v > 0).length / arr.length;

const hundredResult = arr =>
  arr.reduce((acc, perc) => acc * (perc / 100 + 1), 100);

module.exports = {
  sum,
  avg,
  percUp,
  hundredResult
};