'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toObject = exports.entries = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.make = make;
exports.isTree = isTree;
exports.set = set;
exports.get = get;
exports.del = del;
exports.hasHash = hasHash;
exports.compressedTree = compressedTree;
exports.map = map;

var _hash = require('./hash');

var _hash2 = _interopRequireDefault(_hash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function log() {
  //eslint-disable-line no-unused-vars
  console.dir(this); // eslint-disable-line no-console
  return this;
}
var forEach = [].forEach;
var hasProp = {}.hasOwnProperty;

function replaceInArray(arr, pos, val) {
  return [].concat(_toConsumableArray(arr.slice(0, pos)), [val], _toConsumableArray(arr.slice(pos + 1)));
}

function memoize(fn) {
  var c = arguments.length <= 1 || arguments[1] === undefined ? new WeakMap() : arguments[1];
  var hasher = arguments.length <= 2 || arguments[2] === undefined ? function (i) {
    return i;
  } : arguments[2];

  return function () {
    var hash = hasher.apply(undefined, arguments);
    if (c.has(hash)) {
      return c.get(hash);
    }
    c.set(hash, fn.apply(undefined, arguments));
    return c.get(hash);
  };
}

var getHash = memoize(function () {
  var level = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
  var key = arguments[1];

  // generate a bucket between 0 - 31
  return (0, _hash2.default)(level + ':' + key, 5381) % 32;
}, new Map(), function (level, key) {
  return '' + level + key;
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
  var level = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

  return tree && hasProp.call(tree, 'hashes') && hasProp.call(tree, 'level') && tree.level === level;
}

function set(tree, key, value) {
  var hash = getHash(tree.level, key),
      hashes = tree.hashes;

  if (!hasHash(tree, key)) {
    return {
      level: tree.level,
      hashes: replaceInArray(hashes, hash, { key: key, value: value })
    };
  } else if (isTree(hashes[hash], tree.level + 1)) {
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
  } else if (isTree(hashes[hash], tree.level + 1)) {
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
  } else if (isTree(hashes[hash], tree.level + 1)) {
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

var entries = exports.entries = memoize(function (tree) {
  var arr = [];
  var hashes = tree.hashes;

  forEach.call(hashes, function (val) {
    if (!val) {
      return;
    }
    if (!isTree(val, tree.level + 1)) {
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

var toObject = exports.toObject = memoize(function (tree) {
  return entries(tree).reduce(function (o, _ref) {
    var _ref2 = _slicedToArray(_ref, 2);

    var key = _ref2[0];
    var value = _ref2[1];
    return o[key] = value, o;
  }, {});
});

function compressedTree(t) {
  var level = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

  if (!isTree(t, level)) {
    return t;
  }
  var len = 0,
      hashes = t.hashes.reduce(function (o, val, i) {
    if (val) {
      len++;
      o[i] = compressedTree(val, level + 1);
    }
    return o;
  }, {});
  hashes.length = len;
  return {
    level: t.level,
    hashes: hashes
  };
}

function map(tree, fn) {
  var mapped = tree;
  entries(tree).forEach(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2);

    var key = _ref4[0];
    var value = _ref4[1];

    var computed = fn(value, key);
    if (computed !== value) {
      mapped = set(mapped, key, computed);
    }
  });
  return mapped;
}