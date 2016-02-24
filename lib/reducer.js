'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = localReducer;

var _tree = require('./tree');

var T = _interopRequireWildcard(_tree);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var identity = function identity(x) {
  return x;
};


function get(key) {
  return T.get(this.$$tree, key);
}

// too - .get when initialState is passed
function localReducer() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? {
    $$tree: T.make(),
    $$fns: T.make(),
    $$changed: T.make()
  } : arguments[0];
  var action = arguments[1];

  // ack!
  state.get = state.get || get;
  state.$$tree = state.$$tree || T.make();
  state.$$fns = state.$$fns || T.make();
  state.$$changed = state.$$changed || T.make();

  switch (action.type) {
    case '$$local.flushed':
      return flush(state, action);
    case '$$local.setState':
      return setState(state, action);
    case '$$local.register':
      return register(state, action);
    case '$$local.swap':
      return swap(state, action);
    case '$$local.unmount':
      return unmount(state, action);
    default:
      return reduceAll(state, action);
  }
}

function flush(state) {
  return _extends({}, state, {
    $$changed: T.make()
  });
}

function setState(state, _ref) {
  var payload = _ref.payload;

  if (payload.state === undefined) {
    throw new Error('cannot set undefined as local state');
  }

  return _extends({}, state, {
    $$tree: T.set(state.$$tree, payload.ident, payload.state),
    $$changed: T.set(state.$$changed, payload.ident, true)
  });
}

function register(state, action) {
  var _action$payload = action.payload;
  var ident = _action$payload.ident;
  var initial = _action$payload.initial;
  var reducer = _action$payload.reducer;
  var fn = T.get(state.$$fns, ident);

  if (fn && fn !== identity && fn !== reducer) {
    throw new Error('local key ' + ident + ' already exists');
  }
  // this way we can 'persist' across unmounts
  // also makes preloading data simple
  var prevState = T.get(state.$$tree, ident);
  return _extends({}, state, {
    $$tree: prevState ? state.$$tree : T.set(state.$$tree, ident, initial),
    $$fns: T.set(state.$$fns, ident, reducer),
    $$changed: T.set(state.$$changed, ident, true)
  });
}

function swap(state, action) {
  var payload = action.payload;

  return register(unmount(state, action), _extends({}, action, {
    payload: _extends({}, payload, {
      ident: payload.next
    })
  }));
}

function unmount(state, action) {
  var _action$payload2 = action.payload;
  var persist = _action$payload2.persist;
  var ident = _action$payload2.ident;

  if (persist) {
    return _extends({}, state, {
      $$fns: T.set(state.$$fns, ident, identity) // we use this as a signal that it's been unmounted
    });
  } else {
      return _extends({}, state, {
        $$tree: T.del(state.$$tree, ident),
        $$fns: T.del(state.$$fns, ident)
      });
    }
}

function memoizeRsToOb(fn) {
  var cache = new WeakMap();
  return function (o) {

    if (cache.has(o)) {
      return cache.get(o);
    }
    cache.set(o, fn(o));
    return cache.get(o);
  };
}

var fnToOb = memoizeRsToOb(T.toObject);

function reduceAll(state, action) {
  // update all local keys
  var _action$meta = action.meta;
  _action$meta = _action$meta === undefined ? {} : _action$meta;
  var ident = _action$meta.ident;
  var local = _action$meta.local;
  var $$fns = state.$$fns;var changed = [];
  var reducers = fnToOb($$fns);

  var t = state.$$tree,
      entries = T.entries(state.$$tree);
  entries.forEach(function (_ref2) {
    var _ref3 = _slicedToArray(_ref2, 2);

    var key = _ref3[0];
    var value = _ref3[1];

    var $action = action;
    // if this originated from the same key, then add me: true
    if (key === ident && local) {
      $action = _extends({}, $action, { me: true });
    }

    // reduce
    var computed = reducers[key] ? reducers[key](value, $action) : value;

    if (computed === undefined) {
      throw new Error('did you forget to return state from the ' + key + ' reducer?'); // eslint-disable-line no-console
    }

    if (computed !== value) {
      t = T.set(t, key, computed);
      changed.push(key);
    }
  });

  return changed.length > 0 ? _extends({}, state, {
    $$tree: t,
    $$changed: changed.reduce(function (c, key) {
      return T.set(c, key, true);
    }, state.$$changed)
  }) : state;
}