module.exports = (oldVal, newVal) => {
  const change = newVal - oldVal;
  return change / oldVal * 100;
};