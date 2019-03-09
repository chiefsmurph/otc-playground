
const number = number => number ? parseFloat(number.replace(/,/g, '')) : undefined;

module.exports = number;