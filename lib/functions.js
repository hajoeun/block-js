const go = (seed, ...fns) => fns.reduce((res, f) => f(res), seed);
const each = (coll, fn) => Array.isArray(coll) ? coll.forEach(fn) : Object.keys(coll).forEach(key => fn(coll[key], key, coll));
const keys = obj => Object.keys(obj);
const reduce = (coll, fn, seed) => Array.isArray(coll) ? coll.reduce(fn, seed) : keys(coll).reduce((res, key) => fn(res, coll[key], key, coll), seed);
const every = (coll, fn) => Array.isArray(coll) ? coll.every(fn) : keys(coll).every(key => fn(coll[key], key, coll));

module.exports = { go, each, keys, reduce, every };