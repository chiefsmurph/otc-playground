const avgArray = arr => {
  const sum = arr.reduce((acc, val) => acc + val, 0);
  return +(sum / arr.length).toFixed(2);
};

const percUp = arr => arr.filter(v => v > 0).length / arr.length;

const hundredResult = arr =>
  arr.reduce((acc, perc) => acc * (perc / 100 + 1), 100);


module.exports = {
  avgArray,
  percUp,
  hundredResult
};