'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toObject = exports.entries = exports.make = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.isTree = isTree;
exports.get = get;
exports.set = set;
exports.del = del;
exports.hasHash = hasHash;
exports.compressedTree = compressedTree;
exports.map = map;

var _hash = require('./hash');

var _hash2 = _interopRequireDefault(_hash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } /*
                                                                                                                                                                                                    
                                                                                                                                                                                                    The big idea here - we want a key value store (where keys are strings) that is immutable, with fairly fast reads and write.
                                                                                                                                                                                                    
                                                                                                                                                                                                    If we used a regular object, we'd make copies with assign like so
                                                                                                                                                                                                    o2 = {...o1, [key]: value}
                                                                                                                                                                                                    
                                                                                                                                                                                                    this has an O(N) complexity on the number of keys in the object
                                                                                                                                                                                                    
                                                                                                                                                                                                    Instead, we steal an idea from clojure, and store the data in a tree of sorts.
                                                                                                                                                                                                    
                                                                                                                                                                                                    Trees have O(logN) reads and writes, and with some memoization, we can get slightly better perf than that.
                                                                                                                                                                                                    
                                                                                                                                                                                                    Further, these trees uses arrays at their nodes to store actual info, which are relatively fast for copies
                                                                                                                                                                                                    
                                                                                                                                                                                                    */


// murmur3 hashing
function log() {
  //eslint-disable-line no-unused-vars
  console.dir(this); // eslint-disable-line no-console
  return this;
}
var forEach = [].forEach;
var hasProp = {}.hasOwnProperty;

// Add iterator to each tree and mimic Map behaviour in order to achieve better look in the Redux Dev Tools
function wrapTree(t) {
  function createTreeIterator(t) {
    var treeEntries = entries(t);
    var cur = 0;

    return {
      next: function next() {
        return cur < treeEntries.length ? { done: false, value: treeEntries[cur++] } : { done: true };
      }
    };
  }

  t[Symbol.iterator] = function () {
    return createTreeIterator(t);
  };
  // We need to define dummy 'set' method in order to mimic Map behaviour in the eyes of Redux Dev Tools
  t.set = function () {};

  return t;
}

// helper to makes a copy of an array with a new value at given position
function replaceInArray(arr, pos, val) {
  return [].concat(_toConsumableArray(arr.slice(0, pos)), [val], _toConsumableArray(arr.slice(pos + 1)));
}

// generic memoizer on functions. because we use WeakMap,
// we don't really worry about garbage collection
// when the keys are no longer referenced
function memoize(fn) {
  var c = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new WeakMap();
  var keyFn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function (i) {
    return i;
  };

  return function () {
    var key = keyFn.apply(undefined, arguments);
    if (c.has(key)) {
      return c.get(key);
    }
    c.set(key, fn.apply(undefined, arguments));
    return c.get(key);
  };
}

// takes a tree level and key, and returns a slot from 0 - 31
var getHash = memoize(function () {
  var level = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var key = arguments[1];

  // generate a bucket between 0 - 31
  return (0, _hash2.default)(level + ':' + key, 5381) % 32;
}, new Map(), function (level, key) {
  return '' + level + key;
});
// nb: there's a memory leak here because Maps hold strong references,
// but we can just flush this periodically if needed

var make = exports.make = function make() {
  var level = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

  return wrapTree({
    level: level, slots: new Array(32)
  });
};

// helper on checking whether something is 'tree' like
function isTree(tree) {
  var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

  return tree && hasProp.call(tree, 'slots') && hasProp.call(tree, 'level') && tree.level === level;
}

// we steal this from clojure
// a tree is made of an array of 32 slots
// each slot may be
// undefined
// a key/value pair
// yet another tree

// so to get values from this tree
// we simply walk it based on the hashe for each level
// until we get a key/value pair
function get(tree, key) {
  var hash = getHash(tree.level, key),
      slots = tree.slots;


  if (!hasHash(tree, key)) {
    return;
  } else if (isTree(slots[hash], tree.level + 1)) {
    // recurse
    return get(slots[hash], key);
  } else {
    // return value
    if (slots[hash].key === key) {
      return slots[hash].value;
    }
  }
}

// similarly, to set a value in a tree
// we recursively walk the tree till we find the slot where it should live
// and return copies of just the affected subtree with he new value in place

function set(tree, key, value) {
  var hash = getHash(tree.level, key),
      slots = tree.slots;

  // simple set
  if (!hasHash(tree, key)) {
    return wrapTree({
      level: tree.level,
      slots: replaceInArray(slots, hash, { key: key, value: value })
    });
  } else if (isTree(slots[hash], tree.level + 1)) {
    // recurse down
    var afterSet = set(slots[hash], key, value);
    if (afterSet === slots[hash]) {
      // prevents a new object if nothing's changed
      return tree;
    }
    return wrapTree({
      level: tree.level,
      slots: replaceInArray(slots, hash, afterSet)
    });
  } else {
    // update in place
    if (slots[hash].key === key) {
      if (slots[hash].value === value) {
        return tree;
      }
      return wrapTree({
        level: tree.level,
        slots: replaceInArray(slots, hash, { key: key, value: value })
      });
    }
    // replace key value pair with a nested tree
    return wrapTree({
      level: tree.level,
      slots: replaceInArray(slots, hash, set(set(make(tree.level + 1), slots[hash].key, slots[hash].value), key, value))
    });
  }
}

// to delete a key from the tree
// simply walk the tree till you find the slot
// and return recursive copies of the array without it
// todo - reclaim empty arrays
function del(tree, key) {
  var hash = getHash(tree.level, key),
      slots = tree.slots;


  if (!hasHash(tree, key)) {
    return tree;
  } else if (isTree(slots[hash], tree.level + 1)) {
    var sub = del(slots[hash], key);
    if (slots[hash] !== sub) {
      return wrapTree({
        level: tree.level,
        slots: replaceInArray(slots, hash, sub)
      });
    }
    return tree;
  } else {
    if (slots[hash].key === key && slots[hash].value !== undefined) {
      return wrapTree({
        level: tree.level,
        slots: replaceInArray(slots, hash, undefined)
      });
    }
    return tree;
  }
}

// converts a tree to a [key, value] array
var entries = exports.entries = memoize(function (tree) {
  var arr = [];
  var slots = tree.slots;

  forEach.call(slots, function (val) {
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
  return !!tree.slots[getHash(tree.level, key)];
}

// converts a tree to an object
var toObject = exports.toObject = memoize(function (tree) {
  return entries(tree).reduce(function (o, _ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        key = _ref2[0],
        value = _ref2[1];

    return o[key] = value, o;
  }, {});
});

// this is a helper when serializing from/to server side
// simply replaces arrays [foo, bar] with objects {0: foo, 1: bar, length: 2}
// this is useful when sending sparse arrays over the wire
function compressedTree(t) {
  var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

  if (!isTree(t, level)) {
    return t;
  }
  var len = 0,
      slots = t.slots.reduce(function (o, val, i) {
    if (val) {
      len++;
      o[i] = compressedTree(val, level + 1);
    }
    return o;
  }, {});
  slots.length = len;
  return {
    level: t.level,
    slots: slots
  };
}

// I don't use this, but it's a way to 'map' over all the values in the tree
// and 'replace' with new values
function map(tree, fn) {
  var mapped = tree;
  entries(tree).forEach(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
        key = _ref4[0],
        value = _ref4[1];

    var computed = fn(value, key);
    if (computed !== value) {
      mapped = set(mapped, key, computed);
    }
  });
  return mapped;
}