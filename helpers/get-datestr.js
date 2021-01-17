module.exports = (date = new Date()) => {
  console.log({ origDataStr: date.toLocaleDateString() });
  const [month, day, year] = date.toLocaleDateString().split('/');
  return [month, day, year].join('-');
};