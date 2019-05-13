module.exports = (input, requireDollar) => {
  console.log({ input })
  input = Array.isArray(input) ? input.join(' ') : input;
  const regex = new RegExp(`${requireDollar ? '\\$' : ''}([A-Z]{3,5})`, 'g');
  const matches = input.match(regex);
  const tickers = matches ? matches.map(match => match.slice(1)) : [];
  // .map(t => t.toUpperCase());
  return tickers;
};