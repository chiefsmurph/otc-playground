module.exports = input => {
  input = Array.isArray(input) ? input.join(' ') : input;
  const regex = /\w{3,5}/gi;
  const tickers = input.match(regex).map(t => t.toUpperCase());
  return tickers;
};