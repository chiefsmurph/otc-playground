module.exports = input => {
  console.log({ input })
  input = Array.isArray(input) ? input.join(' ') : input;
  const regex = /\$([A-Z]{3,5})/gi;
  const matches = input.match(regex);
  const tickers = matches ? matches.map(match => match.slice(1)) : [];
  // .map(t => t.toUpperCase());
  return tickers;
};