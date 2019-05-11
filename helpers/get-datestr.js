module.exports = () => {
  const [year, month, day] = (new Date).toLocaleDateString().split('-');
  return [month, day, year].join('-');
};