'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.entries = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.make = make;
exports.isTree = isTree;
exports.set = set;
exports.get = get;
exports.del = del;
exports.hasHash = hasHash;
exports.toObject = toObject;

var _hash = require('./hash');

var _hash2 = _interopRequireDefault(_hash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function log() {
  console.dir(this);
  return this;
}
var hasProp = {}.hasOwnProperty;

function omit(obj, key) {
  if (!hasProp.call(obj, key)) {
    return obj;
  }
  return Object.keys(obj).reduce(function (o, k) {
    return k === key ? o : (o[k] = obj[k], o);
  }, {});
}

function memoizeHasher(fn) {
  var cache = new Map();
  return function (level, key) {
    var lk = '' + level + key;
    if (cache.has(lk)) {
      return cache.get(lk);
    }
    cache.set(lk, fn(level, key));
    return cache.get(lk);
  };
}

var getHash = memoizeHasher(function () {
  var level = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
  var key = arguments[1];

  // generate a number between 0 - 31
  return (0, _hash2.default)(level + ':' + key, 5381) % 32 + '';
});

function make() {
  var level = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

  return {
    level: level, hashes: {}
  };
}

function isTree(tree) {
  return tree && hasProp.call(tree, 'hashes') && hasProp.call(tree, 'level');
}

function set(tree, key, value) {
  var hash = getHash(tree.level, key),
      hashes = tree.hashes;

  if (!hasHash(tree, key)) {
    return _extends({}, tree, {
      hashes: _extends({}, hashes, _defineProperty({}, hash, { key: key, value: value }))
    });
  } else if (isTree(hashes[hash])) {
    return _extends({}, tree, {
      hashes: _extends({}, hashes, _defineProperty({}, hash, set(hashes[hash], key, value)))
    });
  } else {
    if (hashes[hash].key === key) {
      if (hashes[hash].value === value) {
        return tree;
      }
      return _extends({}, tree, {
        hashes: _extends({}, hashes, _defineProperty({}, hash, { key: key, value: value }))
      });
    }
    return _extends({}, tree, {
      hashes: _extends({}, hashes, _defineProperty({}, hash, set(set(make(tree.level + 1), hashes[hash].key, hashes[hash].value), key, value)))
    });
  }
}

function get(tree, key) {
  var hash = getHash(tree.level, key);
  var hashes = tree.hashes;


  if (!hasHash(tree, key)) {
    return;
  } else if (isTree(hashes[hash])) {
    return get(hashes[hash], key);
  } else {
    if (hashes[hash].key === key) {
      return hashes[hash].value;
    }
  }
}

function del(tree, key) {
  var hash = getHash(tree.level, key);
  var hashes = tree.hashes;


  if (!hasHash(tree, key)) {
    return tree;
  } else if (isTree(hashes[hash])) {
    return del(hashes[hash], key);
  } else {
    if (hashes[hash].key === key) {
      return _extends({}, tree, {
        hashes: omit(hashes, hash)
      });
    }
    return tree;
  }
}

function memoizeEntries(fn) {
  var cache = new WeakMap();
  return function (o) {

    if (cache.has(o)) {
      return cache.get(o);
    }
    cache.set(o, fn(o));
    return cache.get(o);
  };
}

var entries = exports.entries = memoizeEntries(function (tree) {
  var arr = [];
  var hashes = tree.hashes;
  Object.keys(hashes).forEach(function (key) {
    if (!isTree(hashes[key])) {
      arr.push([hashes[key].key, hashes[key].value]);
    } else {
      arr = arr.concat(entries(hashes[key]));
    }
  });
  return arr;
});

// todo - more performant
// export function map(tree, fn) {
//   let mapped = tree
//   entries(tree).forEach(([ key, value ]) => {
//     let computed = fn(value, key)
//     if(computed !== value) {
//       mapped = set(mapped, key, computed)
//     }
//   })
//   return mapped
// }

function hasHash(tree, key) {
  var _context;

  return (_context = tree.hashes, hasProp).call(_context, getHash(tree.level, key));
}

function toObject(tree) {
  return entries(tree).reduce(function (o, _ref) {
    var _ref2 = _slicedToArray(_ref, 2);

    var key = _ref2[0];
    var value = _ref2[1];
    return o[key] = value, o;
  }, {});
}