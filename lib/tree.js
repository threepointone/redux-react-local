'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.entries = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.make = make;
exports.isTree = isTree;
exports.set = set;
exports.get = get;
exports.del = del;
exports.hasHash = hasHash;
exports.toObject = toObject;
exports.compressedTree = compressedTree;

var _hash = require('./hash');

var _hash2 = _interopRequireDefault(_hash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function log() {
  console.dir(this);
  return this;
}
var forEach = [].forEach;
var hasProp = {}.hasOwnProperty;

function replaceInArray(arr, pos, val) {
  return [].concat(_toConsumableArray(arr.slice(0, pos)), [val], _toConsumableArray(arr.slice(pos + 1)));
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
  return (0, _hash2.default)(level + ':' + key, 5381) % 32;
});

var make0 = {
  level: 0, hashes: new Array(32)
};
function make() {
  var level = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

  if (level === 0) {
    return make0;
  }
  return {
    level: level, hashes: new Array(32)
  };
}

function isTree(tree) {
  return tree && hasProp.call(tree, 'hashes') && hasProp.call(tree, 'level');
}

function set(tree, key, value) {
  var hash = getHash(tree.level, key),
      hashes = tree.hashes;

  if (!hasHash(tree, key)) {
    return {
      level: tree.level,
      hashes: replaceInArray(hashes, hash, { key: key, value: value })
    };
  } else if (isTree(hashes[hash])) {
    var afterSet = set(hashes[hash], key, value);
    if (afterSet === hashes[hash]) {
      return tree;
    }
    return {
      level: tree.level,
      hashes: replaceInArray(hashes, hash, afterSet)
    };
  } else {
    if (hashes[hash].key === key) {
      if (hashes[hash].value === value) {
        return tree;
      }
      return {
        level: tree.level,
        hashes: replaceInArray(hashes, hash, { key: key, value: value })
      };
    }
    return {
      level: tree.level,
      hashes: replaceInArray(hashes, hash, set(set(make(tree.level + 1), hashes[hash].key, hashes[hash].value), key, value))
    };
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
      return {
        level: tree.level,
        hashes: replaceInArray(hashes, hash, undefined)
      };
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

  forEach.call(hashes, function (val) {
    if (!val) {
      return;
    }
    if (!isTree(val)) {
      arr.push([val.key, val.value]);
      return;
    } else {
      arr = arr.concat(entries(val));
    }
  });
  return arr;
});

function hasHash(tree, key) {
  return !!tree.hashes[getHash(tree.level, key)];
}

function toObject(tree) {
  return entries(tree).reduce(function (o, _ref) {
    var _ref2 = _slicedToArray(_ref, 2);

    var key = _ref2[0];
    var value = _ref2[1];
    return o[key] = value, o;
  }, {});
}

function compressedTree(t) {
  if (!isTree(t)) {
    return t;
  }
  var len = 0,
      hashes = t.hashes.reduce(function (o, val, i) {
    if (val) {
      len++;
      o[i] = compressedTree(val);
    }
    return o;
  }, {});
  hashes.length = len;
  return {
    level: t.level,
    hashes: hashes
  };
}

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