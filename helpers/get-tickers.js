module.exports = (input, requireDollar) => {
  
  input = Array.isArray(input) ? input.join(' ') : input;
  const regex = new RegExp(`${requireDollar ? '\\$' : ''}([A-Z]{3,5})`, 'g');
  const matches = input.match(regex);
  // console.log({ input, matches, requireDollar })
  const tickers = requireDollar && matches && matches.length 
    ? matches.map(match => match.slice(1))
    : [];
  return tickers.map(t => t.toUpperCase());
};