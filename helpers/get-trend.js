module.exports = (oldVal, newVal) => {
  const change = oldVal - newVal;
  return change / oldVal * 100;
};