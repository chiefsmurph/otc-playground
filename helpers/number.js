
const number = number => number ? parseFloat(number.toString().replace(/,/g, '')) : undefined;

module.exports = number;