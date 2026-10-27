const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });
const clearProductsCache = () => {
  const keys = cache.keys().filter((k) => k.startsWith('products:'));
  cache.del(keys);
};

module.exports = { cache, clearProductsCache };