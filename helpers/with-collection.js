// defaults
const COUNT = 300;
const MIN_PRICE = 0.0004;
const MAX_PRICE = 0.013;

module.exports = scanFn => {

  return async (
    count = COUNT,
    collectionStr = 'all',
    minPrice = MIN_PRICE,
    maxPrice = MAX_PRICE,
    ...args
  ) => {

    if (collectionStr === 'none' || collectionStr === null) {
      console.log('skipping collection');
      return [];
    }

    console.log('getting collection', {
      collectionStr,
      count,
      minPrice,
      maxPrice
    });

    const collectionFn = require(`../collections/${collectionStr}`);
    const records = await collectionFn(minPrice, maxPrice);
    const sliced = records.slice(0, count);

    console.log({ 
      totalCount: records.length, 
      sliced: sliced.length 
    });

    const response = await scanFn(sliced, ...args)

    const prefixed = (collectionStr === 'all') || !response || !response.length
      ? response
      : (() => {
        const format = typeof response[0] === 'string' ? 'strings' : 'objects';
        return format === 'strings' 
          ? { [collectionStr]: response } 
          : response.map(record => {
            return Object.keys(record).reduce((acc, key) => ({
              ...acc,
              [key === 'symbol' ? key : `${collectionStr}-${key}`]: record[key]
            }), {});
          });
      })();

    return prefixed;
  };

};