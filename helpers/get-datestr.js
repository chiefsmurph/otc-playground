module.exports = (date = new Date()) => {
  const [year, month, day] = date.toLocaleDateString().split('-');
  return [month, day, year].join('-');
};