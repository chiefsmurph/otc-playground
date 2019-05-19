
module.exports = async collectionStr => {
  if (!collectionStr) return console.log('enter a collectionName');
  const collectionFn = require(`../collections/${collectionStr}`);
  const response = await collectionFn();
  console.log(response.map(t => t.symbol));
  console.log('total', response.length, 'stocks');
};